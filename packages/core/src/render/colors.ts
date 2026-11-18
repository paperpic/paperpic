/** The colors that the canvas paints over the image, from the tokens of the stylesheet. */
export interface OverlayColors {
  /** What stays out of a selection. */
  dim: string
  /** The lines over the image, such as the outline of a selection and the cross of the magnifier. */
  line: string
  /** The line under each line, so it shows on white paper and on a dark table. */
  lineShadow: string
}

/** The values of `tokens.css`, for a page without the stylesheet. */
export const DEFAULT_OVERLAY_COLORS: OverlayColors = {
  dim: 'rgb(0 0 0 / 50%)',
  line: '#fff',
  lineShadow: 'rgb(0 0 0 / 60%)',
}

/**
 * Reads the tokens where the canvas sits, so an override on any ancestor applies, and a change of theme shows on the
 * next paint. A canvas outside the page has no styles, and gets the defaults.
 */
export function overlayColors(context: CanvasRenderingContext2D): OverlayColors {
  const canvas = context.canvas as HTMLCanvasElement | undefined
  if (!canvas?.isConnected) {
    return DEFAULT_OVERLAY_COLORS
  }
  const style = getComputedStyle(canvas)
  const read = (token: string, fallback: string) => style.getPropertyValue(token).trim() || fallback
  return {
    dim: read('--paperpic-color-dim', DEFAULT_OVERLAY_COLORS.dim),
    line: read('--paperpic-color-line', DEFAULT_OVERLAY_COLORS.line),
    lineShadow: read('--paperpic-color-line-shadow', DEFAULT_OVERLAY_COLORS.lineShadow),
  }
}
