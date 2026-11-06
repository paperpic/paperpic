import type { PixelBuffer } from '../processing/types'
import type { WorkerResponse } from '../processing/worker'
import type { PipelineStep } from './operations'
import { applySteps } from './pipeline'

/** How long a worker can take to start before the main thread does the work instead. */
const WORKER_START_LIMIT = 5000

/**
 * Runs the pipeline in a worker, so large images do not freeze the page.
 * If a worker cannot start, for example because a Content Security Policy blocks it, the main thread does the work.
 */
export class PipelineRunner {
  private worker: Promise<Worker | null> | null = null
  private rejectJob: ((reason: Error) => void) | null = null
  private abandonStart: (() => void) | null = null
  private current: Worker | null = null
  private nextId = 0
  private destroyed = false

  /** Runs the steps. The buffer of `source` is transferred to the worker, so it cannot be used afterwards. */
  async run(source: PixelBuffer, steps: readonly PipelineStep[]): Promise<PixelBuffer> {
    this.worker ??= this.start()
    const worker = await this.worker
    if (this.destroyed) {
      throw new Error('The viewer was destroyed while processing.')
    }
    return worker
      ? this.runInWorker(worker, source, steps)
      : applySteps(source, steps)
  }

  /** Stops the worker, even one still starting. A job in progress fails. */
  destroy(): void {
    this.destroyed = true
    this.abandonStart?.()
    this.current?.terminate()
    this.current = null
    this.rejectJob?.(new Error('The viewer was destroyed while processing.'))
    this.rejectJob = null
  }

  /**
   * Waits for the worker to report that it loaded. Sending a job earlier would lose its pixels if the worker
   * turns out to be blocked, because they are transferred and not copied.
   */
  private start(): Promise<Worker | null> {
    return new Promise((resolve) => {
      let worker: Worker
      try {
        // Bundlers need this exact form to find the file. The build rewrites the path for the published package.
        worker = new Worker(new URL('../processing/worker.ts', import.meta.url), { type: 'module' })
      }
      catch {
        resolve(null)
        return
      }

      this.current = worker
      let timer: ReturnType<typeof setTimeout> | undefined
      const settle = (result: Worker | null) => {
        clearTimeout(timer)
        this.abandonStart = null
        if (!result) {
          worker.terminate()
          this.current = null
        }
        resolve(result)
      }
      timer = setTimeout(settle, WORKER_START_LIMIT, null)
      this.abandonStart = () => settle(null)

      worker.onerror = () => settle(null)
      worker.onmessage = () => settle(worker)
    })
  }

  private runInWorker(worker: Worker, source: PixelBuffer, steps: readonly PipelineStep[]): Promise<PixelBuffer> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++
      this.rejectJob = reject
      worker.onerror = (event) => {
        // It may be dead, as when it runs out of memory, so the next job starts a new one
        worker.terminate()
        this.current = null
        this.worker = null
        this.rejectJob = null
        reject(new Error(`The image could not be processed: ${event.message}`))
      }
      worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
        if ('ready' in data || data.id !== id) {
          return
        }
        this.rejectJob = null
        if ('error' in data) {
          reject(new Error(data.error))
        }
        else {
          resolve(data.result)
        }
      }
      worker.postMessage({
        id,
        operation: 'pipeline',
        source,
        steps,
      }, [source.data.buffer as ArrayBuffer])
    })
  }
}
