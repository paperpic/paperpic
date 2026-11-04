<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'

const rotations = [0, 90, 180, 270]
const rotation = shallowRef(0)
</script>

<template>
  <div class="layout">
    <header class="header">
      <h1 class="brand">
        <img class="logo" src="/logo-mark.svg" alt="" width="32" height="32">
        <span class="wordmark">Paper<span class="wordmark-accent">Pic</span></span>
        <span class="title">Vue playground</span>
      </h1>
      <nav class="links" aria-label="Project links">
        <a class="link" href="https://paperpic.dev">Docs</a>
        <a class="link" href="https://github.com/paperpic/paperpic">GitHub</a>
      </nav>
    </header>

    <p class="notice">
      <strong>Development only.</strong>
      Runs the packages from source with hot reload. It is not published or deployed.
      The public demo is at <a class="notice-link" href="https://paperpic.dev/playground">paperpic.dev/playground</a>.
    </p>

    <div class="workspace">
      <aside class="panel" aria-labelledby="props-heading">
        <h2 id="props-heading" class="panel-heading">
          Props
        </h2>
        <label class="field">
          <code>rotation</code>
          <select v-model.number="rotation" class="select">
            <option v-for="degrees in rotations" :key="degrees" :value="degrees">
              {{ degrees }}°
            </option>
          </select>
        </label>
      </aside>

      <main class="stage">
        <PaperPic src="/samples/document.svg" alt="Sample document" :rotation />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-block-end: 1px solid var(--color-border);
  background: var(--color-surface);
}

.brand {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5rem;
  align-items: center;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.wordmark-accent {
  background: linear-gradient(90deg, var(--color-accent-start), var(--color-accent-end));
  background-clip: text;
  color: transparent;
}

.title {
  margin-inline-start: 0.25rem;
  padding-inline-start: 0.75rem;
  border-inline-start: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 1rem;
  font-weight: 400;
}

.links {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.link {
  color: var(--color-link);
}

.notice {
  margin: 0;
  padding: 0.5rem 1rem;
  background: var(--color-notice-bg);
  color: var(--color-notice-text);
  font-size: 0.875rem;
}

.notice-link {
  color: inherit;
}

.workspace {
  display: grid;
  flex: 1;
  grid-template-columns: 16rem minmax(0, 1fr);
}

.panel {
  padding: 1rem;
  border-inline-end: 1px solid var(--color-border);
  background: var(--color-surface);
}

.panel-heading {
  margin: 0 0 0.75rem;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.field {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font: inherit;
}

.stage {
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background-image: radial-gradient(var(--color-dot) 1px, transparent 1px);
  background-size: 16px 16px;
}

@media (width < 640px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
  }

  .panel {
    border-inline-end: 0;
    border-block-end: 1px solid var(--color-border);
  }
}
</style>
