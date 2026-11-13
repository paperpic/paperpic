import type { PreparedThreshold } from '../../../packages/core/src/processing/threshold'
import type { PixelBuffer, Quad } from '../../../packages/core/src/processing/types'
import type { WorkerRequest, WorkerResponse } from '../../../packages/core/src/processing/worker'
import { renderHeader } from 'playground-shared/page'
import { estimateOutputSize } from '../../../packages/core/src/processing/homography'
import { adaptiveThreshold, applyThreshold, prepareThreshold } from '../../../packages/core/src/processing/threshold'
import { warpPerspective } from '../../../packages/core/src/processing/warp'
import './style.css'

interface Row {
  /** Median in milliseconds, or null when it failed. */
  milliseconds: number | null
  note: string
  operation: string
  size: string
  where: string
}

/** A worker request without its id, keeping the union of operations apart. */
type Job<T = WorkerRequest> = T extends unknown ? Omit<T, 'id'> : never

const element = <T extends HTMLElement>(id: string) => document.querySelector<T>(`#${id}`)!

const cornersInput = element<HTMLInputElement>('corners')
const sizesInput = element<HTMLInputElement>('sizes')
const runsInput = element<HTMLInputElement>('runs')
const sensitivityInput = element<HTMLInputElement>('sensitivity')
const log = element('log')
const resultsBody = element<HTMLTableElement>('results').tBodies[0]!
const jsonOutput = element<HTMLTextAreaElement>('json')
const previews = element('previews')

const rows: Row[] = []

document.querySelector('.layout')!.prepend(renderHeader('Benchmarks'))

let photo: File | undefined

for (const input of document.querySelectorAll<HTMLInputElement>('input[name="photo"]')) {
  input.addEventListener('change', () => {
    const file = input.files?.[0]
    if (file) {
      photo = file
      element('photo-name').textContent = `${file.name}, ${(file.size / 1e6).toFixed(1)} MB`
      say('Ready. Run the benchmarks or show the visual results.')
    }
  })
}

/** Shows a message, with a pulsing dot while work goes on. */
function say(message: string, busy = false) {
  log.textContent = message
  log.toggleAttribute('data-busy', busy)
}

/** Gives the browser a chance to paint the log before a long task. */
const nextFrame = () => new Promise(resolve => setTimeout(resolve, 30))

function median(values: number[]): number {
  const sorted = [...values].sort((first, second) => first - second)
  return sorted[Math.floor(sorted.length / 2)]!
}

function record(row: Row) {
  rows.push(row)
  // One short line per result, because phones struggle to select long text
  jsonOutput.value = [
    navigator.userAgent,
    `${navigator.hardwareConcurrency} cores`,
    ...rows.map(({ size, operation, where, milliseconds, note }) =>
      [
        size,
        operation,
        where,
        milliseconds === null
          ? 'FAILED'
          : Math.round(milliseconds),
        note,
      ].join(' | ')),
  ].join('\n')
  const line = resultsBody.insertRow()
  line.classList.toggle('bench-failed', row.milliseconds === null)
  const cells = [
    row.size,
    row.operation,
    row.where,
    row.milliseconds === null
      ? 'FAILED'
      : `${Math.round(row.milliseconds)} ms`,
    row.note,
  ]
  for (const [index, text] of cells.entries()) {
    const cell = line.insertCell()
    cell.textContent = text
    cell.classList.toggle('bench-number', index === 3)
  }
}

async function measure(row: Omit<Row, 'milliseconds' | 'note'>, runs: number, operation: () => Promise<number | void> | number | void, note = '') {
  say(`Running ${row.operation} at ${row.size}, ${row.where}…`, true)
  await nextFrame()
  try {
    const times: number[] = []
    for (let run = 0; run < runs; run++) {
      const start = performance.now()
      const reported = await operation()
      times.push(typeof reported === 'number'
        ? reported
        : performance.now() - start)
    }
    record({
      ...row,
      milliseconds: median(times),
      note,
    })
  }
  catch (error) {
    record({
      ...row,
      milliseconds: null,
      note: String(error),
    })
  }
}

function readCorners(width: number, height: number): Quad {
  const values = cornersInput.value.split(',').map(Number)
  if (values.length !== 8 || values.some(Number.isNaN)) {
    throw new RangeError('Write eight numbers separated by commas.')
  }
  const point = (index: number) => ({ x: values[index]! * width, y: values[index + 1]! * height })
  return [
    point(0),
    point(2),
    point(4),
    point(6),
  ]
}

/** Reads a value such as `80/204`. Empty means the proportions are estimated. */
function readAspectRatio(): number | undefined {
  const text = element<HTMLInputElement>('aspect').value.trim()
  if (!text) {
    return undefined
  }
  const [width, height = '1'] = text.split('/')
  return Number(width) / Number(height)
}

