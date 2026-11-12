<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useData } from 'vitepress'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { PAPERPIC_LABELS } from './paperpic-labels'

const props = defineProps<{
  aiNotice: string
  alt: string
  attachLabel: string
  cutCornerLabel: string
  downloadLabel: string
  estimatedLabel: string
  letterLabel: string
  optionsLabel: string
  photoLabel: string
  receiptLabel: string
  resultLabel: string
  sampleLabel: string
}>()

// The options start at the defaults of the component
const editable = shallowRef(true)
const download = shallowRef(false)
const softness = shallowRef(0.25)
// The slider shows its value while it moves, and changes the option when it stops
const softnessPreview = shallowRef(softness.value)

/** Common document proportions, as width divided by height. An empty value lets straightening estimate them. */
const aspectRatios = computed(() => [
  { name: props.estimatedLabel, value: '' },
  {
    name: 'A4',
    value: String(210 / 297),
  },
  {
    name: props.letterLabel,
    value: String(8.5 / 11),
  },
])
const aspectRatio = shallowRef('')
const aspectRatioValue = computed(() => aspectRatio.value === ''
  ? undefined
  : Number(aspectRatio.value))

interface Result {
  fileName: string
  summary: string
  url: string
}

const { lang, localeIndex } = useData()
const labels = computed(() => PAPERPIC_LABELS[localeIndex.value])

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

let applyStart: number | undefined

function onChange({ busy }: { busy: boolean }) {
  if (busy && applyStart === undefined) {
    applyStart = performance.now()
  }
}

function showResult({ blob, width, height, type }: { blob: Blob, height: number, type: string, width: number }) {
  const seconds = applyStart === undefined
    ? ''
    : `${new Intl.NumberFormat(lang.value, { style: 'unit', unit: 'second', maximumFractionDigits: 1 }).format((performance.now() - applyStart) / 1000)}, `
  applyStart = undefined
  setResult({
    url: URL.createObjectURL(blob),
    fileName: `paperpic-result.${type.split('/')[1]}`,
    summary: `${seconds}${width}×${height}, ${Math.round(blob.size / 1024)} KB, ${type}`,
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

      <div class="attach">
        <label class="button">
          {{ attachLabel }}
          <input class="file" type="file" accept="image/*" @change="attach">
        </label>
        <label class="button button-photo">
          {{ photoLabel }}
          <input class="file" type="file" accept="image/*" capture="environment" @change="attach">
        </label>
      </div>

      <p class="notice">
        {{ aiNotice }}
      </p>

      <fieldset class="options">
        <legend class="options-heading">
          {{ optionsLabel }}
        </legend>
        <label class="field">
          <code>editable</code>
          <input v-model="editable" class="checkbox" type="checkbox">
        </label>
        <label class="field">
          <code>download</code>
          <input v-model="download" class="checkbox" type="checkbox">
        </label>
        <label class="field">
          <code>aspectRatio</code>
          <select v-model="aspectRatio" class="select">
            <option v-for="ratio in aspectRatios" :key="ratio.value" :value="ratio.value">
              {{ ratio.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <code>softness</code>
          <span class="range">
            <input v-model.lazy.number="softness" type="range" min="0" max="1" step="0.05" @input="softnessPreview = ($event.target as HTMLInputElement).valueAsNumber">
            <output class="range-value">{{ softnessPreview.toFixed(2) }}</output>
          </span>
        </label>
      </fieldset>

      <p class="result" role="status">
        <template v-if="result">
          {{ resultLabel }}: {{ result.summary }}.
          <a class="download" :href="result.url" :download="result.fileName">{{ downloadLabel }}</a>
        </template>
      </p>
    </div>

    <div class="stage">
      <PaperPic
        :src :alt :labels :editable :download :softness
        :aspect-ratio="aspectRatioValue"
        @change="onChange" @apply="showResult"
      />
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

.attach {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block-start: 1.5rem;
}

/* A label styled as a button, because the native file input looks different in each browser and language */
.button {
  position: relative;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.button:has(:focus-visible) {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

/* A camera only helps where the browser can open one, which is on phones and tablets */
.button-photo {
  display: none;
}

@media (pointer: coarse) {
  .button-photo {
    display: block;
  }
}

.file {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
  white-space: nowrap;
}

.notice {
  margin-block-start: 1.5rem;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.options {
  margin: 1.5rem 0 0;
  padding: 1rem 0 0;
  border: 0;
  border-block-start: 1px solid var(--vp-c-divider);
}

/* Floating takes the legend out of the border of the fieldset, so it sits inside it like any heading */
.options-heading {
  float: inline-start;
  width: 100%;
  margin-block-end: 0.5rem;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 600;
}

.options .field {
  clear: both;
  flex-wrap: nowrap;
  margin-block-start: 0.5rem;
}

.options code {
  font-size: 0.8125rem;
}

.checkbox,
.range input {
  accent-color: var(--vp-c-brand-1);
}

.range {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.range input {
  width: 7rem;
}

.range-value {
  min-width: 2.25rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: end;
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
