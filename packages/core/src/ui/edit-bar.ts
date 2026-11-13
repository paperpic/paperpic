import type { Tool, ToolId } from '../tools/types'
import type { PaperPicIcons } from './icons'
import type { PaperPicLabels } from './labels'
import { attachRovingFocus, createButton, nameButton, setIcon } from './button'
import { DEFAULT_ICONS } from './icons'
import { Ruler } from './ruler'

/** A tone that the ruler of Adjust changes. */
export type AdjustmentName = 'brightness' | 'contrast'

const ADJUSTMENTS: readonly AdjustmentName[] = ['brightness', 'contrast']

/** Numbers the description of a tool in use, so each viewer of a page has its own id. */
let descriptions = 0

/** What the edit bar can ask for. It only reaches the viewer through these. */
export interface EditBarCommands {
  apply: () => void
  cancel: () => void
  cancelTool: () => void
  confirmTool: () => void
  redo: () => void
  runTool: (run: Tool['actions'][number]['run']) => void
  /** Changes the brightness or the contrast that Adjust shows. `released` once the user lets go of the ruler. */
  setAdjustment: (name: AdjustmentName, value: number, released: boolean) => void
  /** Changes what Clean up shows. `released` once the user lets go of the ruler. */
  setThreshold: (setting: { enabled?: boolean, sensitivity?: number }, released: boolean) => void
  undo: () => void
  zoomIn: () => void
  zoomOut: () => void
}

/** What the edit bar shows. */
export interface EditBarState {
  /** The brightness and contrast on display, which an open Adjust may still change. */
  adjustments: Record<AdjustmentName, number>
  busy: boolean
  canApply: boolean
  /** Whether a tool with its own selection can open. A preview in progress prevents it. */
  canOpenTool: boolean
  canRedo: boolean
  canUndo: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  /** Whether the edits already clean up the document, so an open Clean up offers its switch to turn it off. */
  cleanedUp: boolean
  /** The clean up on display, which an open Clean up may still change. */
  threshold: { enabled: boolean, sensitivity: number }
}

/** Creates a dot that marks a button whose setting is in effect. */
function createDot(): HTMLElement {
  const dot = document.createElement('span')
  dot.className = 'paperpic-edit-dot'
  dot.hidden = true
  return dot
}

/**
 * The controls of the edit mode, in a card at the bottom with two rows of fixed height, or one on a wide viewer.
 * Above, the tools, and below, Cancel, Undo, Redo and Apply. An open tool replaces them with its panel: its controls
 * above, and below its own Cancel, what it chooses and Done.
 */
export class EditBar {
  readonly element: HTMLElement
  private readonly controls: HTMLElement
  private readonly toolControls: HTMLElement
  private readonly corners: HTMLElement
  private readonly hint: HTMLElement
  private readonly title: HTMLElement
  private readonly rulers: Record<AdjustmentName | 'sensitivity', Ruler>
  private readonly switchButton: HTMLButtonElement
  private readonly switchText: HTMLElement
  private readonly options: HTMLElement
  private readonly optionButtons: Record<AdjustmentName, HTMLButtonElement>
  private readonly optionTexts: Record<AdjustmentName, HTMLElement>
  private readonly inUse: HTMLElement
  private readonly confirmation: HTMLElement
  private readonly message: HTMLElement
  private readonly toolButtons: { button: HTMLButtonElement, id: Tool['actions'][number]['id'], tool: Tool }[] = []
  private readonly cancelToolButton: HTMLButtonElement
  private readonly confirmToolButton: HTMLButtonElement
  private readonly zoomInButton: HTMLButtonElement
  private readonly zoomOutButton: HTMLButtonElement
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
  /** The tone that the ruler of Adjust changes. */
  private adjustment: AdjustmentName = 'brightness'
  /** A hint of the open tool that replaces its usual one, such as the next step after selecting a corner. */
  private hintOverride: string | null = null
  private adjustments: Record<AdjustmentName, number> = { brightness: 0, contrast: 0 }
  private cleanedUp = false
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

    const toolGroup = document.createElement('div')
    toolGroup.className = 'paperpic-edit-tools'
    const toolIcons: [HTMLButtonElement, keyof PaperPicIcons][] = []
    for (const tool of tools) {
      for (const action of tool.actions) {
        const button = createButton(action.id, () => commands.runTool(action.run))
        if (tool.id === 'adjust' || tool.id === 'threshold') {
          button.append(createDot())
        }
        this.toolButtons.push({ tool, id: action.id, button })
        toolIcons.push([button, action.icon ?? action.id])
        toolGroup.append(button)
      }
    }

