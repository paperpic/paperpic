import type { FinishMode } from '../pipeline/operations'
import type { Tool, ToolId } from '../tools/types'
import type { PaperPicIcons } from './icons'
import type { PaperPicLabels } from './labels'
import { FINISH_MODES } from '../pipeline/operations'
import { attachRovingFocus, createButton, nameButton, setIcon } from './button'
import { DEFAULT_ICONS } from './icons'
import { Ruler } from './ruler'

/** A tone that the ruler of Adjust changes. */
export type AdjustmentName = 'brightness' | 'contrast'

const ADJUSTMENTS: readonly AdjustmentName[] = ['brightness', 'contrast']

/** The key of `PaperPicLabels` that names each finish, which its button also carries in `data-paperpic-control`. */
const FINISH_LABELS = {
  original: 'finishOriginal',
  gray: 'finishGray',
  mono: 'finishMono',
} as const satisfies Record<FinishMode, keyof PaperPicLabels>

/** A row of buttons that chooses one of its names, each with a text. */
interface Choice<Name extends string> {
  buttons: Record<Name, HTMLButtonElement>
  element: HTMLElement
  texts: Record<Name, HTMLElement>
}

function createChoice<Name extends string>(names: readonly Name[], control: (name: Name) => keyof PaperPicLabels, choose: (name: Name) => void): Choice<Name> {
  const element = document.createElement('div')
  element.className = 'paperpic-edit-options'
  element.setAttribute('role', 'group')
  const buttons = {} as Record<Name, HTMLButtonElement>
  const texts = {} as Record<Name, HTMLElement>
  for (const name of names) {
    const button = createButton(control(name), () => choose(name), 'paperpic-button paperpic-edit-option')
    const text = document.createElement('span')
    button.append(text)
    element.append(button)
    buttons[name] = button
    texts[name] = text
  }
  return { element, buttons, texts }
}

