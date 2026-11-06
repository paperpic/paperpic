/// <reference path="./env.d.ts" />
import 'virtual:playground-stylesheet'
import './style.css'

const samples = [
  { src: '/samples/receipt.jpg', name: 'Receipt', alt: 'Sample receipt' },
  { src: '/samples/receipt-cut-corner.jpg', name: 'Receipt with a cut-off corner', alt: 'Sample receipt with one corner outside the photo' },
]

export interface PlaygroundOptions {
  src: string | File
  alt: string
  editable: boolean
  wheelZoom: boolean
}

export interface Playground {
  name: string
  /**
   * Mounts the component on the stage, and calls `onApply` with the result when the user applies the changes.
   *
   * @returns The function that applies changed options to the component.
   */
  mount: (stage: HTMLElement, options: PlaygroundOptions, onApply: (result: AppliedImage) => void) => (options: PlaygroundOptions) => void
}

/** What the component delivers when the user applies the changes. */
export interface AppliedImage {
  blob: Blob
  width: number
  height: number
  type: string
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
  }
  const app = document.querySelector('#app')!

  document.title = `PaperPic ${name} playground${isDist ? ' (dist)' : ''}`
  app.innerHTML = `
    <div class="layout">
      <header class="header">
        <h1 class="brand">
          <img class="logo" src="/logo-mark.svg" alt="" width="32" height="32">
          <span class="wordmark">Paper<span class="wordmark-accent">Pic</span></span>
          <span class="title"></span>
        </h1>
        <nav class="links" aria-label="Project links">
          <a class="link" href="https://paperpic.dev">Docs</a>
          <a class="link" href="https://github.com/paperpic/paperpic">GitHub</a>
        </nav>
      </header>

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
          <label class="field">
            Attach an image
            <input class="file" name="attach" type="file" accept="image/*">
          </label>
          <label class="field">
            <code>editable</code>
            <input name="editable" type="checkbox" checked>
          </label>
          <label class="field">
            <code>wheelZoom</code>
            <input name="wheelZoom" type="checkbox" checked>
          </label>
          <p class="hint">The sample images are AI-generated. They show no real purchase.</p>
          <p class="hint result" role="status"></p>
        </aside>

        <main class="stage"></main>
      </div>
    </div>
  `

  app.querySelector('.title')!.textContent = `${name} playground`

  const result = app.querySelector<HTMLElement>('.result')!
  let resultUrl: string | undefined

  const showResult = ({ blob, width, height, type }: AppliedImage) => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl)
    }
    resultUrl = URL.createObjectURL(blob)
    result.textContent = `Applied: ${width}×${height}, ${Math.round(blob.size / 1024)} KB, ${type}. `
    const link = document.createElement('a')
    link.className = 'link'
    link.href = resultUrl
    link.download = `paperpic-result.${type.split('/')[1]}`
    link.textContent = 'Download'
    result.append(link)
  }

  const update = mount(app.querySelector<HTMLElement>('.stage')!, { ...options }, showResult)

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
    else if (input.name === 'wheelZoom') {
      options.wheelZoom = input.checked
    }
    update({ ...options })
  })
}
