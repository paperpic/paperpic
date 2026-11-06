import type { Tool, ToolId } from '../tools/types'
import type { PaperPicLabels } from './labels'
import { attachRovingFocus, createButton, nameButton } from './button'
import { ICONS } from './icons'

/** What the edit bar can ask for. It only reaches the viewer through these. */
export interface EditBarCommands {
  cancel: () => void
  undo: () => void
  redo: () => void
  apply: () => void
  runTool: (run: Tool['actions'][number]['run']) => void
}

/** What the edit bar shows. */
export interface EditBarState {
  canUndo: boolean
  canRedo: boolean
  canApply: boolean
  busy: boolean
}

/** The controls of the edit mode: Cancel, the tools, Undo, Redo and Apply. */
export class EditBar {
  readonly element: HTMLElement
  private readonly controls: HTMLElement
  private readonly confirmation: HTMLElement
  private readonly message: HTMLElement
  private readonly toolButtons: { toolId: ToolId, id: Tool['actions'][number]['id'], button: HTMLButtonElement }[] = []
  private readonly cancelButton: HTMLButtonElement
  private readonly undoButton: HTMLButtonElement
  private readonly redoButton: HTMLButtonElement
  private readonly applyButton: HTMLButtonElement
  private readonly applyText: HTMLElement
  private readonly keepButton: HTMLButtonElement
  private readonly discardButton: HTMLButtonElement
  private readonly fixTabOrder: () => void
  private canApply = false
  private busy = false

  constructor(commands: EditBarCommands, tools: readonly Tool[], labels: PaperPicLabels) {
    this.element = document.createElement('div')
    this.element.className = 'paperpic-edit-bar'
    this.element.hidden = true

    this.controls = document.createElement('div')
    this.controls.className = 'paperpic-edit-controls'
    this.controls.setAttribute('role', 'toolbar')

    this.cancelButton = createButton(ICONS.cancel, () => this.requestCancel(commands))
    this.undoButton = createButton(ICONS.undo, commands.undo)
    this.redoButton = createButton(ICONS.redo, commands.redo)
    this.applyButton = createButton(ICONS.apply, commands.apply, 'paperpic-button paperpic-button-primary')
    this.applyText = document.createElement('span')
    this.applyButton.append(this.applyText)

    const toolGroup = document.createElement('div')
    toolGroup.className = 'paperpic-edit-tools'
    for (const tool of tools) {
      for (const action of tool.actions) {
        const button = createButton(ICONS[action.id], () => commands.runTool(action.run))
        this.toolButtons.push({ toolId: tool.id, id: action.id, button })
        toolGroup.append(button)
      }
    }

    const history = document.createElement('div')
    history.className = 'paperpic-edit-history'
    history.append(this.undoButton, this.redoButton)

    this.controls.append(this.cancelButton, toolGroup, history, this.applyButton)

    this.confirmation = document.createElement('div')
    this.confirmation.className = 'paperpic-edit-confirmation'
    this.confirmation.setAttribute('role', 'alertdialog')
    this.confirmation.hidden = true
    this.message = document.createElement('span')
    this.message.className = 'paperpic-edit-message'
    this.keepButton = createButton('', () => this.closeConfirmation(), 'paperpic-button paperpic-button-text')
    this.discardButton = createButton('', () => {
      this.closeConfirmation()
      commands.cancel()
    }, 'paperpic-button paperpic-button-text paperpic-button-danger')
    this.confirmation.append(this.message, this.keepButton, this.discardButton)

    // Esc inside the question means "keep editing", and must not reach the viewer
    this.confirmation.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        this.closeConfirmation()
      }
    })

    this.element.append(this.controls, this.confirmation)

    this.fixTabOrder = attachRovingFocus(this.controls, () => [
      this.cancelButton,
      ...this.toolButtons.map(({ button }) => button),
      this.undoButton,
      this.redoButton,
      this.applyButton,
    ])
    this.fixTabOrder()
    this.setLabels(labels)
  }

  /** Updates the texts. */
  setLabels(labels: PaperPicLabels): void {
    this.controls.setAttribute('aria-label', labels.editBar)
    nameButton(this.cancelButton, labels.cancel)
    nameButton(this.undoButton, labels.undo)
    nameButton(this.redoButton, labels.redo)
    nameButton(this.applyButton, labels.apply)
    this.applyText.textContent = labels.apply
    for (const { id, button } of this.toolButtons) {
      nameButton(button, labels[id])
    }
    this.confirmation.setAttribute('aria-label', labels.discardQuestion)
    this.message.textContent = labels.discardQuestion
    this.keepButton.textContent = labels.keepEditing
    this.discardButton.textContent = labels.discard
  }

  /** Chooses which tools appear. */
  setTools(ids: readonly ToolId[]): void {
    for (const { toolId, button } of this.toolButtons) {
      button.hidden = !ids.includes(toolId)
    }
    this.fixTabOrder()
  }

  /** Shows or hides the bar. Hiding it closes any open question. */
  setVisible(visible: boolean): void {
    this.element.hidden = !visible
    if (!visible) {
      this.closeConfirmation(false)
    }
  }

  /** Updates what the buttons allow. */
  update({ canUndo, canRedo, canApply, busy }: EditBarState): void {
    this.canApply = canApply
    this.busy = busy
    this.undoButton.setAttribute('aria-disabled', String(busy || !canUndo))
    this.redoButton.setAttribute('aria-disabled', String(busy || !canRedo))
    this.applyButton.setAttribute('aria-disabled', String(busy || !canApply))
    this.cancelButton.setAttribute('aria-disabled', String(busy))
    for (const { button } of this.toolButtons) {
      button.setAttribute('aria-disabled', String(busy))
    }
  }

  /** Cancels, asking first if there are changes to lose. */
  requestCancel(commands: Pick<EditBarCommands, 'cancel'>): void {
    if (this.busy) {
      return
    }
    if (!this.canApply) {
      commands.cancel()
      return
    }
    this.controls.hidden = true
    this.confirmation.hidden = false
    // The safe choice takes the focus, so pressing Enter again does not lose the work
    this.keepButton.focus()
  }

  /** Moves the keyboard focus to the bar. */
  focus(): void {
    this.controls.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
  }

  private closeConfirmation(restoreFocus = true): void {
    const wasOpen = !this.confirmation.hidden
    this.confirmation.hidden = true
    this.controls.hidden = false
    if (wasOpen && restoreFocus) {
      this.cancelButton.focus()
    }
  }
}
