import type { PreparedThreshold } from '../processing/threshold'
import type { PixelBuffer, Quad } from '../processing/types'
import type { PipelineStep } from './steps'
import { detectDocument } from '../processing/detection/detect-document'
import { prepareThreshold } from '../processing/threshold'
import { applySteps } from './steps'

/**
 * A job for the processing worker: run the steps, or run them and then prepare a threshold on the result, or look for
 * the document in it. The pixel buffer is transferred, so the sender loses access to it.
 */
export interface WorkerRequest {
  id: number
  operation: 'detect' | 'pipeline' | 'prepare'
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
    | { corners: Quad | null, id: number, milliseconds: number }
    | { error: string, id: number }

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage: (message: WorkerResponse, transfer: Transferable[]) => void
}

const scope = globalThis as unknown as WorkerScope

scope.onmessage = ({ data: request }) => {
  try {
    const start = performance.now()
    const result = applySteps(request.source, request.steps)
    if (request.operation === 'prepare') {
      const prepared = prepareThreshold(result)
      scope.postMessage({ id: request.id, prepared, milliseconds: performance.now() - start }, [prepared.ratios.buffer as ArrayBuffer])
      return
    }
    if (request.operation === 'detect') {
      const corners = detectDocument(result)
      scope.postMessage({ id: request.id, corners, milliseconds: performance.now() - start }, [])
      return
    }
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
