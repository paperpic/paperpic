import type { Operation } from '../pipeline/operations'
import type { Quad } from '../processing/types'
import type { ToolContext, ToolHost } from './types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { previewRedaction, redactAreas, toPipelineSteps, toPreviewSteps, trailingRotation } from '../pipeline/operations'
import { renderPreview } from '../pipeline/preview'
import { planRead } from '../pipeline/read-plan'
import { applySteps } from '../pipeline/steps'
import { rectangleCorners, scaleQuad } from '../processing/homography'
import { stubCanvas } from '../test/canvas'
import { filled, loadedImage, picture } from '../test/images'
import { toolHost } from '../test/tool-host'
import { boxCorners, boxOf } from './corners'
import { areaGrip, redactTool, turnGrip } from './redact'

const frame = { width: 1000, height: 500 }
const right = { type: 'rotate', direction: 1 } as const
const left = { type: 'rotate', direction: -1 } as const

/** Covers the top left quarter. */
function redact(color: 'black' | 'white' = 'black'): Operation {
  return {
    type: 'redact',
    color,
    quad: [
      { x: 0, y: 0 },
      { x: 0.5, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 0, y: 0.5 },
    ],
  }
}

describe('redact tool', () => {
  let host: ToolHost
  let color: 'black' | 'white'

  const control = (name: string) => host.layer.querySelector<HTMLButtonElement>(`[data-paperpic-control="${name}"]`)!
  const press = (target: Element, key: string, shiftKey = false) => target.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    shiftKey,
    bubbles: true,
    cancelable: true,
  }))

  beforeEach(() => {
    color = 'black'
    host = toolHost(frame, {
      redactColor: () => color,
    })
    document.body.replaceChildren(host.layer)
  })

  it('opens itself from its button', () => {
    const context = {
      openTool: vi.fn(),
    } as unknown as ToolContext
    redactTool.actions[0]!.run(context)
    expect(context.openTool).toHaveBeenCalledWith('redact')
  })

  it('starts with a band across the middle, and gives it with the color chosen at Done', () => {
    const session = redactTool.activate!(host)
    color = 'white'
    expect(session.confirm()).toEqual({
      type: 'redact',
      color: 'white',
      quad: [
        { x: 0.25, y: 0.4 },
        { x: 0.75, y: 0.4 },
        { x: 0.75, y: 0.6 },
        { x: 0.25, y: 0.6 },
      ],
    })
  })

  it('draws the area with a drag on the image, inside it and in any direction', () => {
    const announce = vi.fn()
    host.announce = announce
    const session = redactTool.activate!(host)
    expect(session.canDrag!()).toBe(true)
    const drag = session.drag!({ x: 300, y: 400 })!
    drag.move({ x: 200, y: 450 })
    drag.move({ x: -50, y: 350 })
    drag.end()
    expect(session.confirm()).toMatchObject({
      quad: scaleQuad(rectangleCorners(0, 350, 300, 400), 1 / frame.width, 1 / frame.height),
    })
    expect(announce).toHaveBeenCalledWith('Area: 150, 375')
  })

  it('never draws an area too small to grab, not even at an edge', () => {
    const session = redactTool.activate!(host)
    session.drag!({ x: 1000, y: 500 })!.move({ x: 1000, y: 490 })
    expect(session.confirm()).toMatchObject({
      quad: scaleQuad(rectangleCorners(984, 484, 1000, 500), 1 / frame.width, 1 / frame.height),
    })
  })

  it('goes back to the area it had when a drag is cancelled, and can be drawn again', () => {
    const session = redactTool.activate!(host)
    const start = session.confirm()
    const drag = session.drag!({ x: 10, y: 10 })!
    drag.move({ x: 100, y: 100 })
    drag.cancel()
    expect(session.confirm()).toEqual(start)
    expect(session.canDrag!()).toBe(true)
  })

  it('leaves the drag to pan once the user has placed the area', () => {
    const drawn = redactTool.activate!(host)
    const drag = drawn.drag!({ x: 10, y: 10 })!
    drag.move({ x: 100, y: 100 })
    drag.end()
    expect(drawn.canDrag!()).toBe(false)
    expect(drawn.drag!({ x: 10, y: 10 })).toBeNull()
    drawn.deactivate()

    const nudged = redactTool.activate!(host)
    press(control('redactArea'), 'ArrowLeft')
    expect(nudged.drag!({ x: 10, y: 10 })).toBeNull()
  })

  it('leaves a press on the area to the image until it is placed, and keeps it after that', () => {
    const session = redactTool.activate!(host)
    const onPress = vi.fn()
    host.layer.addEventListener('pointerdown', onPress)
    const area = control('redactArea')
    area.setPointerCapture = vi.fn()
    const pressArea = () => area.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    pressArea()
    expect(onPress).toHaveBeenCalledOnce()
    expect(session.canDrag!()).toBe(true)

    press(area, 'ArrowLeft')
    pressArea()
    expect(onPress).toHaveBeenCalledOnce()
    expect(area.setPointerCapture).toHaveBeenCalledOnce()
  })

  it('selects the area with a tap on it, and then moves it to the next tap', () => {
    const session = redactTool.activate!(host)
    expect(session.tap!({ x: 10, y: 10 })).toBe(false)
    expect(session.tap!({ x: 500, y: 250 })).toBe(true)
    expect(control('redactArea').getAttribute('aria-pressed')).toBe('true')
    expect(session.canDrag!()).toBe(false)
    expect(session.tap!({ x: 300, y: 100 })).toBe(true)
    expect(session.confirm()).toMatchObject({
      quad: scaleQuad(rectangleCorners(50, 50, 550, 150), 1 / frame.width, 1 / frame.height),
    })
    // The area takes its own presses from here on
    expect(session.tap!({ x: 300, y: 100 })).toBe(false)
  })

  it('says nothing when the tool closes during a drag', () => {
    const announce = vi.fn()
    host.announce = announce
    const session = redactTool.activate!(host)
    const drag = session.drag!({ x: 10, y: 10 })!
    drag.move({ x: 100, y: 100 })
    session.deactivate()
    drag.end()
    expect(announce).not.toHaveBeenCalled()
  })

  it('turns by its handle, keeps its size, and tells the angle', () => {
    const announce = vi.fn()
    host.announce = announce
    const session = redactTool.activate!(host)
    const turn = control('redactTurn')
    press(turn, 'ArrowRight', true)
    press(turn, 'ArrowLeft')
    expect(announce).toHaveBeenLastCalledWith('Angle 9°')

    const operation = session.confirm()!
    const box = boxOf(operation.type === 'redact'
      ? scaleQuad(operation.quad, frame.width, frame.height)
      : rectangleCorners(0, 0, 0, 0))
    expect(box.angle / (Math.PI / 180)).toBeCloseTo(9)
    expect(box.width).toBeCloseTo(500)
    expect(box.height).toBeCloseTo(100)
    expect(box.center.x).toBeCloseTo(500)
    expect(box.center.y).toBeCloseTo(250)
  })

  it('snaps back level when the handle points almost straight up', () => {
    const turned = boxCorners({
      center: { x: 500, y: 250 },
      width: 500,
      height: 100,
      angle: 0.3,
    })
    // 2 degrees to the right of the top of the center
    const point = { x: 500 + Math.sin(2 * Math.PI / 180) * 100, y: 250 - Math.cos(2 * Math.PI / 180) * 100 }
    expect(boxOf(turnGrip.move(turned, point, frame)).angle).toBeCloseTo(0)
    expect(boxOf(turnGrip.move(turned, { x: 600, y: 150 }, frame)).angle).toBeCloseTo(Math.PI / 4)
  })

  it('sits outside the top side, at the same distance on screen at any zoom', () => {
    const corners = rectangleCorners(250, 200, 750, 300)
    expect(turnGrip.position(corners, host)).toEqual({ x: 500, y: 168 })
    const zoomed = {
      ...host,
      frameToViewport: ({ x, y }: { x: number, y: number }) => ({ x: x * 2, y: y * 2 }),
      viewportToFrame: ({ x, y }: { x: number, y: number }) => ({ x: x / 2, y: y / 2 }),
    }
    expect(turnGrip.position(corners, zoomed)).toEqual({ x: 500, y: 184 })
  })

  it('moves as a whole, without changing its shape, and its center stays in the image', () => {
    const announce = vi.fn()
    host.announce = announce
    const session = redactTool.activate!(host)
    for (let times = 0; times < 3; times++) {
      press(control('redactArea'), 'ArrowDown', true)
    }
    expect(announce).toHaveBeenLastCalledWith('Area: 500, 280')
    expect(session.confirm()).toMatchObject({
      quad: [
        { x: 0.25, y: 0.46 },
        { x: 0.75, y: 0.46 },
        { x: 0.75, y: 0.66 },
        { x: 0.25, y: 0.66 },
      ],
    })
    const moved = areaGrip.move(rectangleCorners(250, 200, 750, 300), { x: 2000, y: -50 }, frame)
    expect(boxOf(moved).center).toEqual({ x: 1000, y: 0 })
  })

  it('covers the turned area in the result, along its slope', () => {
    const turned = boxCorners({
      center: { x: 10, y: 10 },
      width: 16,
      height: 4,
      angle: -Math.PI / 12,
    })
    const operation: Operation = {
      type: 'redact',
      color: 'black',
      quad: turned.map(({ x, y }) => ({ x: x / 20, y: y / 20 })) as unknown as Quad,
    }
    const rows = picture(applySteps(filled(20, 20), toPipelineSteps([operation])))
    // The right end sits higher than the left end
    expect(rows[6]!.lastIndexOf('#')).toBeGreaterThan(rows[6]!.indexOf('#'))
    expect(rows[6]!.indexOf('#')).toBeGreaterThan(9)
    expect(rows[13]!.lastIndexOf('#')).toBeLessThan(10)
  })

  it('paints the area in its color, and leaves the rest of the image undimmed', () => {
    const session = redactTool.activate!(host)
    const fills: string[] = []
    const context = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(function (this: CanvasRenderingContext2D) {
        fills.push(String(this.fillStyle))
      }),
      canvas: document.createElement('canvas'),
    } as unknown as CanvasRenderingContext2D
    session.drawOverlay(context)
    color = 'white'
    session.drawOverlay(context)
    expect(fills).toEqual(['#000', '#fff'])
    // The whole frame is never traced, which only dimming the outside needs
    expect(context.moveTo).not.toHaveBeenCalledWith(0, 0)
  })
})