    const history = document.createElement('div')
    history.className = 'paperpic-edit-history'
    history.append(this.undoButton, this.redoButton)

    this.controls.append(this.cancelButton, toolGroup, history, this.applyButton)

    // The panel of an open tool
    this.toolControls = document.createElement('div')
    this.toolControls.className = 'paperpic-edit-tool'
    this.toolControls.setAttribute('role', 'group')
    this.toolControls.hidden = true
    this.cancelToolButton = createButton('cancelTool', commands.cancelTool)
    this.confirmToolButton = createButton('confirm', commands.confirmTool, 'paperpic-button paperpic-button-primary')

    const panel = document.createElement('div')
    panel.className = 'paperpic-edit-panel'
    this.corners = document.createElement('div')
    this.corners.className = 'paperpic-edit-corners'
    this.hint = document.createElement('span')
    this.hint.className = 'paperpic-edit-message'
    this.zoomOutButton = createButton('zoomOut', commands.zoomOut)
    this.zoomInButton = createButton('zoomIn', commands.zoomIn)
    this.corners.append(this.hint, this.zoomOutButton, this.zoomInButton)
    this.rulers = {
      sensitivity: new Ruler('thresholdSensitivity', false, (value, released) => commands.setThreshold({ sensitivity: value }, released)),
      brightness: new Ruler('brightness', true, (value, released) => commands.setAdjustment('brightness', value, released)),
      contrast: new Ruler('contrast', true, (value, released) => commands.setAdjustment('contrast', value, released)),
    }
    panel.append(this.corners, ...Object.values(this.rulers).map(ruler => ruler.element))

    const choice = document.createElement('div')
    choice.className = 'paperpic-edit-choice'
    this.title = document.createElement('span')
    this.title.className = 'paperpic-edit-title'
    // Clean up turns on when it opens, so Cancel undoes it. Once it is an edit, its switch turns it off without undoing what came after
    this.switchButton = createButton('threshold', () => commands.setThreshold({
      enabled: this.switchButton.getAttribute('aria-checked') !== 'true',
    }, true), 'paperpic-button paperpic-edit-switch')
    this.switchButton.setAttribute('role', 'switch')
    this.switchText = document.createElement('span')
    const track = document.createElement('span')
    track.className = 'paperpic-edit-switch-track'
    const thumb = document.createElement('span')
    thumb.className = 'paperpic-edit-switch-thumb'
    track.append(thumb)
    this.switchButton.append(this.switchText, track)

    this.options = document.createElement('div')
    this.options.className = 'paperpic-edit-options'
    this.options.setAttribute('role', 'group')
    const optionButtons: Partial<Record<AdjustmentName, HTMLButtonElement>> = {}
    const optionTexts: Partial<Record<AdjustmentName, HTMLElement>> = {}
    for (const name of ADJUSTMENTS) {
      const button = createButton(name, () => this.chooseAdjustment(name), 'paperpic-button paperpic-edit-option')
      const text = document.createElement('span')
      button.append(text, createDot())
      this.options.append(button)
      optionButtons[name] = button
      optionTexts[name] = text
    }
    this.optionButtons = optionButtons as Record<AdjustmentName, HTMLButtonElement>
    this.optionTexts = optionTexts as Record<AdjustmentName, HTMLElement>
    choice.append(this.title, this.switchButton, this.options)

    this.toolControls.append(this.cancelToolButton, panel, choice, this.confirmToolButton)

