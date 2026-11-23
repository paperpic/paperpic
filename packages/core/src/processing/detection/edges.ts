import type { Size } from '../types'
import type { Planes } from './planes'
import { blur, mapChannels } from './planes'

/**
 * The edges of a small copy of an image. Each pixel holds how fast its tones get brighter across and down, and the
 * strength of that change, where 1 is a clear edge for this image.
 */
export interface Edges extends Size {
  across: Float32Array
  down: Float32Array
  strength: Float32Array
}

/** A clear edge is this part of the strength that only the strongest pixels of the image pass. */
const CLEAR_SHARE = 0.35
const STRONGEST = 0.98
/** The least strength of a clear edge, in levels per pixel, so the noise of a plain image does not count as one. */
const MIN_CLEAR = 10

function quantile(values: Float32Array, fraction: number): number {
  const sorted = values.slice().sort()
  return sorted[Math.floor((sorted.length - 1) * fraction)]!
}

/** Finds the edges of an image. Each pixel takes the change of the channel that changes most, so a color edge counts as much as a gray one. */
export function findEdges(planes: Planes): Edges {
  const { width, height, channels } = mapChannels(planes, blur)
  const across = new Float32Array(width * height)
  const down = new Float32Array(width * height)
  const strength = new Float32Array(width * height)

  for (const channel of channels) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1, pixel = y * width + 1; x < width - 1; x++, pixel++) {
        const topLeft = channel[pixel - width - 1]!
        const topRight = channel[pixel - width + 1]!
        const bottomLeft = channel[pixel + width - 1]!
        const bottomRight = channel[pixel + width + 1]!
        const changeAcross = (topRight + 2 * channel[pixel + 1]! + bottomRight - topLeft - 2 * channel[pixel - 1]! - bottomLeft) / 8
        const changeDown = (bottomLeft + 2 * channel[pixel + width]! + bottomRight - topLeft - 2 * channel[pixel - width]! - topRight) / 8
        const change = Math.sqrt(changeAcross * changeAcross + changeDown * changeDown)
        if (change > strength[pixel]!) {
          strength[pixel] = change
          across[pixel] = changeAcross
          down[pixel] = changeDown
        }
      }
    }
  }

  const clear = Math.max(MIN_CLEAR, CLEAR_SHARE * quantile(strength, STRONGEST))
  for (let pixel = 0; pixel < strength.length; pixel++) {
    across[pixel]! /= clear
    down[pixel]! /= clear
    strength[pixel]! /= clear
  }

  return {
    across,
    down,
    strength,
    width,
    height,
  }
}
