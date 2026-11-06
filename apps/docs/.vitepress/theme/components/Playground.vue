<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'

const props = defineProps<{
  alt: string
  sampleLabel: string
  receiptLabel: string
  cutCornerLabel: string
  attachLabel: string
  aiNotice: string
  resultLabel: string
  downloadLabel: string
}>()

interface Result {
  url: string
  fileName: string
  summary: string
}

const samples = computed(() => [
  { src: '/samples/receipt.jpg', name: props.receiptLabel },
  { src: '/samples/receipt-cut-corner.jpg', name: props.cutCornerLabel },
])

const src = shallowRef<string | File>('/samples/receipt.jpg')

const alt = computed(() => src.value instanceof File
  ? src.value.name
  : props.alt)

function selectSample(event: Event) {
  src.value = (event.target as HTMLSelectElement).value
}

function attach(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    src.value = file
  }
}

const result = shallowRef<Result | null>(null)

function setResult(next: Result | null) {
  if (result.value) {
    URL.revokeObjectURL(result.value.url)
  }
  result.value = next
}

function showResult({ blob, width, height, type }: { blob: Blob, width: number, height: number, type: string }) {
  setResult({
    url: URL.createObjectURL(blob),
    fileName: `paperpic-result.${type.split('/')[1]}`,
    summary: `${width}×${height}, ${Math.round(blob.size / 1024)} KB, ${type}`,
  })
}

watch(src, () => setResult(null))
onBeforeUnmount(() => setResult(null))
</script>

<template>
  <main class="playground">
    <div class="panel">
      <div class="vp-doc">
        <slot />
      </div>

      <label class="field">
        {{ sampleLabel }}
        <select class="select" @change="selectSample">
          <option v-for="sample in samples" :key="sample.src" :value="sample.src">
            {{ sample.name }}
          </option>
        </select>
      </label>

      <label class="field">
        {{ attachLabel }}
        <input class="file" type="file" accept="image/*" @change="attach">
      </label>

      <p class="notice">
        {{ aiNotice }}
      </p>

      <p class="result" role="status">
        <template v-if="result">
          {{ resultLabel }}: {{ result.summary }}.
          <a class="download" :href="result.url" :download="result.fileName">{{ downloadLabel }}</a>
        </template>
      </p>
    </div>

    <div class="stage">
      <PaperPic :src :alt @apply="showResult" />
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
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: center;
  justify-content: space-between;
  margin-block-start: 1.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.select {
  /* VitePress's reset removes the native arrow */
  appearance: auto;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.file {
  max-width: 100%;
  font-size: 0.75rem;
}

.notice {
  margin-block-start: 1.5rem;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.result {
  margin-block-start: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.download {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.stage {
  height: calc(100dvh - var(--vp-layout-top-height, 0px) - var(--vp-nav-height));
  padding: 1rem;
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

  .stage {
    height: 75dvh;
  }
}
</style>
