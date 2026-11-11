import type { Tool, ToolId } from '../tools/types'
import type { PaperPicIcons } from './icons'
import type { PaperPicLabels } from './labels'
import { attachRovingFocus, createButton, nameButton, setIcon } from './button'
import { DEFAULT_ICONS } from './icons'

/** A tone that a slider of the adjustments changes. */
export type AdjustmentName = 'brightness' | 'contrast'

const ADJUSTMENTS: readonly AdjustmentName[] = ['brightness', 'contrast']

/** What the edit bar can ask for. It only reaches the viewer through these. */
export interface EditBarCommands {
  apply: () => void
  cancel: () => void
  cancelTool: () => void
  confirmTool: () => void
  /** Shows a value while the user drags a slider of the adjustments, without any edit. */
  previewAdjustment: (name: AdjustmentName, value: number) => void
  /** Shows a sensitivity while the user drags the slider, without any edit. */
  previewThreshold: (sensitivity: number) => void
  redo: () => void
  runTool: (run: Tool['actions'][number]['run']) => void
  /** The user chose a value for a slider of the adjustments. */
  setAdjustment: (name: AdjustmentName, value: number) => void
  /** The user chose a sensitivity. */
  setThreshold: (sensitivity: number) => void
  undo: () => void
}

/** What the edit bar shows. */
export interface EditBarState {
  /** Whether the sliders of the adjustments are open. */
  adjusting: boolean
  adjustments: Record<AdjustmentName, number>
  busy: boolean
  canApply: boolean
  /** Whether a tool with its own selection can open. A preview in progress prevents it. */
  canOpenTool: boolean
  canRedo: boolean
  canUndo: boolean
  threshold: { enabled: boolean, sensitivity: number }
}

interface Slider {
  input: HTMLInputElement
  name: HTMLElement
  row: HTMLLabelElement
}

/** The controls of the edit mode: Cancel, the tools, Undo, Redo and Apply. An open tool replaces them with its own. */
export class EditBar {
  readonly element: HTMLElement
  private readonly controls: HTMLElement
  private readonly toolControls: HTMLElement
  private readonly threshold: Slider
  private readonly adjustRow: HTMLElement
  private readonly adjustSliders: Record<AdjustmentName, Slider>
  private readonly hint: HTMLElement
  private readonly confirmation: HTMLElement
  private readonly message: HTMLElement
  private readonly toolButtons: { button: HTMLButtonElement, id: Tool['actions'][number]['id'], tool: Tool }[] = []
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
  /** The buttons with an icon, and the name of their icon. */
  private readonly iconButtons: [HTMLButtonElement, keyof PaperPicIcons][]
  private readonly fixTabOrder: () => void
  private labels: PaperPicLabels
  private activeTool: Tool | null = null
  /** A hint of the open tool that replaces its usual one, such as the next step after selecting a corner. */
  private hintOverride: string | null = null
  private thresholdEnabled = false
  private adjusting = false
  private offered: ReadonlySet<ToolId>
  private dragging = false
  private canApply = false
  private busy = false

