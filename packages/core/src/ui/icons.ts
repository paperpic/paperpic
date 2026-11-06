function icon(paths: string): string {
  return `<svg class="paperpic-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

export const ICONS = {
  zoomIn: icon('<path d="M12 5v14M5 12h14"/>'),
  zoomOut: icon('<path d="M5 12h14"/>'),
  fitWidth: icon('<path d="M3 5v14M21 5v14M7 12h10M7 12l3-3M7 12l3 3M17 12l-3-3M17 12l-3 3"/>'),
  fitHeight: icon('<path d="M5 3h14M5 21h14M12 7v10M12 7l-3 3M12 7l3 3M12 17l-3-3M12 17l3-3"/>'),
  rotateLeft: icon('<path d="M4 4v6h6"/><path d="M4.5 10a8 8 0 1 1-.5 4"/>'),
  rotateRight: icon('<path d="M20 4v6h-6"/><path d="M19.5 10a8 8 0 1 0 .5 4"/>'),
}