describe('redact areas', () => {
  it('runs after the tones, so black and white never wash out the cover', () => {
    const mono: Operation = {
      type: 'finish',
      mode: 'mono',
      sensitivity: 0.5,
      softness: 0.25,
    }
    const steps = toPipelineSteps([
      redact(),
      mono,
    ])
    expect(steps.map(({ type }) => type)).toEqual(['threshold', 'redact'])
    // A threshold turns the inside of a large black area white, because it compares each pixel with its surroundings
    expect(picture(applySteps(filled(4, 4), steps)).slice(0, 2).map(row => row.slice(0, 2))).toEqual(['##', '##'])
  })

  it('needs no other edit to apply', () => {
    expect(toPipelineSteps([
      redact(),
    ])).toEqual([
      {
        type: 'redact',
        areas: [
          {
            color: 'black',
            points: [
              { x: 0, y: 0 },
              { x: 0.5, y: 0 },
              { x: 0.5, y: 0.5 },
              { x: 0, y: 0.5 },
            ],
          },
        ],
      },
    ])
  })

  it('follows a turn and a flip after it', () => {
    expect(picture(applySteps(filled(4, 4), toPipelineSteps([
      redact(),
      right,
    ])))).toEqual([
      '--##',
      '--##',
      '----',
      '----',
    ])
    expect(picture(applySteps(filled(4, 4), toPipelineSteps([
      redact(),
      left,
      { type: 'flip' },
    ])))).toEqual([
      '----',
      '----',
      '--##',
      '--##',
    ])
  })

  it('keeps only what a later crop leaves', () => {
    const crop: Operation = {
      type: 'crop',
      rect: {
        x: 0.25,
        y: 0.25,
        width: 0.75,
        height: 0.75,
      },
    }
    const [area] = redactAreas([
      redact(),
      crop,
    ])
    for (const { x, y } of area!.points) {
      expect(x).toBeGreaterThanOrEqual(-1e-9)
      expect(x).toBeLessThanOrEqual(1 / 3 + 1e-9)
      expect(y).toBeGreaterThanOrEqual(-1e-9)
      expect(y).toBeLessThanOrEqual(1 / 3 + 1e-9)
    }
    expect(redactAreas([
      redact(),
      {
        type: 'crop',
        rect: {
          x: 0.5,
          y: 0.5,
          width: 0.5,
          height: 0.5,
        },
      },
    ])).toEqual([])
  })

  it('bends with Straighten', () => {
    const straighten: Operation = {
      type: 'perspective',
      aspectRatio: 1,
      quad: [
        { x: 0, y: 0 },
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0, y: 1 },
      ],
    }
    const [area] = redactAreas([
      redact('white'),
      straighten,
    ])
    // The left half becomes the whole image, so its top left quarter becomes the top half
    expect(area!.color).toBe('white')
    expect(area!.points.map(({ x, y }) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100])).toEqual([
      [0, 0],
      [1, 0],
      [1, 0.5],
      [0, 0.5],
    ])
  })

  it('stays out of the shape that the preview computes, and turns back by the rotation of the view', () => {
    const operations = [
      redact(),
      right,
    ]
    expect(toPreviewSteps(operations)).toEqual([])
    expect(trailingRotation(operations)).toBe(90)
    expect(previewRedaction(operations)!.areas[0]!.points).toEqual(redactAreas([
      redact(),
    ])[0]!.points)
    expect(previewRedaction([right])).toBeNull()
  })

  it('stays in the plan of the read, after the steps of the shape', () => {
    const steps = toPipelineSteps([
      {
        type: 'crop',
        rect: { x: 0, y: 0, width: 0.5, height: 1 },
      },
      redact(),
    ])
    expect(planRead({ width: 100, height: 100 }, steps).steps.map(({ type }) => type)).toEqual(['redact'])
  })
})

describe('preview of redact', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('covers the areas over the tones, also when a ruler repaints them', async () => {
    const { putImageData } = stubCanvas((width, height) => new Uint8ClampedArray(width * height * 4).fill(128))
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(loadedImage(4, 4), [], { type: 'adjust', brightness: 0, contrast: 0 }, previewRedaction([
      redact('white'),
    ]), runner)
    const painted = () => picture(putImageData.mock.calls.at(-1)![0])
    expect(painted()[0]).toBe('..--')

    preview.tint!({ type: 'adjust', brightness: -1, contrast: 0 })

    const rows = painted()
    expect(rows.slice(0, 2).map(row => row.slice(0, 2))).toEqual(['..', '..'])
    expect(rows[3]).not.toContain('.')
  })
})
