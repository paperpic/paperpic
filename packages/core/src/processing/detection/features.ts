import type { Point, Quad, Size } from '../types'
import type { Edges } from './edges'
import type { Planes } from './planes'
import { borderUnder, fitQuad, inwardFrom } from './fit'
import { measurePastCorners } from './past-corners'
import { signedArea } from './quads'

/** What tells a document from the other shapes of a photo. */
export interface Features {
  /** How many of its sides are on the border of the photo. */
  borders: number
  /** The part of its sides that are brighter at the inside. */
  brighter: number
  /** How much the light at both sides of its outline differs, as a ratio. */
  contrast: number
  /** How alike its facing sides are, from 0 to 1. */
  evenness: number
  /** How well its outline lies on the edges of the photo. */
  outline: number
  /** The same, on the edges that are left without the text. */
  outlineWithoutText: number
  /** The most that one of its sides goes on past a corner. */
  pastCorner: number
  /** The most that both neighbours of a side go on past it, as at a fold in the middle of a page. */
  pastSide: number
  /** How much the light of its inside changes from one place to the next, as a ratio. The border of a shadow counts little. */
  roughness: number
  /** The square root of the part of the photo that it takes. */
  size: number
  /** The contrast of the side where it is least. */
  worstContrast: number
  /** How well the worst of its sides lies on the edges that are left without the text. */
  worstSide: number
}

/** How far from a side its strips go, at each side, and how many places along it they look at. */
const STRIP_START = 3
const STRIP_END = 8
const STRIP_PLACES = 24
/** The places next to each corner that a strip leaves out. */
const STRIP_MARGIN = 2
/** A strip with fewer pixels in the image says nothing. */
const MIN_STRIP = 30
/** How much a less colorful inside counts as a brighter one, because paper is white under any light. */
const SATURATION_WEIGHT = 0.5
/** How much brighter the inside is, in levels, when it counts. */
const MIN_BRIGHTER = 4
/** The inside is looked at on a grid with this many cells at each side. */
const GRID = 16
/**
 * The roughness is larger than this part of the steps from one place of the grid to the next. The border of a shadow is
 * in the rest, because few steps cross it, and so is that of a blot or a highlight.
 */
const ROUGHNESS_SHARE = 0.75
/**
 * Light is compared as a ratio, which a shadow changes less than a difference. These levels, added to every one, keep
 * the noise of a dark area from looking like a contrast.
 */
const DARK_LEVELS = 20
/** No contrast counts as more than these. */
const MAX_CONTRAST = 2
const MAX_WORST_CONTRAST = 0.5

type Color = [number, number, number]

/** How colorful a color is, in levels. */
function colorfulness(color: Color): number {
  return Math.max(...color) - Math.min(...color)
}

/** The mean color of a strip next to a side, from the inside with a `direction` of 1, or the outside with -1. */
function stripColor(start: Point, end: Point, direction: 1 | -1, { channels, width, height }: Planes): Color | null {
  const inward = inwardFrom(start, end)
  const sums: Color = [0, 0, 0]
  let count = 0
  for (let place = STRIP_MARGIN; place < STRIP_PLACES - 1; place++) {
    const sideX = start.x + (end.x - start.x) * place / STRIP_PLACES
    const sideY = start.y + (end.y - start.y) * place / STRIP_PLACES
    for (let distance = STRIP_START; distance <= STRIP_END; distance++) {
      const x = Math.round(sideX + inward.x * distance * direction)
      const y = Math.round(sideY + inward.y * distance * direction)
      if (x >= 0 && y >= 0 && x < width && y < height) {
        channels.forEach((channel, index) => {
          sums[index]! += channel[y * width + x]!
        })
        count++
      }
    }
  }
  return count < MIN_STRIP
    ? null
    : sums.map(sum => sum / count) as Color
}

