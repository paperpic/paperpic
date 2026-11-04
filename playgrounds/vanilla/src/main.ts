import { normalizeRotation } from '@paperpic/core'
import './style.css'

const packagesOrigin = import.meta.env.MODE === 'dist'
  ? 'the built package, without hot reload'
  : 'the package from source, with hot reload'

const app = document.querySelector('#app')!

app.innerHTML = `
  <div class="layout">
    <header class="header">
      <h1 class="brand">
        <img class="logo" src="/logo-mark.svg" alt="" width="32" height="32">
        <span class="wordmark">Paper<span class="wordmark-accent">Pic</span></span>
        <span class="title">Vanilla playground</span>
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
      <aside class="panel" aria-labelledby="options-heading">
        <h2 id="options-heading" class="panel-heading">Options</h2>
        <label class="field">
          <code>rotation</code>
          <select id="rotation" class="select">
            <option value="0">0°</option>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
        </label>
      </aside>

      <main class="stage">
        <img id="preview" class="preview" src="/samples/document.svg" alt="Sample document">
      </main>
    </div>
  </div>
`

const rotation = app.querySelector<HTMLSelectElement>('#rotation')!
const preview = app.querySelector<HTMLImageElement>('#preview')!

rotation.addEventListener('change', () => {
  preview.style.transform = `rotate(${normalizeRotation(Number(rotation.value))}deg)`
})
