import type { ThresholdOptions } from './threshold'
import type { PixelBuffer, Quad } from './types'
import { adaptiveThreshold } from './threshold'
import { warpPerspective } from './warp'

/** A job for the processing worker. The pixel buffer is transferred, so the sender loses access to it. */
export type WorkerRequest
  = | { id: number, operation: 'threshold', source: PixelBuffer, options?: ThresholdOptions }
    | { id: number, operation: 'warp', source: PixelBuffer, quad: Quad, width: number, height: number }

/** The answer to a job, with the time the operation took inside the worker. */
export type WorkerResponse
  = | { id: number, result: PixelBuffer, milliseconds: number }
    | { id: number, error: string }

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage: (message: WorkerResponse, transfer: Transferable[]) => void
}

function run(request: WorkerRequest): PixelBuffer {
  switch (request.operation) {
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