function bitmapSize(bitmap: ImageBitmap, megapixels: number | 'full') {
  if (megapixels === 'full') {
    return { width: bitmap.width, height: bitmap.height }
  }
  const scale = Math.min(1, Math.sqrt(megapixels * 1e6 / (bitmap.width * bitmap.height)))
  return {
    width: Math.round(bitmap.width * scale),
    height: Math.round(bitmap.height * scale),
  }
}

function toPixels(bitmap: ImageBitmap, width: number, height: number): PixelBuffer {
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, width, height)
  const { data } = context.getImageData(0, 0, width, height)
  return { data, width, height }
}

function toCanvas({ data, width, height }: PixelBuffer): OffscreenCanvas {
  const canvas = new OffscreenCanvas(width, height)
  canvas.getContext('2d')!.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
  return canvas
}

function startWorker() {
  const worker = new Worker(new URL('../../../packages/core/src/processing/worker.ts', import.meta.url), { type: 'module' })
  let nextId = 0
  const send = (request: Job) => new Promise<Exclude<WorkerResponse, { ready: true }>>((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (!('ready' in data)) {
        resolve(data)
      }
    }
    worker.onerror = event => reject(new Error(event.message))
    const copy = {
      ...request,
      id: nextId++,
      source: {
        ...request.source,
        data: request.source.data.slice(),
      },
    } as WorkerRequest
    worker.postMessage(copy, [copy.source.data.buffer as ArrayBuffer])
  })
  return {
    send,
    stop: () => worker.terminate(),
  }
}

async function runBenchmarks() {
  const file = photo
  if (!file) {
    say('Choose a photo first.')
    return
  }
  rows.length = 0
  resultsBody.replaceChildren()
  const runs = Number(runsInput.value)
  const sizes = sizesInput.value.split(',').map(size => size.trim() === 'full'
    ? 'full' as const
    : Number(size))

  let bitmap: ImageBitmap | undefined
  await measure({ size: 'file', operation: 'decode', where: 'main' }, 1, async () => {
    bitmap = await createImageBitmap(file)
  }, `${(file.size / 1e6).toFixed(1)} MB`)
  if (!bitmap) {
    say('The photo could not be decoded.')
    return
  }

  const worker = startWorker()
  for (const size of sizes) {
    const { width, height } = bitmapSize(bitmap, size)
    const label = `${(width * height / 1e6).toFixed(1)} MP`
    const fullRuns = size === 'full'
      ? 1
      : runs

    let source: PixelBuffer | undefined
    await measure({ size: label, operation: 'read pixels', where: 'main' }, 1, () => {
      source = toPixels(bitmap!, width, height)
    }, `${width}×${height}`)
    if (!source) {
      continue
    }
    const pixels = source
    const quad = readCorners(width, height)
    const output = estimateOutputSize(quad, { width, height }, {
      aspectRatio: readAspectRatio(),
    })

    await measure({ size: label, operation: 'threshold', where: 'main' }, fullRuns, () => {
      adaptiveThreshold(pixels)
    })
    let prepared: PreparedThreshold | undefined
    await measure({ size: label, operation: 'slider preparation', where: 'main' }, fullRuns, () => {
      prepared = prepareThreshold(pixels)
    })
    if (prepared) {
      const ready = prepared
      const sliderPositions = [0.2, 0.4, 0.6, 0.8, 1]
      let position = 0
      await measure({ size: label, operation: 'slider change', where: 'main' }, 5, () => {
        applyThreshold(ready, { sensitivity: sliderPositions[position++ % sliderPositions.length]! })
      })
      await measure({ size: label, operation: 'slider change, painted', where: 'main' }, 5, () => {
        toCanvas(applyThreshold(ready, { sensitivity: sliderPositions[position++ % sliderPositions.length]! }))
      })
    }
    await measure({ size: label, operation: 'threshold, strict black and white', where: 'main' }, fullRuns, () => {
      adaptiveThreshold(pixels, { softness: 0 })
    })
    await measure({ size: label, operation: 'warp', where: 'main' }, fullRuns, () => {
      warpPerspective(pixels, quad, output.width, output.height)
    }, `${output.width}×${output.height}`)

    await measure({ size: label, operation: 'threshold', where: 'worker' }, fullRuns, async () => {
      const response = await worker.send({ operation: 'threshold', source: pixels })
      if ('error' in response) {
        throw new Error(response.error)
      }
      return response.milliseconds
    })
    await measure({ size: label, operation: 'warp', where: 'worker' }, fullRuns, async () => {
      const response = await worker.send({
        operation: 'warp',
        source: pixels,
        quad,
        ...output,
      })
      if ('error' in response) {
        throw new Error(response.error)
      }
      return response.milliseconds
    })

    await measure({ size: label, operation: 'export PNG', where: 'main' }, 1, async () => {
      await toCanvas(pixels).convertToBlob({ type: 'image/png' })
    })
    await measure({ size: label, operation: 'export JPEG', where: 'main' }, 1, async () => {
      await toCanvas(pixels).convertToBlob({ type: 'image/jpeg', quality: 0.9 })
    })
  }
  worker.stop()
  bitmap.close()
  say('Done. Press Compare painting, and then Copy results.')
}

