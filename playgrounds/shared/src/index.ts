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

export type ControlValues = Record<keyof typeof controls, number>

export const initialValues = Object.fromEntries(
  entries.map(([name, control]) => [name, control.options[0]]),
) as ControlValues

export interface PlaygroundOptions {
  title: string
  panelTitle: string
  onChange: (values: ControlValues) => void
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

/**
 * Renders the page around the component, which is the same for every framework.
 *
 * @returns The element where the playground mounts its component.
 */
export function createPlayground({ title, panelTitle, onChange }: PlaygroundOptions): HTMLElement {
  const packagesOrigin = import.meta.env.MODE === 'dist'
    ? 'the built packages, without hot reload'
    : 'the packages from source, with hot reload'
  const values = { ...initialValues }
  const app = document.querySelector('#app')!

  app.innerHTML = `
    <div class="layout">
      <header class="header">
        <h1 class="brand">
          <img class="logo" src="/logo-mark.svg" alt="" width="32" height="32">
          <span class="wordmark">Paper<span class="wordmark-accent">Pic</span></span>
          <span class="title">${title}</span>
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
          <h2 id="panel-heading" class="panel-heading">${panelTitle}</h2>
          ${entries.map(([name, control]) => renderControl(name, control)).join('')}
        </aside>

        <main class="stage"></main>
      </div>
    </div>
  `

  app.querySelector('.panel')!.addEventListener('change', (event) => {
    const { name, value } = event.target as HTMLSelectElement
    values[name as keyof ControlValues] = Number(value)
    onChange({ ...values })
  })

  return app.querySelector<HTMLElement>('.stage')!
}
