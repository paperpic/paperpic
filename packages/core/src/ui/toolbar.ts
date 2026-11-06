import type { Fit } from '../state/view'
import type { PaperPicLabels } from './labels'
import { ICONS } from './icons'

/** What the toolbar can ask for. It only reaches the viewer through these. */
export interface ToolbarCommands {
  zoomIn: () => void
  zoomOut: () => void
  fit: (fit: Fit) => void
  rotate: (direction: 1 | -1) => void
}

/** What the toolbar shows. */
export interface ToolbarState {
  fit: Fit | null
  canZoomIn: boolean
  canZoomOut: boolean
  canRotate: boolean
}

type ButtonName = 'zoomIn' | 'zoomOut' | 'fitWidth' | 'fitHeight' | 'rotateLeft' | 'rotateRight'

const NAVIGATION_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

/** The controls of the view mode. */
export class Toolbar {
  readonly element: HTMLElement
  private readonly buttons: Record<ButtonName, HTMLButtonElement>

  constructor(commands: ToolbarCommands, labels: PaperPicLabels) {
    this.element = document.createElement('div')
    this.element.className = 'paperpic-toolbar'
    this.element.setAttribute('role', 'toolbar')
    this.element.setAttribute('aria-orientation', 'vertical')

    const add = (name: ButtonName, action: () => void) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'paperpic-button'
      button.innerHTML = ICONS[name]
      button.addEventListener('click', () => {
        if (button.getAttribute('aria-disabled') !== 'true') {
          action()
        }
      })
      this.element.append(button)
      return button
    }

    this.buttons = {
      zoomIn: add('zoomIn', commands.zoomIn),
      zoomOut: add('zoomOut', commands.zoomOut),
      fitWidth: add('fitWidth', () => commands.fit('width')),
      fitHeight: add('fitHeight', () => commands.fit('height')),
      rotateLeft: add('rotateLeft', () => commands.rotate(-1)),
      rotateRight: add('rotateRight', () => commands.rotate(1)),
    }

    this.element.addEventListener('keydown', event => this.onKeyDown(event))
    this.element.addEventListener('focusin', (event) => {
      this.setCurrent(event.target as HTMLButtonElement)
    })
    this.setCurrent(this.buttons.zoomIn)
    this.setLabels(labels)
  }

  /** Updates the texts. */
  setLabels(labels: PaperPicLabels): void {
    this.element.setAttribute('aria-label', labels.toolbar)
    for (const [name, button] of Object.entries(this.buttons)) {
      const label = labels[name as ButtonName]
      button.setAttribute('aria-label', label)
      button.title = label
    }
  }

  /** Updates what the buttons show. */
  update({ fit, canZoomIn, canZoomOut, canRotate }: ToolbarState): void {
    // aria-disabled instead of disabled, so a button reaching its limit keeps the keyboard focus
    this.buttons.zoomIn.setAttribute('aria-disabled', String(!canZoomIn))
    this.buttons.zoomOut.setAttribute('aria-disabled', String(!canZoomOut))
    this.buttons.fitWidth.setAttribute('aria-pressed', String(fit === 'width'))
    this.buttons.fitHeight.setAttribute('aria-pressed', String(fit === 'height'))
    this.buttons.rotateLeft.hidden = !canRotate
    this.buttons.rotateRight.hidden = !canRotate

    const current = Object.values(this.buttons).find(button => button.tabIndex === 0)
    if (current?.hidden) {
      this.setCurrent(this.buttons.zoomIn)
    }
  }

  private setCurrent(current: HTMLButtonElement): void {
    for (const button of Object.values(this.buttons)) {
      button.tabIndex = button === current
        ? 0
        : -1
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!NAVIGATION_KEYS.has(event.key)) {
      return
    }
    // The arrow keys move through the toolbar here, instead of panning the image
    event.preventDefault()
    event.stopPropagation()

    const visible = Object.values(this.buttons).filter(button => !button.hidden)
    const index = visible.indexOf(event.target as HTMLButtonElement)
    const next = {
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      Home: 0,
      End: visible.length - 1,
    }[event.key]!
    const target = visible[(next + visible.length) % visible.length]!
    this.setCurrent(target)
    target.focus()
  }
}
