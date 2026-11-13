/// <reference path="./env.d.ts" />
import { renderHeader } from './page'
import 'virtual:playground-stylesheet'

const samples = [
  { src: '/samples/receipt.jpg', name: 'Receipt', alt: 'Sample receipt' },
  { src: '/samples/receipt-cut-corner.jpg', name: 'Receipt with a cut-off corner', alt: 'Sample receipt with one corner outside the photo' },
]

/** The tools of the edit bar, in its order. The playground does not depend on the core, so it lists them itself. */
const tools = [
  'crop',
  'perspective',
  'rotate',
  'flip',
  'adjust',
  'threshold',
] as const

type PlaygroundTool = typeof tools[number]

/** Common document proportions, as width divided by height. */
const aspectRatios = [
  { name: 'A4', value: 210 / 297 },
  { name: 'US Letter', value: 8.5 / 11 },
  { name: 'ID card', value: 85.6 / 53.98 },
]

const formats = ['image/jpeg', 'image/png', 'image/webp']

/** The switches of the Viewer group, which are on by default. */
const switches = [
  'editable',
  'wheelZoom',
  'download',
  'toolbar',
] as const

export interface PlaygroundOptions {
  alt: string
  aspectRatio?: number
  download: boolean
  editable: boolean
  filename?: string
  maxOutputSize?: number
  output?: { quality?: number, type?: string }
  softness?: number
  src: string | File
  toolbar: boolean
  tools: PlaygroundTool[]
  wheelZoom: boolean
}

export interface Playground {
  /**
   * Mounts the component on the stage, and passes its `change` and `apply` events on.
   *
   * @returns The function that applies changed options to the component.
   */
  mount: (stage: HTMLElement, options: PlaygroundOptions, listeners: PlaygroundListeners) => (options: PlaygroundOptions) => void
  name: string
}

/** The events of the component that the page shows. */
export interface PlaygroundListeners {
  onApply: (result: AppliedImage) => void
  onChange: (state: { busy: boolean }) => void
}

/** What the component delivers when the user applies the changes. */
export interface AppliedImage {
  blob: Blob
  height: number
  type: string
  width: number
}

/**
 * The options the page starts with. It lists every option, the unset ones as `undefined`, because `setOptions()`
 * keeps the value of an option it does not receive, and Reset must clear them.
 */
function defaultOptions(): PlaygroundOptions {
  return {
    src: samples[0]!.src,
    alt: samples[0]!.alt,
    editable: true,
    wheelZoom: true,
    download: true,
    toolbar: true,
    tools: [...tools],
    aspectRatio: undefined,
    softness: undefined,
    output: undefined,
    maxOutputSize: undefined,
    filename: undefined,
  }
}

/** A slider with its value next to it. */
function renderRange(name: string, { min, max, step, value }: { max: number, min: number, step: number, value: number }): string {
  return `
    <span class="range">
      <input name="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
      <output class="range-value" name="${name}Value">${value}</output>
    </span>
  `
}

