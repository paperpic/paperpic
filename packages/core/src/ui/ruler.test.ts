import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Ruler } from './ruler'

describe('ruler', () => {
  const onChange = vi.fn()

  beforeEach(() => {
    onChange.mockClear()
  })

  const move = (ruler: Ruler, value: number) => {
    ruler.input.value = String(value)
    ruler.input.dispatchEvent(new Event('input'))
  }
  const shown = (ruler: Ruler) => ruler.element.querySelector('.paperpic-ruler-value')!.textContent

  it('is a range from 0 to 100, which names its control', () => {
    const ruler = new Ruler('thresholdSensitivity', false, onChange)
    expect(ruler.input).toMatchObject({
      type: 'range',
      min: '0',
      max: '100',
      step: '1',
    })
    expect(ruler.input.dataset.paperpicControl).toBe('thresholdSensitivity')
    expect(ruler.element.className).toBe('paperpic-ruler')
    expect(ruler.element.querySelector('.paperpic-ruler-middle')).toBeNull()
  })

  it('goes from -100 to 100 when centered, with a mark at the middle', () => {
    const ruler = new Ruler('brightness', true, onChange)
    expect(ruler.input).toMatchObject({ min: '-100', max: '100' })
    expect(ruler.element.classList.contains('paperpic-ruler-centered')).toBe(true)
    expect(ruler.element.querySelector('.paperpic-ruler-middle')).not.toBeNull()
  })

  it('reports each value as a fraction while it moves, and once more when the user lets go', () => {
    const ruler = new Ruler('thresholdSensitivity', false, onChange)
    move(ruler, 40)
    ruler.input.dispatchEvent(new Event('change'))
    expect(onChange.mock.calls).toEqual([
      [0.4, false],
      [0.4, true],
    ])
  })

  it('catches the needle near the middle when centered', () => {
    const ruler = new Ruler('contrast', true, onChange)
    move(ruler, -3)
    expect(ruler.input.value).toBe('0')
    move(ruler, 4)
    expect(onChange.mock.calls).toEqual([
      [0, false],
      [0.04, false],
    ])
  })

  it('does not catch the needle when it is not centered', () => {
    const ruler = new Ruler('thresholdSensitivity', false, onChange)
    move(ruler, 2)
    expect(onChange).toHaveBeenCalledWith(0.02, false)
  })

  it('shows the value above the needle, with a sign when centered, hidden from screen readers', () => {
    const ruler = new Ruler('brightness', true, onChange)
    const value = ruler.element.querySelector<HTMLElement>('.paperpic-ruler-value')!
    expect(value.getAttribute('aria-hidden')).toBe('true')
    ruler.set(0.25)
    expect(shown(ruler)).toBe('+25')
    ruler.set(-0.5)
    expect(shown(ruler)).toBe('−50')
    ruler.set(0)
    expect(shown(ruler)).toBe('0')
    expect(value.style.left).toContain('calc(0.5 *')

    const plain = new Ruler('thresholdSensitivity', false, onChange)
    plain.set(0.3)
    expect(shown(plain)).toBe('30')
  })

  it('moves the needle without reporting it', () => {
    const ruler = new Ruler('thresholdSensitivity', false, onChange)
    ruler.set(0.555)
    expect(ruler.input.value).toBe('56')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the arrow keys for itself, and lets Enter and Esc reach the viewer', () => {
    const ruler = new Ruler('thresholdSensitivity', false, onChange)
    const parent = document.createElement('div')
    parent.append(ruler.element)
    const reached = vi.fn()
    parent.addEventListener('keydown', event => reached(event.key))
    for (const key of ['ArrowLeft', 'Enter', 'Escape']) {
      ruler.input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }
    expect(reached.mock.calls).toEqual([
      ['Enter'],
      ['Escape'],
    ])
  })

  it('takes a name and can be disabled', () => {
    const ruler = new Ruler('thresholdSensitivity', false, onChange)
    ruler.setName('Sensitivity')
    ruler.setDisabled(true)
    expect(ruler.input.getAttribute('aria-label')).toBe('Sensitivity')
    expect(ruler.input.disabled).toBe(true)
  })
})