/** Compares the colors at both sides of an outline. A side on the border of the photo has nothing outside to compare with. */
function compareSides(quad: Quad, planes: Planes): Pick<Features, 'brighter' | 'contrast' | 'worstContrast'> {
  const contrasts: number[] = []
  let brighter = 0
  quad.forEach((start, index) => {
    const end = quad[(index + 1) % 4]!
    const inside = stripColor(start, end, 1, planes)
    const outside = stripColor(start, end, -1, planes)
    if (!inside || !outside) {
      return
    }
    contrasts.push(Math.hypot(...inside.map((level, channel) => Math.log((level + DARK_LEVELS) / (outside[channel]! + DARK_LEVELS)))))
    const gain = inside.reduce((sum, level, channel) => sum + level - outside[channel]!, 0) / 3
    if (gain + SATURATION_WEIGHT * (colorfulness(outside) - colorfulness(inside)) > MIN_BRIGHTER) {
      brighter++
    }
  })
  const count = Math.max(1, contrasts.length)
  return {
    brighter: brighter / count,
    contrast: Math.min(MAX_CONTRAST, contrasts.reduce((sum, contrast) => sum + contrast, 0) / count),
    worstContrast: contrasts.length > 0
      ? Math.min(MAX_WORST_CONTRAST, ...contrasts)
      : 0,
  }
}

/**
 * How much the light of the inside of a shape changes from one place to the next: the ratio between the two, as a
 * logarithm. Paper is smooth, also in a shadow, where several things are not.
 */
function measureRoughness([topLeft, topRight, bottomRight, bottomLeft]: Quad, { channels, width, height }: Planes): number {
  const places = GRID - 1
  const light: number[] = []
  const steps: number[] = []
  for (let row = 0; row < places; row++) {
    for (let column = 0; column < places; column++) {
      const right = (column + 1) / GRID
      const down = (row + 1) / GRID
      const between = (axis: 'x' | 'y', last: number) => Math.min(last, Math.max(0, Math.round(
        (1 - down) * ((1 - right) * topLeft[axis] + right * topRight[axis])
        + down * ((1 - right) * bottomLeft[axis] + right * bottomRight[axis]),
      )))
      const pixel = between('y', height - 1) * width + between('x', width - 1)
      const value = Math.log(channels.reduce((sum, channel) => sum + channel[pixel]! + DARK_LEVELS, 0))
      if (column > 0) {
        steps.push(Math.abs(value - light.at(-1)!))
      }
      if (row > 0) {
        steps.push(Math.abs(value - light.at(-places)!))
      }
      light.push(value)
    }
  }
  steps.sort((first, second) => first - second)
  return steps[Math.floor(steps.length * ROUGHNESS_SHARE)]!
}

/** How alike the facing sides of a shape are: the shorter one of a pair as a fraction of the longer one, for the pair that differs most. */
function evenness(quad: Quad): number {
  const lengths = quad.map((corner, index) => {
    const next = quad[(index + 1) % 4]!
    return Math.hypot(next.x - corner.x, next.y - corner.y)
  })
  const compare = (first: number, second: number) => Math.min(first, second) / Math.max(first, second)
  return Math.min(compare(lengths[0]!, lengths[2]!), compare(lengths[1]!, lengths[3]!))
}

/** How many sides of a shape are on the border of the photo. */
export function countBorders(quad: Quad, size: Size): number {
  return quad.filter((corner, index) => borderUnder(corner, quad[(index + 1) % 4]!, size)).length
}

/** What the features are measured on: the colors without the text, and the edges with and without it. */
export interface DetectionImage {
  edges: Edges
  edgesWithoutText: Edges
  planesWithoutText: Planes
}

/** Measures a shape, whose corners go clockwise on screen. */
export function measureFeatures(quad: Quad, { edges, edgesWithoutText, planesWithoutText }: DetectionImage): Features {
  const withoutText = fitQuad(quad, edgesWithoutText)
  return {
    ...compareSides(quad, planesWithoutText),
    ...measurePastCorners(quad, edgesWithoutText),
    borders: countBorders(quad, edges),
    evenness: evenness(quad),
    outline: fitQuad(quad, edges).mean,
    outlineWithoutText: withoutText.mean,
    roughness: measureRoughness(quad, planesWithoutText),
    size: Math.sqrt(Math.abs(signedArea(quad)) / (edges.width * edges.height)),
    worstSide: withoutText.worst,
  }
}
