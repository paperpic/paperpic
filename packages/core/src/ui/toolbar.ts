import type { Fit } from '../state/view'
import type { PaperPicIcons } from './icons'
import type { PaperPicLabels } from './labels'
import { attachRovingFocus, createButton, nameButton, setIcon } from './button'
import { DEFAULT_ICONS } from './icons'

/** What the toolbar can ask for. It only reaches the viewer through these. */
export interface ToolbarCommands {
  download: () => void
  edit: () => void
  fit: (fit: Fit) => void
  rotate: (direction: 1 | -1) => void
  zoomIn: () => void
  zoomOut: () => void
}

/** What the toolbar shows. */
export interface ToolbarState {
  canDownload: boolean
  canEdit: boolean
  canRotate: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  fit: Fit | null
}

type ButtonName = 'download' | 'edit' | 'fitHeight' | 'fitWidth' | 'rotateLeft' | 'rotateRight' | 'zoomIn' | 'zoomOut'

/** The controls that stay at the right: the Edit pencil, zoom, fit, rotation in a read-only viewer and, when chosen, download. */
export class Toolbar {
  readonly element: HTMLElement
  private readonly buttons: Record<ButtonName, HTMLButtonElement>
  private readonly fixTabOrder: () => void

  constructor(commands: ToolbarCommands, labels: PaperPicLabels, icons: PaperPicIcons = DEFAULT_ICONS) {
    this.element = document.createElement('div')
    this.element.className = 'paperpic-toolbar'
    this.element.setAttribute('role', 'toolbar')
    this.element.setAttribute('aria-orientation', 'vertical')

    this.buttons = {
      edit: createButton('edit', commands.edit),
      zoomIn: createButton('zoomIn', commands.zoomIn),
      zoomOut: createButton('zoomOut', commands.zoomOut),
      fitWidth: createButton('fitWidth', () => commands.fit('width')),
      fitHeight: createButton('fitHeight', () => commands.fit('height')),
      rotateLeft: createButton('rotateLeft', () => commands.rotate(-1)),
      rotateRight: createButton('rotateRight', () => commands.rotate(1)),
      download: createButton('download', commands.download),
    }
    this.element.append(...Object.values(this.buttons))

    this.fixTabOrder = attachRovingFocus(this.element, () => Object.values(this.buttons))
    for (const button of Object.values(this.buttons)) {
      button.tabIndex = button === this.buttons.zoomIn
        ? 0
        : -1
    }
    this.setLabels(labels)
    this.setIcons(icons)
  }

  /** Updates the texts. */
  setLabels(labels: PaperPicLabels): void {
    this.element.setAttribute('aria-label', labels.toolbar)
    for (const [name, button] of Object.entries(this.buttons)) {
      nameButton(button, labels[name as ButtonName])
    }
  }

  /** Updates the icons. Each button has the icon of the same name. */
  setIcons(icons: PaperPicIcons): void {
    for (const [name, button] of Object.entries(this.buttons)) {
      setIcon(button, icons[name as ButtonName])
    }
  }

  /** Updates what the buttons show. */
  update({ fit, canEdit, canZoomIn, canZoomOut, canRotate, canDownload }: ToolbarState): void {
    // aria-disabled instead of disabled, so a button reaching its limit keeps the keyboard focus
    this.buttons.zoomIn.setAttribute('aria-disabled', String(!canZoomIn))
    this.buttons.zoomOut.setAttribute('aria-disabled', String(!canZoomOut))
    this.buttons.fitWidth.setAttribute('aria-pressed', String(fit === 'width'))
    this.buttons.fitHeight.setAttribute('aria-pressed', String(fit === 'height'))
    this.buttons.edit.hidden = !canEdit
    this.buttons.rotateLeft.hidden = !canRotate
    this.buttons.rotateRight.hidden = !canRotate
    this.buttons.download.hidden = !canDownload

    // A hidden button cannot keep its place in the tab order
    for (const button of Object.values(this.buttons)) {
      if (button.hidden) {
        button.tabIndex = -1
      }
    }
    this.fixTabOrder()
  }

  /** Moves the keyboard focus to the Edit pencil, or to the first button if it is not there. */
  focus(): void {
    const target = this.buttons.edit.hidden ? this.buttons.zoomIn : this.buttons.edit
    target.focus()
  }
}
