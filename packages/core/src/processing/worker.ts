import type { PipelineStep } from '../pipeline/operations'
import type { PreparedThreshold, ThresholdOptions } from './threshold'
import type { PixelBuffer, Quad } from './types'
import { applySteps } from '../pipeline/pipeline'
import { adaptiveThreshold, prepareThreshold } from './threshold'
import { warpPerspective } from './warp'

/** A job for the processing worker. The pixel buffer is transferred, so the sender loses access to it. */
export type WorkerRequest
  = | { id: number, operation: 'pipeline', source: PixelBuffer, steps: readonly PipelineStep[] }
    | { id: number, operation: 'prepare', source: PixelBuffer, steps: readonly PipelineStep[] }
    | { id: number, operation: 'threshold', source: PixelBuffer, options?: ThresholdOptions }
    | { id: number, operation: 'warp', source: PixelBuffer, quad: Quad, width: number, height: number }

/**
 * What the worker sends: that it loaded and can take jobs, or the answer to a job, with the time the operation took.
 */
export type WorkerResponse
  = | { ready: true }
    | { id: number, result: PixelBuffer, milliseconds: number }
    | { id: number, prepared: PreparedThreshold, milliseconds: number }
    | { id: number, error: string }

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage: (message: WorkerResponse, transfer: Transferable[]) => void
}

function run(request: Exclude<WorkerRequest, { operation: 'prepare' }>): PixelBuffer {
  switch (request.operation) {
    case 'pipeline':
      return applySteps(request.source, request.steps)
    case 'threshold':
      return adaptiveThreshold(request.source, request.options)
    case 'warp':
      return warpPerspective(request.source, request.quad, request.width, request.height)
  }
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
    const result = run(request)
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
