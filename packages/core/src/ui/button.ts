/** Creates a button named for screen readers. With `aria-disabled` set to true, a click does nothing. */
export function createButton(icon: string, onClick: () => void, className = 'paperpic-button'): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.innerHTML = icon
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-disabled') !== 'true') {
      onClick()
    }
  })
  return button
}

/** Names a button, for screen readers and as a tooltip. */
export function nameButton(button: HTMLButtonElement, label: string): void {
  button.setAttribute('aria-label', label)
  button.title = label
}

const NAVIGATION_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

/**
 * Makes a toolbar one stop in the tab order, with the arrow keys moving through its buttons.
 *
 * @returns The function that fixes the tab order after buttons appear or disappear.
 */
export function attachRovingFocus(element: HTMLElement, buttons: () => HTMLButtonElement[]): () => void {
  const visible = () => buttons().filter(button => !button.hidden)

  const setCurrent = (current: HTMLButtonElement) => {
    for (const button of buttons()) {
      button.tabIndex = button === current
        ? 0
        : -1
    }
  }

  element.addEventListener('focusin', (event) => {
    if (buttons().includes(event.target as HTMLButtonElement)) {
      setCurrent(event.target as HTMLButtonElement)
    }
  })

  element.addEventListener('keydown', (event) => {
    if (!NAVIGATION_KEYS.has(event.key)) {
      return
    }
    // The arrow keys move through the toolbar here, instead of panning the image
    event.preventDefault()
    event.stopPropagation()

    const list = visible()
    const index = list.indexOf(event.target as HTMLButtonElement)
    const next = {
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      Home: 0,
      End: list.length - 1,
    }[event.key]!
    const target = list[(next + list.length) % list.length]!
    setCurrent(target)
    target.focus()
  })

  return () => {
    const list = visible()
    const current = list.find(button => button.tabIndex === 0) ?? list[0]
    if (current) {
      setCurrent(current)
    }
  }
}
