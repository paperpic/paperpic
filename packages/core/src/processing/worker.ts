import type { PipelineStep } from '../pipeline/operations'
import type { PreparedThreshold } from './threshold'
import type { PixelBuffer } from './types'
import { applySteps } from '../pipeline/pipeline'
import { prepareThreshold } from './threshold'

/**
 * A job for the processing worker: run the steps, or run them and prepare a threshold on the result. The pixel buffer
 * is transferred, so the sender loses access to it.
 */
export interface WorkerRequest {
  id: number
  operation: 'pipeline' | 'prepare'
  source: PixelBuffer
  steps: readonly PipelineStep[]
}

/**
 * What the worker sends: that it loaded and can take jobs, or the answer to a job, with the time the operation took.
 */
export type WorkerResponse
  = | { ready: true }
    | { id: number, milliseconds: number, result: PixelBuffer }
    | { id: number, milliseconds: number, prepared: PreparedThreshold }
    | { error: string, id: number }

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage: (message: WorkerResponse, transfer: Transferable[]) => void
}

const scope = globalThis as unknown as WorkerScope

scope.onmessage = ({ data: request }) => {
  try {
    const start = performance.now()
    if (request.operation === 'prepare') {
      const prepared = prepareThreshold(applySteps(request.source, request.steps))
      scope.postMessage({ id: request.id, prepared, milliseconds: performance.now() - start }, [prepared.ratios.buffer as ArrayBuffer])
      return
    }
    const result = applySteps(request.source, request.steps)
    const milliseconds = performance.now() - start
    scope.postMessage({ id: request.id, result, milliseconds }, [result.data.buffer as ArrayBuffer])
  }
  catch (error) {
    scope.postMessage({
      id: request.id,
      error: String(error),
    }, [])
  }
}

scope.postMessage({ ready: true }, [])
