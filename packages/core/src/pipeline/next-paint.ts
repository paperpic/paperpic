/** Lets the browser paint what has changed, because reading a large image blocks the page for a moment. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    // A hidden page gets no frames, and the work must still go on
    const timer = setTimeout(resolve, 100)
    requestAnimationFrame(() => {
      clearTimeout(timer)
      setTimeout(resolve)
    })
  })
}