  constructor(commands: EditBarCommands, tools: readonly Tool[], labels: PaperPicLabels, icons: PaperPicIcons = DEFAULT_ICONS) {
    this.labels = labels
    this.element = document.createElement('div')
    this.element.className = 'paperpic-edit-bar'
    this.element.hidden = true

    this.controls = document.createElement('div')
    this.controls.className = 'paperpic-edit-controls'
    this.controls.setAttribute('role', 'toolbar')

    this.cancelButton = createButton('cancel', () => this.requestCancel(commands))
    this.undoButton = createButton('undo', commands.undo)
    this.redoButton = createButton('redo', commands.redo)
    this.applyButton = createButton('apply', commands.apply, 'paperpic-button paperpic-button-primary')
    this.applyText = document.createElement('span')
    this.applyButton.append(this.applyText)

    this.offered = new Set(tools.map(({ id }) => id))
    const toolGroup = document.createElement('div')
    toolGroup.className = 'paperpic-edit-tools'
    const toolIcons: [HTMLButtonElement, keyof PaperPicIcons][] = []
    for (const tool of tools) {
      for (const action of tool.actions) {
        const button = createButton(action.id, () => commands.runTool(action.run))
        this.toolButtons.push({ tool, id: action.id, button })
        toolIcons.push([button, action.icon ?? action.id])
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
    this.cancelToolButton = createButton('cancelTool', commands.cancelTool)
    this.hint = document.createElement('span')
    this.hint.className = 'paperpic-edit-message'
    this.confirmToolButton = createButton('confirm', commands.confirmTool, 'paperpic-button paperpic-button-primary')
    this.confirmToolText = document.createElement('span')
    this.confirmToolButton.append(this.confirmToolText)
    this.toolControls.append(this.cancelToolButton, this.hint, this.confirmToolButton)

    this.iconButtons = [
      [this.cancelButton, 'cancel'],
      ...toolIcons,
      [this.undoButton, 'undo'],
      [this.redoButton, 'redo'],
      [this.applyButton, 'apply'],
      [this.cancelToolButton, 'cancel'],
      [this.confirmToolButton, 'apply'],
    ]

    this.confirmation = document.createElement('div')
    this.confirmation.className = 'paperpic-edit-confirmation'
    this.confirmation.setAttribute('role', 'alertdialog')
    this.confirmation.hidden = true
    this.message = document.createElement('span')
    this.message.className = 'paperpic-edit-message'
    this.keepButton = createButton('keepEditing', () => this.closeConfirmation(), 'paperpic-button paperpic-button-text')
    this.discardButton = createButton('discard', () => {
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

    this.threshold = this.createSlider('thresholdSensitivity', 'paperpic-edit-threshold', 0, commands.previewThreshold, commands.setThreshold)
    this.threshold.row.hidden = true

    this.adjustRow = document.createElement('div')
    this.adjustRow.className = 'paperpic-edit-adjust'
    this.adjustRow.hidden = true
    const sliders: Partial<Record<AdjustmentName, Slider>> = {}
    for (const name of ADJUSTMENTS) {
      const slider = this.createSlider(
        name,
        'paperpic-edit-slider',
        -1,
        value => commands.previewAdjustment(name, value),
        value => commands.setAdjustment(name, value),
      )
      this.adjustRow.append(slider.row)
      sliders[name] = slider
    }
    this.adjustSliders = sliders as Record<AdjustmentName, Slider>

    this.element.append(this.controls, this.toolControls, this.threshold.row, this.adjustRow, this.confirmation)

    this.fixTabOrder = attachRovingFocus(this.controls, () => [
      this.cancelButton,
      ...this.toolButtons.map(({ button }) => button),
      this.undoButton,
      this.redoButton,
      this.applyButton,
    ])
    this.fixTabOrder()
    this.setLabels(labels)
    this.setIcons(icons)
  }

  /** Updates the icons. */
  setIcons(icons: PaperPicIcons): void {
    for (const [button, name] of this.iconButtons) {
      setIcon(button, icons[name])
    }
  }

  /** Updates the texts. */
  setLabels(labels: PaperPicLabels): void {
    this.labels = labels
    this.controls.setAttribute('aria-label', labels.editBar)
    nameButton(this.cancelToolButton, labels.cancelTool)
    nameButton(this.confirmToolButton, labels.confirm)
    this.threshold.name.textContent = labels.thresholdSensitivity
    for (const name of ADJUSTMENTS) {
      this.adjustSliders[name].name.textContent = labels[name]
    }
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
    this.offered = new Set(ids)
    for (const { tool, button } of this.toolButtons) {
      button.hidden = !ids.includes(tool.id)
    }
    this.showSliders()
    this.fixTabOrder()
  }

  /** Shows the controls of an open tool, or the usual ones with `null`. */
  setActiveTool(tool: Tool | null): void {
    this.activeTool = tool
    this.hintOverride = null
    this.toolControls.hidden = tool === null
    this.controls.hidden = tool !== null
    this.showHint()
    this.showSliders()
  }

  /** Replaces the hint of the open tool, or brings it back with `null`. Closing the tool brings it back too. */
  setHint(text: string | null): void {
    this.hintOverride = text
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
  update({ canUndo, canRedo, canApply, busy, canOpenTool, threshold, adjusting, adjustments }: EditBarState): void {
    this.canApply = canApply
    this.busy = busy
    this.undoButton.setAttribute('aria-disabled', String(busy || !canUndo))
    this.redoButton.setAttribute('aria-disabled', String(busy || !canRedo))
    this.applyButton.setAttribute('aria-disabled', String(busy || !canApply))
    this.cancelButton.setAttribute('aria-disabled', String(busy))
    for (const { tool, button } of this.toolButtons) {
      button.setAttribute('aria-disabled', String(busy
        || (tool.activate !== undefined && !canOpenTool)
        // A cleaned document has tones of its own
        || (tool.id === 'adjust' && threshold.enabled)))
      if (tool.id === 'threshold') {
        button.setAttribute('aria-pressed', String(threshold.enabled))
      }
      if (tool.id === 'adjust') {
        button.setAttribute('aria-expanded', String(adjusting))
      }
    }
    this.thresholdEnabled = threshold.enabled
    this.adjusting = adjusting
    this.threshold.input.disabled = busy
    for (const name of ADJUSTMENTS) {
      this.adjustSliders[name].input.disabled = busy
    }
    if (!this.dragging) {
      this.threshold.input.value = String(threshold.sensitivity)
      for (const name of ADJUSTMENTS) {
        this.adjustSliders[name].input.value = String(adjustments[name])
      }
    }
    this.showSliders()
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
    this.showSliders()
    // The safe choice takes the focus, so pressing Enter again does not lose the work
    this.keepButton.focus()
  }

  /** Moves the keyboard focus to the bar, or to the button of a tool. */
  focus(toolId?: ToolId): void {
    const button = this.toolButtons.find(({ tool }) => tool.id === toolId)?.button
      ?? this.controls.querySelector<HTMLButtonElement>('button[tabindex="0"]')
    button?.focus()
  }

  /**
   * Creates a slider that reports each value while it moves, and the one the user chooses when it is released.
   * `data-paperpic-control` holds the key of its name in the labels.
   */
  private createSlider(
    control: keyof PaperPicLabels,
    className: string,
    min: number,
    onInput: (value: number) => void,
    onChange: (value: number) => void,
  ): Slider {
    const row = document.createElement('label')
    row.className = className
    const name = document.createElement('span')
    const input = document.createElement('input')
    input.dataset.paperpicControl = control
    input.type = 'range'
    input.min = String(min)
    input.max = '1'
    input.step = '0.01'
    input.addEventListener('input', () => {
      this.dragging = true
      onInput(input.valueAsNumber)
    })
    input.addEventListener('change', () => {
      this.dragging = false
      onChange(input.valueAsNumber)
    })
    // The arrow keys move the slider here, instead of panning the image
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        event.stopPropagation()
      }
    })
    row.append(name, input)
    return { row, name, input }
  }

  private showSliders(): void {
    const free = this.activeTool === null && this.confirmation.hidden
    this.showRow(this.threshold.row, 'threshold', free && this.thresholdEnabled && this.offered.has('threshold'))
    this.showRow(this.adjustRow, 'adjust', free && this.adjusting && this.offered.has('adjust'))
  }

  private showRow(row: HTMLElement, toolId: ToolId, visible: boolean): void {
    // A control that disappears must not take the keyboard focus with it
    if (!visible && row.contains(document.activeElement)) {
      this.focus(toolId)
    }
    row.hidden = !visible
  }

  private showHint(): void {
    const hint = this.activeTool?.hint
    this.hint.textContent = this.hintOverride ?? (hint
      ? this.labels[hint]
      : '')
  }

  private closeConfirmation(restoreFocus = true): void {
    const wasOpen = !this.confirmation.hidden
    this.confirmation.hidden = true
    this.controls.hidden = this.activeTool !== null
    this.showSliders()
    if (wasOpen && restoreFocus) {
      this.cancelButton.focus()
    }
  }
}
