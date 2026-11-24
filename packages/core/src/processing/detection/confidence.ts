import type { Features } from './features'

/**
 * What each feature adds to the confidence, fitted to photos with and without a document. The measurements are in
 * `docs/spec/detection-results.md`.
 */
const WEIGHTS: Record<keyof Features, number> = {
  borders: -1.14,
  brighter: 2.26,
  contrast: -2.32,
  evenness: 3.44,
  outline: 6.87,
  outlineWithoutText: 9.76,
  pastCorner: -0.98,
  pastSide: -1.39,
  roughness: -26.73,
  size: 9.76,
  worstContrast: 1.26,
  worstSide: -1.31,
}
/** Where the confidence starts, so that a shape above 0 is likely enough to propose it. */
const START = -19.07

/** How likely a shape is to be a document. Above 0, it is likely enough to propose it to the user. */
export function confidence(features: Features): number {
  let sum = START
  for (const name of Object.keys(WEIGHTS) as (keyof Features)[]) {
    sum += WEIGHTS[name] * features[name]
  }
  return sum
}
