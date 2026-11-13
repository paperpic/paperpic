export type Rotation = 0 | 90 | 180 | 270

/**
 * Rounds an angle in degrees to the nearest multiple of 90 and wraps it into [0, 360).
 *
 * @throws {RangeError} If `degrees` is not a finite number.
 */
export function normalizeRotation(degrees: number): Rotation {
  if (!Number.isFinite(degrees)) {
    throw new RangeError(`Rotation must be a finite number, got ${degrees}`)
  }
  const quarterTurns = Math.round(degrees / 90)
  return ((((quarterTurns * 90) % 360) + 360) % 360) as Rotation
}
