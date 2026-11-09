import type { Point } from '../processing/types'
import type { Size } from '../state/view'
import type { PipelineStep } from './operations'
import { estimateOutputSize, scaleQuad } from '../processing/homography'

/** Where the image on display sits in the photo it comes from, turned the same way. */
export interface PhotoFrame {
  /** The top left corner of the image on display, in pixels of the photo. */
  origin: Point
  photo: Size
}

/**
 * Follows crops, rotations and flips back to the photo, because estimating proportions needs its center.
 * After a perspective change that center no longer means anything, so the result counts as a new photo.
 */
export function photoFrame(image: Size, steps: readonly PipelineStep[]): PhotoFrame {
  let photo: Size = { width: image.width, height: image.height }
  let origin: Point = { x: 0, y: 0 }
  let region: Size = photo

  for (const step of steps) {
    switch (step.type) {
      case 'rotate':
        for (let turns = step.rotation / 90; turns > 0; turns--) {
          origin = { x: photo.height - origin.y - region.height, y: origin.x }
          photo = { width: photo.height, height: photo.width }
          region = { width: region.height, height: region.width }
        }
        break
      case 'flip':
        origin = { x: photo.width - origin.x - region.width, y: origin.y }
        break
      case 'crop':
        origin = { x: origin.x + step.rect.x * region.width, y: origin.y + step.rect.y * region.height }
        region = { width: step.rect.width * region.width, height: step.rect.height * region.height }
        break
      case 'perspective':
        region = estimateOutputSize(scaleQuad(step.quad, region.width, region.height), region, { aspectRatio: step.aspectRatio })
        photo = region
        origin = { x: 0, y: 0 }
        break
      case 'threshold':
      case 'adjust':
        break
    }
  }
  return { photo, origin }
}
