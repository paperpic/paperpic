<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'

defineProps<{
  rotationLabel: string
  alt: string
}>()

const rotations = [0, 90, 180, 270]
const rotation = shallowRef(0)
</script>

<template>
  <main class="playground">
    <div class="panel">
      <div class="vp-doc">
        <slot />
      </div>

      <label class="field">
        {{ rotationLabel }}
        <select v-model.number="rotation" class="select">
          <option v-for="degrees in rotations" :key="degrees" :value="degrees">
            {{ degrees }}°
          </option>
        </select>
      </label>
    </div>

    <div class="stage">
      <PaperPic src="/samples/document.svg" :alt :rotation />
    </div>
  </main>
</template>

<style scoped>
.playground {
  display: grid;
  grid-template-columns: 20rem minmax(0, 1fr);
  min-height: calc(100dvh - var(--vp-layout-top-height, 0px) - var(--vp-nav-height));
}

.panel {
  padding: 1.5rem;
  border-inline-end: 1px solid var(--vp-c-divider);
}

.field {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  margin-block-start: 1.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.select {
  /* VitePress's reset removes the native arrow */
  appearance: auto;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.stage {
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background-color: var(--vp-c-bg-soft);
  background-image: radial-gradient(var(--vp-c-border) 1px, transparent 1px);
  background-size: 16px 16px;
}

@media (width < 768px) {
  .playground {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
  }

  .panel {
    border-inline-end: 0;
    border-block-end: 1px solid var(--vp-c-divider);
  }
}
</style>
