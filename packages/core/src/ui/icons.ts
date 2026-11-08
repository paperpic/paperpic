function icon(paths: string): string {
  return `<svg class="paperpic-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

export const ICONS = {
  edit: icon('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>'),
  zoomIn: icon('<path d="M12 5v14M5 12h14"/>'),
  zoomOut: icon('<path d="M5 12h14"/>'),
  fitWidth: icon('<path d="M3 5v14M21 5v14M7 12h10M7 12l3-3M7 12l3 3M17 12l-3-3M17 12l-3 3"/>'),
  fitHeight: icon('<path d="M5 3h14M5 21h14M12 7v10M12 7l-3 3M12 7l3 3M12 17l-3-3M12 17l3-3"/>'),
  rotateLeft: icon('<path d="M4 4v6h6"/><path d="M4.5 10a8 8 0 1 1-.5 4"/>'),
  rotateRight: icon('<path d="M20 4v6h-6"/><path d="M19.5 10a8 8 0 1 0 .5 4"/>'),
  crop: icon('<path d="M7 2v15h15"/><path d="M2 7h15v15"/>'),
  perspective: icon('<path d="M7 5h10l4 14H3z"/>'),
  threshold: icon('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  cancel: icon('<path d="M6 6l12 12M18 6L6 18"/>'),
  undo: icon('<path d="M8 5L4 9l4 4"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  redo: icon('<path d="M16 5l4 4-4 4"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
  apply: icon('<path d="M5 12l5 5L19 7"/>'),
}