/** Renders the page around the component, which is the same for every framework. */
export function createPlayground({ name, mount }: Playground): void {
  const isDist = import.meta.env.MODE === 'dist'
  const packagesOrigin = isDist
    ? 'the built packages, without hot reload'
    : 'the packages from source, with hot reload'
  let options = defaultOptions()
  const app = document.querySelector('#app')!

  document.title = `PaperPic ${name} playground${isDist ? ' (dist)' : ''}`
  app.innerHTML = `
    <div class="layout">
      <p class="notice">
        <strong>Development only.</strong>
        Runs ${packagesOrigin}. It is not published or deployed.
        The public demo is at <a class="notice-link" href="https://paperpic.dev/playground">paperpic.dev/playground</a>.
      </p>

      <div class="workspace">
        <aside class="panel" aria-labelledby="panel-heading">
          <form class="options">
            <div class="panel-header">
              <h2 id="panel-heading" class="panel-heading">Options</h2>
              <button class="button button-small" type="reset">Reset</button>
            </div>

            <fieldset class="group">
              <legend class="group-heading">Image</legend>
              <label class="field">
                <code>src</code>
                <select class="select" name="sample">
                  ${samples.map(({ src, name }) => `<option value="${src}">${name}</option>`).join('')}
                </select>
              </label>
              <div class="attach">
                <label class="button">
                  Attach an image
                  <input class="file" name="attach" type="file" accept="image/*">
                </label>
                <label class="button button-photo">
                  Take a photo
                  <input class="file" name="attach" type="file" accept="image/*" capture="environment">
                </label>
              </div>
              <p class="hint">The sample images are AI-generated. They show no real purchase.</p>
            </fieldset>

            <fieldset class="group">
              <legend class="group-heading">Viewer</legend>
              ${switches.map(option => `
                <label class="field">
                  <code>${option}</code>
                  <input name="${option}" type="checkbox" checked>
                </label>
              `).join('')}
            </fieldset>

            <fieldset class="group">
              <legend class="group-heading"><code>tools</code></legend>
              <div class="chips">
                ${tools.map(tool => `
                  <label class="chip">
                    <input name="tools" type="checkbox" value="${tool}" checked>
                    ${tool}
                  </label>
                `).join('')}
              </div>
            </fieldset>

            <fieldset class="group">
              <legend class="group-heading">Editing</legend>
              <label class="field">
                <code>aspectRatio</code>
                <select class="select" name="aspectRatioPreset">
                  <option value="">Estimated</option>
                  ${aspectRatios.map(({ name, value }) => `<option value="${value}">${name}</option>`).join('')}
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label class="field field-nested">
                Width ÷ height
                <input class="number" name="aspectRatio" type="number" min="0" step="any" placeholder="Estimated">
              </label>
              <label class="field">
                <code>softness</code>
                ${renderRange('softness', {
                  min: 0,
                  max: 1,
                  step: 0.05,
                  value: 0.25,
                })}
              </label>
            </fieldset>

            <fieldset class="group">
              <legend class="group-heading">Output</legend>
              <label class="field">
                <code>output.type</code>
                <select class="select" name="outputType">
                  <option value="">Source</option>
                  ${formats.map(type => `<option value="${type}">${type.split('/')[1]}</option>`).join('')}
                </select>
              </label>
              <label class="field">
                <code>output.quality</code>
                ${renderRange('outputQuality', {
                  min: 0.05,
                  max: 1,
                  step: 0.05,
                  value: 0.92,
                })}
              </label>
              <label class="field">
                <code>maxOutputSize</code>
                <input class="number" name="maxOutputSize" type="number" min="1" step="1" placeholder="Full">
              </label>
              <label class="field">
                <code>filename</code>
                <input class="text" name="filename" type="text" placeholder="Source">
              </label>
            </fieldset>
          </form>
          <p class="hint result" role="status"></p>
        </aside>

        <main class="stage"></main>
      </div>
    </div>
  `

  app.querySelector('.layout')!.prepend(renderHeader(`${name} playground`))

  const result = app.querySelector<HTMLElement>('.result')!
  let resultUrl: string | undefined

  let applyStart: number | undefined

  const onChange = ({ busy }: { busy: boolean }) => {
    if (busy && applyStart === undefined) {
      applyStart = performance.now()
    }
  }

  const showResult = ({ blob, width, height, type }: AppliedImage) => {
    const seconds = applyStart === undefined
      ? ''
      : ` in ${((performance.now() - applyStart) / 1000).toFixed(2)} s`
    applyStart = undefined
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl)
    }
    resultUrl = URL.createObjectURL(blob)
    result.textContent = `Applied${seconds}: ${width}×${height}, ${Math.round(blob.size / 1024)} KB, ${type}. `
    const link = document.createElement('a')
    link.className = 'link'
    link.href = resultUrl
    link.download = `paperpic-result.${type.split('/')[1]}`
    link.textContent = 'Download'
    result.append(link)
  }

  const update = mount(app.querySelector<HTMLElement>('.stage')!, { ...options }, { onChange, onApply: showResult })

  const form = app.querySelector<HTMLFormElement>('.options')!
  const input = (name: string) => form.elements.namedItem(name) as HTMLInputElement
  const select = (name: string) => form.elements.namedItem(name) as HTMLSelectElement
  const output = (name: string) => form.elements.namedItem(name) as HTMLOutputElement

  // PNG has no quality. The source format may have one, so the slider stays on for it
  const syncQuality = () => {
    input('outputQuality').disabled = select('outputType').value === 'image/png'
  }

  const readOption = (target: HTMLInputElement) => {
    switch (target.name) {
      case 'sample':
        options.src = target.value
        options.alt = samples.find(({ src }) => src === target.value)!.alt
        break
      case 'attach':
        if (target.files?.[0]) {
          options.src = target.files[0]
          options.alt = target.files[0].name
        }
        break
      case 'editable':
      case 'download':
      case 'wheelZoom':
      case 'toolbar':
        options[target.name] = target.checked
        break
      case 'tools':
        options.tools = tools.filter(tool => form.querySelector<HTMLInputElement>(`[name="tools"][value="${tool}"]`)!.checked)
        break
      case 'aspectRatioPreset':
        if (target.value === 'custom') {
          input('aspectRatio').focus()
          break
        }
        options.aspectRatio = target.value === ''
          ? undefined
          : Number(target.value)
        input('aspectRatio').value = options.aspectRatio === undefined
          ? ''
          : String(Number(options.aspectRatio.toFixed(4)))
        break
      case 'aspectRatio': {
        const value = target.valueAsNumber > 0
          ? target.valueAsNumber
          : undefined
        options.aspectRatio = value
        const preset = aspectRatios.find(ratio => value !== undefined && Math.abs(ratio.value - value) < 1e-4)
        select('aspectRatioPreset').value = value === undefined
          ? ''
          : preset?.value.toString() ?? 'custom'
        break
      }
      case 'softness':
        options.softness = target.valueAsNumber
        break
      case 'outputType':
      case 'outputQuality':
        options.output = {
          type: select('outputType').value || undefined,
          quality: input('outputQuality').valueAsNumber,
        }
        syncQuality()
        break
      case 'maxOutputSize':
        options.maxOutputSize = target.valueAsNumber > 0
          ? target.valueAsNumber
          : undefined
        break
      case 'filename':
        options.filename = target.value.trim() || undefined
        break
    }
  }

  form.addEventListener('change', (event) => {
    readOption(event.target as HTMLInputElement)
    update({ ...options })
  })

  // A slider shows its value while it moves, and changes the option when it stops
  form.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement
    if (target.type === 'range') {
      output(`${target.name}Value`).value = target.value
    }
  })

  form.addEventListener('reset', () => {
    // The form resets its fields after this event, so the page reads them on the next task
    setTimeout(() => {
      for (const name of ['softness', 'outputQuality']) {
        output(`${name}Value`).value = input(name).value
      }
      syncQuality()
      options = defaultOptions()
      update({ ...options })
    })
  })
}
