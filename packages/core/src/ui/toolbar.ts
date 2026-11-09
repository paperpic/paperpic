import type { Fit } from '../state/view'
import type { PaperPicLabels } from './labels'
import { attachRovingFocus, createButton, nameButton } from './button'
import { ICONS } from './icons'

/** What the toolbar can ask for. It only reaches the viewer through these. */
export interface ToolbarCommands {
  edit: () => void
  fit: (fit: Fit) => void
  rotate: (direction: 1 | -1) => void
  zoomIn: () => void
  zoomOut: () => void
}

/** What the toolbar shows. */
export interface ToolbarState {
  canEdit: boolean
  canRotate: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  fit: Fit | null
}

type ButtonName = 'edit' | 'fitHeight' | 'fitWidth' | 'rotateLeft' | 'rotateRight' | 'zoomIn' | 'zoomOut'

/** The controls that stay at the right: the Edit pencil, zoom, fit and, in a read-only viewer, rotation. */
export class Toolbar {
  readonly element: HTMLElement
  private readonly buttons: Record<ButtonName, HTMLButtonElement>
  private readonly fixTabOrder: () => void

  constructor(commands: ToolbarCommands, labels: PaperPicLabels) {
    this.element = document.createElement('div')
    this.element.className = 'paperpic-toolbar'
    this.element.setAttribute('role', 'toolbar')
    this.element.setAttribute('aria-orientation', 'vertical')

    this.buttons = {
      edit: createButton(ICONS.edit, commands.edit),
      zoomIn: createButton(ICONS.zoomIn, commands.zoomIn),
      zoomOut: createButton(ICONS.zoomOut, commands.zoomOut),
      fitWidth: createButton(ICONS.fitWidth, () => commands.fit('width')),
      fitHeight: createButton(ICONS.fitHeight, () => commands.fit('height')),
      rotateLeft: createButton(ICONS.rotateLeft, () => commands.rotate(-1)),
      rotateRight: createButton(ICONS.rotateRight, () => commands.rotate(1)),
    }
    this.element.append(...Object.values(this.buttons))

    this.fixTabOrder = attachRovingFocus(this.element, () => Object.values(this.buttons))
    for (const button of Object.values(this.buttons)) {
      button.tabIndex = button === this.buttons.zoomIn
        ? 0
        : -1
    }
    this.setLabels(labels)
  }

  /** Updates the texts. */
  setLabels(labels: PaperPicLabels): void {
    this.element.setAttribute('aria-label', labels.toolbar)
    for (const [name, button] of Object.entries(this.buttons)) {
      nameButton(button, labels[name as ButtonName])
    }
  }

  /** Updates what the buttons show. */
  update({ fit, canEdit, canZoomIn, canZoomOut, canRotate }: ToolbarState): void {
    // aria-disabled instead of disabled, so a button reaching its limit keeps the keyboard focus
    this.buttons.zoomIn.setAttribute('aria-disabled', String(!canZoomIn))
    this.buttons.zoomOut.setAttribute('aria-disabled', String(!canZoomOut))
    this.buttons.fitWidth.setAttribute('aria-pressed', String(fit === 'width'))
    this.buttons.fitHeight.setAttribute('aria-pressed', String(fit === 'height'))
    this.buttons.edit.hidden = !canEdit
    this.buttons.rotateLeft.hidden = !canRotate
    this.buttons.rotateRight.hidden = !canRotate

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
