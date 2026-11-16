import type { Mock } from 'vitest'
import type { EditBarCommands, EditBarState } from './edit-bar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOOLS } from '../tools'
import { EditBar } from './edit-bar'
import { DEFAULT_ICONS } from './icons'
import { DEFAULT_LABELS } from './labels'

const state: EditBarState = {
  adjustments: { brightness: 0, contrast: 0 },
  busy: false,
  canApply: false,
  canOpenTool: true,
  canRedo: false,
  canUndo: false,
  canZoomIn: true,
  canZoomOut: true,
  threshold: { enabled: false, sensitivity: 0.5 },
  thresholdInEdits: false,
}

const tool = (id: string) => TOOLS.find(candidate => candidate.id === id)!

describe('editBar', () => {
  let commands: { [K in keyof EditBarCommands]: Mock<EditBarCommands[K]> }
  let bar: EditBar

  const control = (name: string) => bar.element.querySelector<HTMLElement>(`[data-paperpic-control="${name}"]`)!
  const button = (name: string) => control(name) as HTMLButtonElement
  const disabled = (name: string) => button(name).getAttribute('aria-disabled') === 'true'
  const part = (className: string) => bar.element.querySelector<HTMLElement>(`.${className}`)!
  const controls = () => part('paperpic-edit-controls')
  const panel = () => part('paperpic-edit-tool')
  const confirmation = () => part('paperpic-edit-confirmation')
  const ruler = (name: string) => control(name).closest<HTMLElement>('.paperpic-ruler')!
  const shownRuler = () => panel().querySelector<HTMLInputElement>('.paperpic-ruler:not([hidden]) input')!
  const option = (name: string) => panel().querySelector<HTMLButtonElement>(`.paperpic-edit-option[data-paperpic-control="${name}"]`)!

  beforeEach(() => {
    commands = {
      apply: vi.fn(),
      cancel: vi.fn(),
      cancelTool: vi.fn(),
      confirmTool: vi.fn(),
      redo: vi.fn(),
      runTool: vi.fn(),
      setAdjustment: vi.fn(),
      setThreshold: vi.fn(),
      undo: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
    }
    bar = new EditBar(commands, TOOLS, DEFAULT_LABELS)
    document.body.replaceChildren(bar.element)
    bar.setVisible(true)
    bar.update(state)
  })

  it('starts hidden, with a named toolbar of the usual controls', () => {
    expect(new EditBar(commands, TOOLS, DEFAULT_LABELS).element.hidden).toBe(true)
    expect(controls().getAttribute('role')).toBe('toolbar')
    expect(controls().getAttribute('aria-label')).toBe(DEFAULT_LABELS.editBar)
    expect(panel().hidden).toBe(true)
    expect(confirmation().hidden).toBe(true)
  })

  it('has a button per action of each tool, which runs it', () => {
    const actions = TOOLS.flatMap(({ actions }) => actions)
    for (const { id } of actions) {
      expect(button(id).getAttribute('aria-label')).toBe(DEFAULT_LABELS[id])
      button(id).click()
    }
    expect(commands.runTool.mock.calls.map(([run]) => run)).toEqual(actions.map(({ run }) => run))
  })

  it('runs Undo, Redo and Apply only while they are allowed', () => {
    button('undo').click()
    button('redo').click()
    button('apply').click()
    expect(commands.undo).not.toHaveBeenCalled()
    expect(commands.redo).not.toHaveBeenCalled()
    expect(commands.apply).not.toHaveBeenCalled()

    bar.update({
      ...state,
      canUndo: true,
      canRedo: true,
      canApply: true,
    })
    button('undo').click()
    button('redo').click()
    button('apply').click()
    expect(commands.undo).toHaveBeenCalledOnce()
    expect(commands.redo).toHaveBeenCalledOnce()
    expect(commands.apply).toHaveBeenCalledOnce()
  })

  it('disables everything while busy', () => {
    bar.update({
      ...state,
      busy: true,
      canUndo: true,
      canRedo: true,
      canApply: true,
    })
    for (const name of [
      'undo',
      'redo',
      'apply',
      'cancel',
      'crop',
      'flip',
    ]) {
      expect(disabled(name)).toBe(true)
    }
  })

  it('disables only the tools with a selection while one cannot open', () => {
    bar.update({ ...state, canOpenTool: false })
    expect(disabled('crop')).toBe(true)
    expect(disabled('perspective')).toBe(true)
    expect(disabled('flip')).toBe(false)
  })

  it('disables Adjust while the document is cleaned up', () => {
    bar.update({
      ...state,
      threshold: { enabled: true, sensitivity: 0.5 },
    })
    expect(disabled('adjust')).toBe(true)
  })

  it('marks the tools whose setting is in effect, for the eyes and for screen readers', () => {
    const dot = (name: string) => button(name).querySelector<HTMLElement>('.paperpic-edit-dot')!
    expect(dot('adjust').hidden).toBe(true)
    expect(button('adjust').hasAttribute('aria-describedby')).toBe(false)

    bar.update({
      ...state,
      adjustments: { brightness: 0.2, contrast: 0 },
    })
    expect(dot('adjust').hidden).toBe(false)
    const description = document.getElementById(button('adjust').getAttribute('aria-describedby')!)!
    expect(description.textContent).toBe(DEFAULT_LABELS.inUse)

    // A cleaned document has tones of its own
    bar.update({
      ...state,
      adjustments: { brightness: 0.2, contrast: 0 },
      threshold: { enabled: true, sensitivity: 0.5 },
    })
    expect(dot('adjust').hidden).toBe(true)
    expect(button('adjust').hasAttribute('aria-describedby')).toBe(false)
    expect(dot('threshold').hidden).toBe(false)
    expect(button('crop').querySelector('.paperpic-edit-dot')).toBeNull()
  })

  it('shows only the tools chosen', () => {
    bar.setTools(['crop', 'flip'])
    expect(button('crop').hidden).toBe(false)
    expect(button('flip').hidden).toBe(false)
    expect(button('perspective').hidden).toBe(true)
    expect(button('adjust').hidden).toBe(true)
  })

  describe('the panel of a tool', () => {
    it('shows the corners, hint and name of a tool with a selection', () => {
      bar.setActiveTool(tool('crop'))
      expect(controls().hidden).toBe(true)
      expect(panel().hidden).toBe(false)
      expect(panel().getAttribute('aria-label')).toBe(DEFAULT_LABELS.crop)
      expect(part('paperpic-edit-corners').hidden).toBe(false)
      expect(part('paperpic-edit-corners').textContent).toBe(DEFAULT_LABELS.cropHint)
      expect(part('paperpic-edit-title').hidden).toBe(false)
      expect(ruler('brightness').hidden).toBe(true)
      expect(ruler('thresholdSensitivity').hidden).toBe(true)

      bar.setActiveTool(null)
      expect(controls().hidden).toBe(false)
      expect(panel().hidden).toBe(true)
    })

    it('replaces the hint until it is brought back or the tool closes', () => {
      const hint = () => part('paperpic-edit-corners').querySelector('.paperpic-edit-message')!.textContent
      bar.setActiveTool(tool('perspective'))
      expect(hint()).toBe(DEFAULT_LABELS.perspectiveHint)
      bar.setHint('Tap where it goes')
      expect(hint()).toBe('Tap where it goes')
      bar.setHint(null)
      expect(hint()).toBe(DEFAULT_LABELS.perspectiveHint)
      bar.setHint('Tap where it goes')
      bar.setActiveTool(tool('crop'))
      expect(hint()).toBe(DEFAULT_LABELS.cropHint)
    })

    it('runs the zoom buttons while they are allowed, and Cancel and Done', () => {
      bar.setActiveTool(tool('crop'))
      bar.updateView({ canZoomIn: false, canZoomOut: true })
      button('zoomIn').click()
      button('zoomOut').click()
      button('cancelTool').click()
      button('confirm').click()
      expect(commands.zoomIn).not.toHaveBeenCalled()
      expect(commands.zoomOut).toHaveBeenCalledOnce()
      expect(commands.cancelTool).toHaveBeenCalledOnce()
      expect(commands.confirmTool).toHaveBeenCalledOnce()
    })

    it('shows the ruler of Clean up, with its name, and the switch once it is an edit', () => {
      const toggle = () => panel().querySelector<HTMLButtonElement>('[role="switch"]')!
      bar.setActiveTool(tool('threshold'))
      expect(ruler('thresholdSensitivity').hidden).toBe(false)
      expect(part('paperpic-edit-title').hidden).toBe(false)
      expect(toggle().hidden).toBe(true)
      expect(part('paperpic-edit-corners').hidden).toBe(true)

      bar.update({
        ...state,
        thresholdInEdits: true,
        threshold: { enabled: true, sensitivity: 0.7 },
      })
      expect(toggle().hidden).toBe(false)
      expect(part('paperpic-edit-title').hidden).toBe(true)
      expect(toggle().getAttribute('aria-checked')).toBe('true')
      expect((control('thresholdSensitivity') as HTMLInputElement).value).toBe('70')

      toggle().click()
      expect(commands.setThreshold).toHaveBeenCalledWith({ enabled: false }, true)
    })

    it('keeps the ruler of Clean up still while it is off', () => {
      const input = control('thresholdSensitivity') as HTMLInputElement
      bar.setActiveTool(tool('threshold'))
      expect(input.disabled).toBe(true)
      bar.update({
        ...state,
        threshold: { enabled: true, sensitivity: 0.5 },
      })
      expect(input.disabled).toBe(false)

      input.value = '30'
      input.dispatchEvent(new Event('input'))
      expect(commands.setThreshold).toHaveBeenCalledWith({ sensitivity: 0.3 }, false)
    })

    it('chooses between brightness and contrast in Adjust, starting with brightness', () => {
      const pressed = (name: string) => option(name).getAttribute('aria-pressed')
      bar.setActiveTool(tool('adjust'))
      expect(part('paperpic-edit-options').hidden).toBe(false)
      expect(part('paperpic-edit-title').hidden).toBe(true)
      expect(pressed('brightness')).toBe('true')
      expect(shownRuler().dataset.paperpicControl).toBe('brightness')

      option('contrast').click()
      expect(pressed('contrast')).toBe('true')
      expect(pressed('brightness')).toBe('false')
      expect(shownRuler().dataset.paperpicControl).toBe('contrast')
      shownRuler().value = '-40'
      shownRuler().dispatchEvent(new Event('input'))
      expect(commands.setAdjustment).toHaveBeenCalledWith('contrast', -0.4, false)

      bar.setActiveTool(null)
      bar.setActiveTool(tool('adjust'))
      expect(pressed('brightness')).toBe('true')
    })

    it('moves the focus to the ruler of the open tool', () => {
      bar.setActiveTool(tool('adjust'))
      bar.focusRuler()
      expect(document.activeElement).toBe(shownRuler())
    })
  })

  describe('cancelling', () => {
    it('cancels at once without changes to lose', () => {
      button('cancel').click()
      expect(commands.cancel).toHaveBeenCalledOnce()
      expect(confirmation().hidden).toBe(true)
    })

    it('asks first with changes to lose, with the focus on keeping them', () => {
      bar.update({ ...state, canApply: true })
      button('cancel').click()
      expect(commands.cancel).not.toHaveBeenCalled()
      expect(confirmation().hidden).toBe(false)
      expect(controls().hidden).toBe(true)
      expect(confirmation().getAttribute('role')).toBe('alertdialog')
      expect(document.activeElement).toBe(button('keepEditing'))
    })

    it('goes back to editing with Keep editing, with the focus on Cancel', () => {
      bar.update({ ...state, canApply: true })
      button('cancel').click()
      button('keepEditing').click()
      expect(confirmation().hidden).toBe(true)
      expect(controls().hidden).toBe(false)
      expect(document.activeElement).toBe(button('cancel'))
      expect(commands.cancel).not.toHaveBeenCalled()
    })

    it('goes back to editing with Esc, which does not reach the viewer', () => {
      const reached = vi.fn()
      bar.element.addEventListener('keydown', reached)
      bar.update({ ...state, canApply: true })
      button('cancel').click()
      button('keepEditing').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(confirmation().hidden).toBe(true)
      expect(reached).not.toHaveBeenCalled()
      expect(commands.cancel).not.toHaveBeenCalled()
    })

    it('cancels with Discard', () => {
      bar.update({ ...state, canApply: true })
      button('cancel').click()
      button('discard').click()
      expect(commands.cancel).toHaveBeenCalledOnce()
      expect(confirmation().hidden).toBe(true)
    })

    it('closes the question when the bar hides, without moving the focus', () => {
      bar.update({ ...state, canApply: true })
      button('cancel').click()
      bar.setVisible(false)
      expect(bar.element.hidden).toBe(true)
      expect(confirmation().hidden).toBe(true)
      expect(document.activeElement).toBe(button('keepEditing'))
    })

    it('does nothing while busy', () => {
      bar.update({ ...state, busy: true, canApply: true })
      bar.requestCancel(commands)
      expect(commands.cancel).not.toHaveBeenCalled()
      expect(confirmation().hidden).toBe(true)
    })
  })

  it('moves the focus to a tool, or to the bar', () => {
    bar.focus('flip')
    expect(document.activeElement).toBe(button('flip'))
    bar.focus()
    expect(document.activeElement?.getAttribute('tabindex')).toBe('0')
  })

  it('updates its texts and icons', () => {
    bar.setLabels({
      ...DEFAULT_LABELS,
      apply: 'Aplicar',
      discardQuestion: '¿Descartar?',
      brightness: 'Brillo',
    })
    expect(button('apply').getAttribute('aria-label')).toBe('Aplicar')
    expect(button('apply').textContent).toBe('Aplicar')
    expect(confirmation().textContent).toContain('¿Descartar?')
    expect(option('brightness').textContent).toBe('Brillo')

    bar.setIcons({ ...DEFAULT_ICONS, undo: '<svg data-test="undo"></svg>' })
    expect(button('undo').querySelector('[data-test="undo"]')).not.toBeNull()
  })
})
