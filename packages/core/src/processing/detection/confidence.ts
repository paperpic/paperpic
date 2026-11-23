import type { Features } from './features'

/**
 * What each feature adds to the confidence, fitted to photos with and without a document. The measurements are in
 * `docs/spec/detection-results.md`.
 */
const WEIGHTS: Record<keyof Features, number> = {
  borders: -1.08,
  brighter: 2.24,
  contrast: -1.84,
  evenness: 3.37,
  outline: 6.17,
  outlineWithoutText: 8.38,
  pastCorner: -0.9,
  pastSide: -1.46,
  size: 9.13,
  spread: -5.95,
  worstContrast: 1.3,
  worstSide: -1.12,
}
/** Where the confidence starts, so that a shape above 0 is likely enough to propose it. */
const START = -17.64

/** How likely a shape is to be a document. Above 0, it is likely enough to propose it to the user. */
export function confidence(features: Features): number {
  let sum = START
  for (const name of Object.keys(WEIGHTS) as (keyof Features)[]) {
    sum += WEIGHTS[name] * features[name]
  }
  return sum
}
