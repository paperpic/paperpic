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
  <div class="playground">
    <div class="toolbar">
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
  </div>
</template>

<style scoped>
.playground {
  overflow: hidden;
  margin-block-start: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.toolbar {
  padding: 0.75rem 1rem;
  border-block-end: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.field {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
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
  background-image: radial-gradient(var(--vp-c-divider) 1px, transparent 1px);
  background-size: 16px 16px;
}
</style>