/** Numbers the elements that others refer to by id, so each viewer of a page has ids of its own. */
let ids = 0

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
  /** Changes what Clean up shows. `released` once the user lets go of the ruler, or chooses a finish. */
  setFinish: (setting: { mode?: FinishMode, sensitivity?: number }, released: boolean) => void
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
  /** The finish on display, which an open Clean up may still change. */
  finish: { mode: FinishMode, sensitivity: number }
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
  private readonly adjustments: Choice<AdjustmentName>
  private readonly finishes: Choice<FinishMode>
  private readonly inUse: HTMLElement
  /** Why Adjust cannot open in black and white, for screen readers. */
  private readonly adjustUnavailable: HTMLElement
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
        if (tool.id === 'adjust' || tool.id === 'finish') {
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
      sensitivity: new Ruler('finishSensitivity', false, (value, released) => commands.setFinish({ sensitivity: value }, released)),
      brightness: new Ruler('brightness', true, (value, released) => commands.setAdjustment('brightness', value, released)),
      contrast: new Ruler('contrast', true, (value, released) => commands.setAdjustment('contrast', value, released)),
    }
    panel.append(this.corners, ...Object.values(this.rulers).map(ruler => ruler.element))

    const choice = document.createElement('div')
    choice.className = 'paperpic-edit-choice'
    this.title = document.createElement('span')
    this.title.className = 'paperpic-edit-title'
    this.adjustments = createChoice(ADJUSTMENTS, name => name, name => this.chooseAdjustment(name))
    // The original turns Clean up off without undoing what came after
    this.finishes = createChoice(FINISH_MODES, mode => FINISH_LABELS[mode], mode => commands.setFinish({ mode }, true))
    choice.append(this.title, this.adjustments.element, this.finishes.element)

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
      [this.adjustments.buttons.brightness, 'brightness'],
      [this.adjustments.buttons.contrast, 'contrast'],
    ]

    const id = ++ids
    this.confirmation = document.createElement('div')
    this.confirmation.className = 'paperpic-edit-confirmation'
    // A group and not a dialog: the question takes the place of the bar, and the rest of the viewer stays usable.
    // Screen readers read its name, the question, as the focus enters it
    this.confirmation.setAttribute('role', 'group')
    this.confirmation.hidden = true
    this.message = document.createElement('span')
    this.message.className = 'paperpic-edit-message'
    this.message.id = `paperpic-question-${id}`
    this.confirmation.setAttribute('aria-labelledby', this.message.id)
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
    this.inUse.id = `paperpic-in-use-${id}`
    this.inUse.hidden = true
    // A disabled button that does not say why leaves screen reader users guessing
    this.adjustUnavailable = document.createElement('span')
    this.adjustUnavailable.id = `paperpic-adjust-unavailable-${id}`
    this.adjustUnavailable.hidden = true

    this.element.append(this.controls, this.toolControls, this.confirmation, this.inUse, this.adjustUnavailable)

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
    this.rulers.sensitivity.setName(labels.finishSensitivity)
    this.adjustments.element.setAttribute('aria-label', labels.adjust)
    for (const name of ADJUSTMENTS) {
      this.rulers[name].setName(labels[name])
      this.adjustments.texts[name].textContent = labels[name]
    }
    this.finishes.element.setAttribute('aria-label', labels.finish)
    for (const mode of FINISH_MODES) {
      this.finishes.texts[mode].textContent = labels[FINISH_LABELS[mode]]
    }
    this.inUse.textContent = labels.inUse
    this.adjustUnavailable.textContent = labels.adjustUnavailable
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
  update({ canUndo, canRedo, canApply, busy, canOpenTool, canZoomIn, canZoomOut, finish, adjustments }: EditBarState): void {
    this.canApply = canApply
    this.busy = busy
    this.undoButton.setAttribute('aria-disabled', String(busy || !canUndo))
    this.redoButton.setAttribute('aria-disabled', String(busy || !canRedo))
    this.applyButton.setAttribute('aria-disabled', String(busy || !canApply))
    this.cancelButton.setAttribute('aria-disabled', String(busy))
    this.updateView({ canZoomIn, canZoomOut })
    // A document in black and white has tones of its own, so brightness and contrast are not in effect
    const mono = finish.mode === 'mono'
    const adjusted = !mono && (adjustments.brightness !== 0 || adjustments.contrast !== 0)
    for (const { tool, button } of this.toolButtons) {
      button.setAttribute('aria-disabled', String(busy
        || (tool.activate !== undefined && !canOpenTool)
        || (tool.id === 'adjust' && mono)))
      if (tool.id === 'adjust') {
        this.markInUse(button, adjusted, mono ? this.adjustUnavailable : null)
      }
      if (tool.id === 'finish') {
        this.markInUse(button, finish.mode !== 'original')
      }
    }
    for (const mode of FINISH_MODES) {
      this.finishes.buttons[mode].setAttribute('aria-pressed', String(mode === finish.mode))
      this.finishes.buttons[mode].setAttribute('aria-disabled', String(busy))
    }
    this.rulers.sensitivity.set(finish.sensitivity)
    this.rulers.sensitivity.setDisabled(busy || !mono)
    for (const name of ADJUSTMENTS) {
      this.rulers[name].set(adjustments[name])
      this.rulers[name].setDisabled(busy)
    }
    this.showPanel()
  }

  /** Updates the zoom buttons of an open tool, which a pan or a zoom changes. */
  updateView({ canZoomIn, canZoomOut }: Pick<EditBarState, 'canZoomIn' | 'canZoomOut'>): void {
    this.zoomInButton.setAttribute('aria-disabled', String(!canZoomIn))
    this.zoomOutButton.setAttribute('aria-disabled', String(!canZoomOut))
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

  /**
   * Moves the keyboard focus to the button of a tool, or to the bar. A tool that a method opened can have its button
   * hidden by `tools`, and a hidden button cannot take the focus, so the bar takes it then.
   */
  focus(toolId?: ToolId): void {
    const button = this.toolButtons.find(({ tool, button: candidate }) => tool.id === toolId && !candidate.hidden)?.button
      ?? this.controls.querySelector<HTMLButtonElement>('button[tabindex="0"]')
    button?.focus()
  }

  /**
   * Moves the keyboard focus to the ruler of the open tool, if it has one, or else to its chosen finish, since a finish
   * other than black and white disables the ruler.
   */
  focusRuler(): void {
    const ruler = Object.values(this.rulers).find(candidate => !candidate.element.hidden)
    if (ruler && !ruler.input.disabled) {
      ruler.input.focus()
    }
    else if (this.activeTool?.id === 'finish') {
      this.finishes.element.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    }
  }

  private chooseAdjustment(name: AdjustmentName): void {
    this.adjustment = name
    this.showPanel()
  }

  /** Shows the controls of the open tool: its corners or its ruler, and its name or its choice. */
  private showPanel(): void {
    const id = this.activeTool?.id
    const name = this.activeTool
      ? this.labels[this.activeTool.actions[0]!.id]
      : ''
    const hasCorners = id === 'crop' || id === 'perspective'
    this.toolControls.setAttribute('aria-label', name)
    this.corners.hidden = !hasCorners
    // A tool without a choice shows its name in its place
    this.title.hidden = !hasCorners
    this.title.textContent = name
    this.rulers.sensitivity.element.hidden = id !== 'finish'
    this.finishes.element.hidden = id !== 'finish'
    this.adjustments.element.hidden = id !== 'adjust'
    for (const name of ADJUSTMENTS) {
      this.rulers[name].element.hidden = id !== 'adjust' || name !== this.adjustment
      this.adjustments.buttons[name].setAttribute('aria-pressed', String(name === this.adjustment))
    }
  }

  /**
   * Shows the dot of a button whose setting is in effect, and describes it so to screen readers. A `reason` describes
   * it instead, such as why it cannot open.
   */
  private markInUse(button: HTMLButtonElement, inUse: boolean, reason: HTMLElement | null = null): void {
    const dot = button.querySelector<HTMLElement>('.paperpic-edit-dot')
    if (dot) {
      dot.hidden = !inUse
    }
    const description = reason ?? (inUse ? this.inUse : null)
    if (description) {
      button.setAttribute('aria-describedby', description.id)
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
