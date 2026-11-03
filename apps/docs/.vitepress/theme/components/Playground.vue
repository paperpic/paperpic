<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { ref } from 'vue'

defineProps<{
  rotationLabel: string
  alt: string
}>()

const rotation = ref(0)
</script>

<template>
  <p>
    <label>
      {{ rotationLabel }}
      <select v-model.number="rotation">
        <option v-for="degrees in [0, 90, 180, 270]" :key="degrees" :value="degrees">
          {{ degrees }}°
        </option>
      </select>
    </label>
  </p>

  <PaperPic src="/samples/document.svg" :alt :rotation />
</template>

<style scoped>
select {
  margin-inline-start: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}
</style>
