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
  confirmTool: () => void
  cancelTool: () => void
}

/** What the edit bar shows. */
export interface EditBarState {
  canUndo: boolean
  canRedo: boolean
  canApply: boolean
  busy: boolean
  /** Whether a tool with its own selection can open. A preview in progress prevents it. */
  canOpenTool: boolean
}

/** The controls of the edit mode: Cancel, the tools, Undo, Redo and Apply. An open tool replaces them with its own. */
export class EditBar {
  readonly element: HTMLElement
  private readonly controls: HTMLElement
  private readonly toolControls: HTMLElement
  private readonly hint: HTMLElement
  private readonly confirmation: HTMLElement
  private readonly message: HTMLElement
  private readonly toolButtons: { tool: Tool, id: Tool['actions'][number]['id'], button: HTMLButtonElement }[] = []
  private readonly cancelToolButton: HTMLButtonElement
  private readonly confirmToolButton: HTMLButtonElement
  private readonly confirmToolText: HTMLElement
  private readonly cancelButton: HTMLButtonElement
  private readonly undoButton: HTMLButtonElement
  private readonly redoButton: HTMLButtonElement
  private readonly applyButton: HTMLButtonElement
  private readonly applyText: HTMLElement
  private readonly keepButton: HTMLButtonElement
  private readonly discardButton: HTMLButtonElement
  private readonly fixTabOrder: () => void
  private labels: PaperPicLabels
  private activeTool: Tool | null = null
  private canApply = false
  private busy = false

  constructor(commands: EditBarCommands, tools: readonly Tool[], labels: PaperPicLabels) {
    this.labels = labels
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
        this.toolButtons.push({ tool, id: action.id, button })
        toolGroup.append(button)
      }
    }

    const history = document.createElement('div')
    history.className = 'paperpic-edit-history'
    history.append(this.undoButton, this.redoButton)

    this.controls.append(this.cancelButton, toolGroup, history, this.applyButton)

    this.toolControls = document.createElement('div')
    this.toolControls.className = 'paperpic-edit-tool'
    this.toolControls.hidden = true
    this.cancelToolButton = createButton(ICONS.cancel, commands.cancelTool)
    this.hint = document.createElement('span')
    this.hint.className = 'paperpic-edit-message'
    this.confirmToolButton = createButton(ICONS.apply, commands.confirmTool, 'paperpic-button paperpic-button-primary')
    this.confirmToolText = document.createElement('span')
    this.confirmToolButton.append(this.confirmToolText)
    this.toolControls.append(this.cancelToolButton, this.hint, this.confirmToolButton)

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

    this.element.append(this.controls, this.toolControls, this.confirmation)

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
    this.labels = labels
    this.controls.setAttribute('aria-label', labels.editBar)
    nameButton(this.cancelToolButton, labels.cancelTool)
    nameButton(this.confirmToolButton, labels.confirm)
    this.confirmToolText.textContent = labels.confirm
    this.showHint()
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
    for (const { tool, button } of this.toolButtons) {
      button.hidden = !ids.includes(tool.id)
    }
    this.fixTabOrder()
  }

  /** Shows the controls of an open tool, or the usual ones with `null`. */
  setActiveTool(tool: Tool | null): void {
    this.activeTool = tool
    this.toolControls.hidden = tool === null
    this.controls.hidden = tool !== null
    this.showHint()
  }

  /** Shows or hides the bar. Hiding it closes any open question. */
  setVisible(visible: boolean): void {
    this.element.hidden = !visible
    if (!visible) {
      this.closeConfirmation(false)
    }
  }

  /** Updates what the buttons allow. */
  update({ canUndo, canRedo, canApply, busy, canOpenTool }: EditBarState): void {
    this.canApply = canApply
    this.busy = busy
    this.undoButton.setAttribute('aria-disabled', String(busy || !canUndo))
    this.redoButton.setAttribute('aria-disabled', String(busy || !canRedo))
    this.applyButton.setAttribute('aria-disabled', String(busy || !canApply))
    this.cancelButton.setAttribute('aria-disabled', String(busy))
    for (const { tool, button } of this.toolButtons) {
      button.setAttribute('aria-disabled', String(busy || (tool.activate !== undefined && !canOpenTool)))
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

  /** Moves the keyboard focus to the bar, or to the button of a tool. */
  focus(toolId?: ToolId): void {
    const button = this.toolButtons.find(({ tool }) => tool.id === toolId)?.button
      ?? this.controls.querySelector<HTMLButtonElement>('button[tabindex="0"]')
    button?.focus()
  }

  private showHint(): void {
    const hint = this.activeTool?.hint
    this.hint.textContent = hint
      ? this.labels[hint]
      : ''
  }

  private closeConfirmation(restoreFocus = true): void {
    const wasOpen = !this.confirmation.hidden
    this.confirmation.hidden = true
    this.controls.hidden = this.activeTool !== null
    if (wasOpen && restoreFocus) {
      this.cancelButton.focus()
    }
  }
}
