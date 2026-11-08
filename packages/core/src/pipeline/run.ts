import type { PreparedThreshold } from '../processing/threshold'
import type { PixelBuffer } from '../processing/types'
import type { WorkerResponse } from '../processing/worker'
import type { PipelineStep } from './operations'
import { prepareThreshold } from '../processing/threshold'
import { applySteps } from './pipeline'

type JobResponse = Exclude<WorkerResponse, { ready: true } | { error: string }>

interface Job {
  resolve: (response: JobResponse) => void
  reject: (reason: Error) => void
}

/** How long a worker can take to start before the main thread does the work instead. */
const WORKER_START_LIMIT = 5000

/**
 * Runs the pipeline in a worker, so large images do not freeze the page.
 * If a worker cannot start, for example because a Content Security Policy blocks it, the main thread does the work.
 */
export class PipelineRunner {
  private worker: Promise<Worker | null> | null = null
  private readonly jobs = new Map<number, Job>()
  private abandonStart: (() => void) | null = null
  private current: Worker | null = null
  private nextId = 0
  private destroyed = false

  /** Runs the steps. The buffer of `source` is transferred to the worker, so it cannot be used afterwards. */
  async run(source: PixelBuffer, steps: readonly PipelineStep[]): Promise<PixelBuffer> {
    const worker = await this.ready()
    return worker
      ? this.send(worker, 'pipeline', source, steps, response => (response as { result: PixelBuffer }).result)
      : applySteps(source, steps)
  }

  /** Runs the steps and prepares a threshold on the result, which a slider can then change at once. The buffer is transferred too. */
  async prepare(source: PixelBuffer, steps: readonly PipelineStep[]): Promise<PreparedThreshold> {
    const worker = await this.ready()
    return worker
      ? this.send(worker, 'prepare', source, steps, response => (response as { prepared: PreparedThreshold }).prepared)
      : prepareThreshold(applySteps(source, steps))
  }

  private async ready(): Promise<Worker | null> {
    this.worker ??= this.start()
    const worker = await this.worker
    if (this.destroyed) {
      throw new Error('The viewer was destroyed while processing.')
    }
    return worker
  }

  /** Stops the worker, even one still starting. A job in progress fails. */
  destroy(): void {
    this.destroyed = true
    this.abandonStart?.()
    this.current?.terminate()
    this.current = null
    this.rejectJobs(new Error('The viewer was destroyed while processing.'))
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
      worker.onmessage = () => {
        this.listen(worker)
        settle(worker)
      }
    })
  }

  private listen(worker: Worker): void {
    worker.onerror = (event) => {
      // It may be dead, as when it runs out of memory, so the next job starts a new one
      worker.terminate()
      this.current = null
      this.worker = null
      this.rejectJobs(new Error(`The image could not be processed: ${event.message}`))
    }
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if ('ready' in data) {
        return
      }
      const job = this.jobs.get(data.id)
      this.jobs.delete(data.id)
      if ('error' in data) {
        job?.reject(new Error(data.error))
      }
      else {
        job?.resolve(data)
      }
    }
  }

  private rejectJobs(reason: Error): void {
    for (const job of this.jobs.values()) {
      job.reject(reason)
    }
    this.jobs.clear()
  }

  private send<Result>(
    worker: Worker,
    operation: 'pipeline' | 'prepare',
    source: PixelBuffer,
    steps: readonly PipelineStep[],
    pick: (response: JobResponse) => Result,
  ): Promise<Result> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++
      this.jobs.set(id, {
        resolve: response => resolve(pick(response)),
        reject,
      })
      worker.postMessage({
        id,
        operation,
        source,
        steps,
      }, [source.data.buffer as ArrayBuffer])
    })
  }
}
