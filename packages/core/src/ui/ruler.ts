import type { PaperPicLabels } from './labels'

/** The width of the needle's grip, which keeps the needle half of it in from each end, as a native range does. */
const GRIP = '1.5rem'
/** How close to the middle a centered ruler catches the needle, in steps. */
const CATCH = 3

/**
 * A slider drawn as a ruler: a native range over tick marks, with the value above the needle. The keyboard and screen
 * readers use it as any range, from 0 to 100, or from -100 to 100 when it is centered. It reports each value while it
 * moves, from 0 to 1 or from -1 to 1, and once more when the user lets go.
 */
export class Ruler {
  readonly element: HTMLElement
  readonly input: HTMLInputElement
  private readonly fill: HTMLElement
  private readonly value: HTMLElement
  private readonly sign: HTMLElement
  private readonly digits: Text
  private readonly centered: boolean

  /**
   * @param control The key of the label that names the ruler, which its `data-paperpic-control` also holds.
   * @param centered Whether the ruler goes from -1 to 1, with the middle as no change.
   */
  constructor(control: keyof PaperPicLabels, centered: boolean, onChange: (value: number, released: boolean) => void) {
    this.centered = centered
    this.element = document.createElement('div')
    this.element.className = centered
      ? 'paperpic-ruler paperpic-ruler-centered'
      : 'paperpic-ruler'

    const ticks = document.createElement('div')
    ticks.className = 'paperpic-ruler-ticks'
    this.fill = document.createElement('div')
    this.fill.className = 'paperpic-ruler-ticks paperpic-ruler-fill'
    this.value = document.createElement('span')
    this.value.className = 'paperpic-ruler-value'
    // The range reads its own value to screen readers
    this.value.setAttribute('aria-hidden', 'true')
    // The sign hangs outside the digits, which center on the needle
    this.sign = document.createElement('span')
    this.sign.className = 'paperpic-ruler-sign'
    this.digits = document.createTextNode('')
    this.value.append(this.sign, this.digits)

    this.input = document.createElement('input')
    this.input.className = 'paperpic-ruler-input'
    this.input.dataset.paperpicControl = control
    this.input.type = 'range'
    this.input.min = centered ? '-100' : '0'
    this.input.max = '100'
    this.input.step = '1'
    this.input.addEventListener('input', () => {
      // The middle catches the needle, so no change is easy to find again
      if (this.centered && this.input.valueAsNumber !== 0 && Math.abs(this.input.valueAsNumber) <= CATCH) {
        this.input.value = '0'
      }
      this.show()
      onChange(this.input.valueAsNumber / 100, false)
    })
    this.input.addEventListener('change', () => onChange(this.input.valueAsNumber / 100, true))
    // The arrow keys move the ruler here, instead of panning the image. Enter and Esc go on, to close the tool
    this.input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== 'Escape') {
        event.stopPropagation()
      }
    })

    this.element.append(ticks, this.fill)
    if (centered) {
      const middle = document.createElement('div')
      middle.className = 'paperpic-ruler-middle'
      this.element.append(middle)
    }
    this.element.append(this.value, this.input)
    this.show()
  }

  /** Moves the needle to a value from 0 to 1, or from -1 to 1. */
  set(value: number): void {
    const next = String(Math.round(value * 100))
    if (this.input.value !== next) {
      this.input.value = next
      this.show()
    }
  }

  /** Names the ruler for screen readers. */
  setName(name: string): void {
    this.input.setAttribute('aria-label', name)
  }

  /** Keeps the ruler from moving, such as while Clean up is off. */
  setDisabled(disabled: boolean): void {
    this.input.disabled = disabled
  }

  /** Puts the value above the needle, and colors the marks between the start, or the middle, and the needle. */
  private show(): void {
    const value = this.input.valueAsNumber
    const min = this.centered
      ? -100
      : 0
    const position = (value - min) / (100 - min)
    const from = this.centered
      ? Math.min(position, 0.5)
      : 0
    const to = this.centered
      ? Math.max(position, 0.5)
      : position
    const at = (fraction: number) => `(${fraction} * (100% - ${GRIP}) + ${GRIP} / 2)`

    this.sign.textContent = value < 0
      ? '−'
      : this.centered && value > 0
        ? '+'
        : ''
    this.digits.data = String(Math.abs(value))
    this.value.style.left = `calc${at(position)}`
    this.fill.style.clipPath = `inset(0 calc(100% - ${at(to)} - 0.5px) 0 calc(${at(from)} - 0.5px))`
  }
}
