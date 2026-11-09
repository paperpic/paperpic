/// <reference path="./env.d.ts" />
import { renderHeader } from './page'
import 'virtual:playground-stylesheet'

const samples = [
  { src: '/samples/receipt.jpg', name: 'Receipt', alt: 'Sample receipt' },
  { src: '/samples/receipt-cut-corner.jpg', name: 'Receipt with a cut-off corner', alt: 'Sample receipt with one corner outside the photo' },
]

export interface PlaygroundOptions {
  alt: string
  aspectRatio?: number
  download: boolean
  editable: boolean
  softness?: number
  src: string | File
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

/** Renders the page around the component, which is the same for every framework. */
export function createPlayground({ name, mount }: Playground): void {
  const isDist = import.meta.env.MODE === 'dist'
  const packagesOrigin = isDist
    ? 'the built packages, without hot reload'
    : 'the packages from source, with hot reload'
  const options: PlaygroundOptions = {
    src: samples[0]!.src,
    alt: samples[0]!.alt,
    editable: true,
    wheelZoom: true,
    download: true,
  }
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
          <h2 id="panel-heading" class="panel-heading">Options</h2>
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
          <label class="field">
            <code>editable</code>
            <input name="editable" type="checkbox" checked>
          </label>
          <label class="field">
            <code>wheelZoom</code>
            <input name="wheelZoom" type="checkbox" checked>
          </label>
          <label class="field">
            <code>download</code>
            <input name="download" type="checkbox" checked>
          </label>
          <label class="field">
            <code>aspectRatio</code>
            <input class="number" name="aspectRatio" type="number" min="0" step="any">
          </label>
          <label class="field">
            <code>softness</code>
            <input class="number" name="softness" type="number" min="0" max="1" step="0.05">
          </label>
          <p class="hint">The sample images are AI-generated. They show no real purchase.</p>
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

  app.querySelector('.panel')!.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement
    if (input.name === 'sample') {
      options.src = input.value
      options.alt = samples.find(({ src }) => src === input.value)!.alt
    }
    else if (input.name === 'attach' && input.files?.[0]) {
      options.src = input.files[0]
      options.alt = input.files[0].name
    }
    else if (input.name === 'editable') {
      options.editable = input.checked
    }
    else if (input.name === 'download') {
      options.download = input.checked
    }
    else if (input.name === 'wheelZoom') {
      options.wheelZoom = input.checked
    }
    else if (input.name === 'softness') {
      options.softness = Number.isNaN(input.valueAsNumber)
        ? undefined
        : input.valueAsNumber
    }
    else if (input.name === 'aspectRatio') {
      options.aspectRatio = input.valueAsNumber > 0
        ? input.valueAsNumber
        : undefined
    }
    update({ ...options })
  })
}
