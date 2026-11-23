import type { PixelBuffer, Quad, Size } from '../types'
import type { Edges } from './edges'
import type { Features } from './features'
import { confidence } from './confidence'
import { findEdges } from './edges'
import { countBorders, measureFeatures } from './features'
import { borderUnder, settle } from './fit'
import { findLines } from './lines'
import { closing, mapChannels, shrink } from './planes'
import { findQuads, fromTopLeft, isSameQuad, MAX_BORDERS, signedArea } from './quads'

/** A shape that could be a document. */
export interface DocumentCandidate {
  features: Features
  /** Its corners, as fractions of the image. */
  quad: Quad
}

/** The longest side of the copy that the search works on. */
const SIDE = 256
/** Text on the copy has strokes narrower than twice this, in pixels. */
const TEXT_RADIUS = 4
/** The shapes to try on each set of edges. */
const MAX_SHAPES = 20
/** A photo with nothing around the document has nothing to straighten. */
const MAX_SIZE = 0.97
/** The sine of the sharpest corner, once the corners have settled. */
const MIN_CORNER = 0.5

/** Whether the corners of a shape go clockwise, and none is too sharp. */
function hasWideCorners(quad: Quad): boolean {
  return quad.every((corner, index) => {
    const next = quad[(index + 1) % 4]!
    const last = quad[(index + 2) % 4]!
    const turn = (next.x - corner.x) * (last.y - next.y) - (next.y - corner.y) * (last.x - next.x)
    return turn / (Math.hypot(next.x - corner.x, next.y - corner.y) * Math.hypot(last.x - next.x, last.y - next.y)) > MIN_CORNER
  })
}

/** Whether a shape that has settled can still be a document. */
function canBeDocument(quad: Quad, size: Size): boolean {
  return hasWideCorners(quad)
    && signedArea(quad) <= MAX_SIZE * size.width * size.height
    && countBorders(quad, size) <= MAX_BORDERS
}

/**
 * Turns corners given in pixels of the copy into fractions of the image. The sides that the photo cuts off go exactly on
 * its border.
 */
function toFractions(quad: Quad, size: Size): Quad {
  const fraction = (position: number, length: number) => position <= 0
    ? 0
    : position >= length - 1
      ? 1
      : (position + 0.5) / length
  return quad.map((corner, index) => {
    const { x, y } = {
      ...corner,
      ...borderUnder(quad[(index + 3) % 4]!, corner, size),
      ...borderUnder(corner, quad[(index + 1) % 4]!, size),
    }
    return {
      x: fraction(x, size.width),
      y: fraction(y, size.height),
    }
  }) as unknown as Quad
}

/** Finds the shapes of an image that could be a document, with what tells one from the others. */
export function findCandidates(source: PixelBuffer): DocumentCandidate[] {
  const planes = shrink(source, SIDE)
  // Text has edges of its own, which lose to those of the paper once the closing has removed it. Not every paper
  // survives the closing, such as a dark one, so the search runs on both
  const planesWithoutText = mapChannels(planes, (channel, size) => closing(channel, size, TEXT_RADIUS))
  const image = {
    edges: findEdges(planes),
    edgesWithoutText: findEdges(planesWithoutText),
    planesWithoutText,
  }
  const search = (edges: Edges) => findQuads(findLines(edges), planes, MAX_SHAPES)
  const shapes = search(image.edgesWithoutText)
  const more = search(image.edges).filter(shape => !shapes.some(other => isSameQuad(shape, other)))
  return [
    ...shapes.map(shape => settle(shape, image.edgesWithoutText)),
    ...more.map(shape => settle(shape, image.edges)),
  ].filter(quad => canBeDocument(quad, planes)).map(quad => ({
    features: measureFeatures(quad, image),
    quad: toFractions(fromTopLeft(quad), planes),
  }))
}

/**
 * Finds the document of a photo, without its text, so it works with any document. The corners are fractions of the
 * image, from the top left one, clockwise. `null` if no shape is likely enough to be one, because a wrong guess costs
 * the user more than none.
 */
export function detectDocument(source: PixelBuffer): Quad | null {
  let best: Quad | null = null
  let highest = 0
  for (const { features, quad } of findCandidates(source)) {
    const value = confidence(features)
    if (value > highest) {
      highest = value
      best = quad
    }
  }
  return best
}
