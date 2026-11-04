/// <reference path="./env.d.ts" />
import 'virtual:playground-stylesheet'
import './style.css'

interface Control {
  /** The first option is the initial value. */
  options: number[]
  unit?: string
}

const controls = {
  rotation: {
    options: [0, 90, 180, 270],
    unit: '°',
  },
} satisfies Record<string, Control>

const entries = Object.entries(controls)

export type PlaygroundOptions = Record<keyof typeof controls, number> & {
  src: string
  alt: string
}

export interface Playground {
  name: string
  /**
   * Mounts the component on the stage.
   *
   * @returns The function that applies changed options to the component.
   */
  mount: (stage: HTMLElement, options: PlaygroundOptions) => (options: PlaygroundOptions) => void
}

function renderControl(name: string, { options, unit = '' }: Control): string {
  return `
    <label class="field">
      <code>${name}</code>
      <select class="select" name="${name}">
        ${options.map(option => `<option value="${option}">${option}${unit}</option>`).join('')}
      </select>
    </label>
  `
}

/** Renders the page around the component, which is the same for every framework. */
export function createPlayground({ name, mount }: Playground): void {
  const isDist = import.meta.env.MODE === 'dist'
  const packagesOrigin = isDist
    ? 'the built packages, without hot reload'
    : 'the packages from source, with hot reload'
  const options = {
    src: '/samples/document.svg',
    alt: 'Sample document',
    ...Object.fromEntries(entries.map(([control, { options }]) => [control, options[0]])),
  } as PlaygroundOptions
  const app = document.querySelector('#app')!

  document.title = `PaperPic ${name} playground${isDist ? ' (dist)' : ''}`
  app.innerHTML = `
    <div class="layout">
      <header class="header">
        <h1 class="brand">
          <img class="logo" src="/logo-mark.svg" alt="" width="32" height="32">
          <span class="wordmark">Paper<span class="wordmark-accent">Pic</span></span>
          <span class="title">${name} playground</span>
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
          ${entries.map(([control, config]) => renderControl(control, config)).join('')}
        </aside>

        <main class="stage"></main>
      </div>
    </div>
  `

  const update = mount(app.querySelector<HTMLElement>('.stage')!, { ...options })

  app.querySelector('.panel')!.addEventListener('change', (event) => {
    const { name: control, value } = event.target as HTMLSelectElement
    options[control as keyof typeof controls] = Number(value)
    update({ ...options })
  })
}