    this.iconButtons = [
      [this.cancelButton, 'cancel'],
      ...toolIcons,
      [this.undoButton, 'undo'],
      [this.redoButton, 'redo'],
      [this.applyButton, 'apply'],
      [this.cancelToolButton, 'cancel'],
      [this.confirmToolButton, 'apply'],
      [this.zoomOutButton, 'zoomOut'],
      [this.zoomInButton, 'zoomIn'],
      [this.optionButtons.brightness, 'brightness'],
      [this.optionButtons.contrast, 'contrast'],
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

    // Screen readers hear the dot of a tool in use as its description
    this.inUse = document.createElement('span')
    this.inUse.id = `paperpic-in-use-${++descriptions}`
    this.inUse.hidden = true

    this.element.append(this.controls, this.toolControls, this.confirmation, this.inUse)

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
    this.showPanel()
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
    nameButton(this.zoomInButton, labels.zoomIn)
    nameButton(this.zoomOutButton, labels.zoomOut)
    this.rulers.sensitivity.setName(labels.thresholdSensitivity)
    this.switchText.textContent = labels.threshold
    this.options.setAttribute('aria-label', labels.adjust)
    for (const name of ADJUSTMENTS) {
      this.rulers[name].setName(labels[name])
      this.optionTexts[name].textContent = labels[name]
    }
    this.inUse.textContent = labels.inUse
    this.showHint()
    this.showPanel()
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

  /** Shows the panel of an open tool, or the usual controls with `null`. */
  setActiveTool(tool: Tool | null): void {
    this.activeTool = tool
    this.hintOverride = null
    if (tool?.id === 'adjust') {
      this.adjustment = 'brightness'
    }
    this.toolControls.hidden = tool === null
    this.controls.hidden = tool !== null || !this.confirmation.hidden
    this.showHint()
    this.showPanel()
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

  /** Updates what the buttons allow, and what the panel of an open tool shows. */
  update({ canUndo, canRedo, canApply, busy, canOpenTool, canZoomIn, canZoomOut, cleanedUp, threshold, adjustments }: EditBarState): void {
    this.canApply = canApply
    this.busy = busy
    this.adjustments = adjustments
    this.cleanedUp = cleanedUp
    this.undoButton.setAttribute('aria-disabled', String(busy || !canUndo))
    this.redoButton.setAttribute('aria-disabled', String(busy || !canRedo))
    this.applyButton.setAttribute('aria-disabled', String(busy || !canApply))
    this.cancelButton.setAttribute('aria-disabled', String(busy))
    this.zoomInButton.setAttribute('aria-disabled', String(!canZoomIn))
    this.zoomOutButton.setAttribute('aria-disabled', String(!canZoomOut))
    // A cleaned document has tones of its own, so brightness and contrast are not in effect
    const adjusted = !threshold.enabled && (adjustments.brightness !== 0 || adjustments.contrast !== 0)
    for (const { tool, button } of this.toolButtons) {
      button.setAttribute('aria-disabled', String(busy
        || (tool.activate !== undefined && !canOpenTool)
        || (tool.id === 'adjust' && threshold.enabled)))
      if (tool.id === 'adjust') {
        this.markInUse(button, adjusted)
      }
      if (tool.id === 'threshold') {
        this.markInUse(button, threshold.enabled)
      }
    }
    this.switchButton.setAttribute('aria-checked', String(threshold.enabled))
    this.rulers.sensitivity.set(threshold.sensitivity)
    this.rulers.sensitivity.setDisabled(busy || !threshold.enabled)
    for (const name of ADJUSTMENTS) {
      this.rulers[name].set(adjustments[name])
      this.rulers[name].setDisabled(busy)
    }
    this.showPanel()
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

  /** Moves the keyboard focus to the ruler of the open tool, if it has one. */
  focusRuler(): void {
    Object.values(this.rulers).find(ruler => !ruler.element.hidden)?.input.focus()
  }

  private chooseAdjustment(name: AdjustmentName): void {
    this.adjustment = name
    this.showPanel()
  }

  /** Shows the controls of the open tool: its corners or its ruler, and its name, its switch or its choice. */
  private showPanel(): void {
    const id = this.activeTool?.id
    const name = this.activeTool
      ? this.labels[this.activeTool.actions[0]!.id]
      : ''
    const hasCorners = id === 'crop' || id === 'perspective'
    const hasSwitch = id === 'threshold' && this.cleanedUp
    this.toolControls.setAttribute('aria-label', name)
    this.corners.hidden = !hasCorners
    // A tool without a switch or a choice shows its name in their place
    this.title.hidden = !hasCorners && !(id === 'threshold' && !hasSwitch)
    this.title.textContent = name
    this.rulers.sensitivity.element.hidden = id !== 'threshold'
    this.switchButton.hidden = !hasSwitch
    this.options.hidden = id !== 'adjust'
    for (const name of ADJUSTMENTS) {
      this.rulers[name].element.hidden = id !== 'adjust' || name !== this.adjustment
    }
    this.showOptions()
  }

  private showOptions(): void {
    for (const name of ADJUSTMENTS) {
      this.optionButtons[name].setAttribute('aria-pressed', String(name === this.adjustment))
      this.markInUse(this.optionButtons[name], this.adjustments[name] !== 0)
    }
  }

  /** Shows the dot of a button whose setting is in effect, and describes it so to screen readers. */
  private markInUse(button: HTMLButtonElement, inUse: boolean): void {
    const dot = button.querySelector<HTMLElement>('.paperpic-edit-dot')
    if (dot) {
      dot.hidden = !inUse
    }
    if (inUse) {
      button.setAttribute('aria-describedby', this.inUse.id)
    }
    else {
      button.removeAttribute('aria-describedby')
    }
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
    if (wasOpen && restoreFocus) {
      this.cancelButton.focus()
    }
  }
}
