let warned = false

/**
 * Warns once per page when the stylesheet of PaperPic is missing, because the viewer then has no layout and the cause
 * is hard to guess. The stylesheet makes the root a flex container, so any other display means it did not load.
 */
export function warnWithoutStyles(root: HTMLElement): void {
  if (warned || !root.isConnected || getComputedStyle(root).display === 'flex') {
    return
  }
  warned = true
  console.warn('PaperPic: the stylesheet is missing, so the viewer has no layout. Import it once in your app, such as `import \'@paperpic/core/style.css\'`, or the style.css of @paperpic/vue or @paperpic/react.')
}