function show(caption: string, source: CanvasImageSource, width: number, height: number, maxHeight = 900) {
  const scale = Math.min(1, maxHeight / height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const context = canvas.getContext('2d')!
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  const figure = document.createElement('figure')
  const text = document.createElement('figcaption')
  text.textContent = caption
  figure.append(canvas, text)
  previews.append(figure)
}

/** Shows part of the image at its real size, because a reduced view makes text look worse than it is. */
function showDetail(caption: string, source: OffscreenCanvas) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.min(source.width, 900)
  canvas.height = Math.min(source.height, 400)
  canvas.getContext('2d')!.drawImage(source, (canvas.width - source.width) / 2, -Math.round(source.height * 0.3))
  const figure = document.createElement('figure')
  const text = document.createElement('figcaption')
  text.textContent = `${caption}, real size`
  figure.append(canvas, text)
  previews.append(figure)
}

async function showVisualResults() {
  const file = photo
  if (!file) {
    say('Choose a photo first.')
    return
  }
  previews.replaceChildren()
  say('Processing…', true)
  await nextFrame()

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmapSize(bitmap, 12)
  const source = toPixels(bitmap, width, height)
  bitmap.close()
  const quad = readCorners(width, height)
  const size = estimateOutputSize(quad, { width, height }, {
    aspectRatio: readAspectRatio(),
  })
  const warped = warpPerspective(source, quad, size.width, size.height)

  show(`Original ${width}×${height}`, toCanvas(source), width, height)
  show(`Warp ${size.width}×${size.height}, proportion 1:${(size.height / size.width).toFixed(2)}`, toCanvas(warped), size.width, size.height)
  const sensitivity = Number(sensitivityInput.value)
  showDetail('Warp', toCanvas(warped))
  for (const [name, softness] of [
    ['Soft threshold', 0.25],
    ['Strict black and white', 0],
  ] as const) {
    const result = toCanvas(adaptiveThreshold(warped, { sensitivity, softness }))
    show(name, result, size.width, size.height)
    showDetail(name, result)
  }
  say('Done.')
}

async function comparePainting() {
  const file = photo
  if (!file) {
    say('Choose a photo first.')
    return
  }
  previews.replaceChildren()
  say('Painting…', true)
  await nextFrame()

  const bitmap = await createImageBitmap(file)
  const height = 900
  const width = Math.round(bitmap.width * height / bitmap.height)

  const start = performance.now()
  show('Painting A: direct drawImage of the full image', bitmap, bitmap.width, bitmap.height, height)
  const direct = performance.now() - start
  record({
    size: `${(bitmap.width * bitmap.height / 1e6).toFixed(1)} MP`,
    operation: 'paint direct',
    where: 'main',
    milliseconds: direct,
    note: `to ${width}×${height}`,
  })

  const proxyStart = performance.now()
  const proxy = await createImageBitmap(bitmap, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' })
  const proxyTime = performance.now() - proxyStart
  record({
    size: `${(bitmap.width * bitmap.height / 1e6).toFixed(1)} MP`,
    operation: 'make proxy',
    where: 'main',
    milliseconds: proxyTime,
    note: `to ${width}×${height}`,
  })

  const proxyPaint = performance.now()
  show('Painting B: copy reduced beforehand', proxy, width, height, height)
  record({
    size: `${(width * height / 1e6).toFixed(1)} MP`,
    operation: 'paint proxy',
    where: 'main',
    milliseconds: performance.now() - proxyPaint,
    note: '',
  })
  bitmap.close()
  say('Done.')
}

const actions = [
  ...document.querySelectorAll<HTMLButtonElement>('.bench-actions button'),
]

/** Runs one task at a time, and reports its error instead of failing silently. */
function exclusive(task: () => Promise<void>) {
  return async () => {
    for (const button of actions) {
      button.disabled = true
    }
    try {
      await task()
    }
    catch (error) {
      say(String(error))
    }
    finally {
      for (const button of actions) {
        button.disabled = false
      }
    }
  }
}

element('run').addEventListener('click', exclusive(runBenchmarks))
element('visual').addEventListener('click', exclusive(showVisualResults))
element('painting').addEventListener('click', exclusive(comparePainting))
element('copy').addEventListener('click', () => {
  // The Clipboard API needs HTTPS, and a phone reaches this page through plain HTTP
  jsonOutput.select()
  const copied = document.execCommand('copy')
  say(copied
    ? `Copied ${rows.length} results.`
    : 'Could not copy. Select the text in the box by hand.')
})
