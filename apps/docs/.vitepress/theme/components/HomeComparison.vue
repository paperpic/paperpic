<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, shallowRef } from 'vue'

/** The texts of the comparison, from the frontmatter of each home page. */
interface Comparison {
  after: string
  afterAlt: string
  afterLabel: string
  before: string
  beforeAlt: string
  beforeLabel: string
  label: string
}

const { frontmatter } = useData()
const comparison = computed(() => frontmatter.value.comparison as Comparison | undefined)

/** How much of the width shows the photo, in percent. */
const position = shallowRef(50)

/** The widths of the smaller copies of each image, which sit next to it as `<name>-<width>.webp`. */
const widths = [640, 960, 1280]

/** The width of the images themselves. */
const fullWidth = 1600

/** The copies of an image for the browser to choose from, so a phone does not download the full width. */
function srcset(src: string) {
  return [
    ...widths.map(width => `${src.replace(/\.webp$/, `-${width}.webp`)} ${width}w`),
    `${src} ${fullWidth}w`,
  ].join(', ')
}

/** The width that the frame takes at each width of the window, following the padding of `.comparison` and its border. */
const sizes = '(min-width: 1280px) 1150px, (min-width: 960px) calc(100vw - 130px), (min-width: 640px) calc(100vw - 98px), calc(100vw - 50px)'
</script>

<template>
  <section v-if="comparison" class="comparison">
    <div class="frame" :style="{ '--position': `${position}%` }">
      <!-- The photo is the largest content of the home, so the browser fetches it before it lays the page out -->
      <img
        class="image"
        :src="comparison.before"
        :srcset="srcset(comparison.before)"
        :sizes="sizes"
        :alt="comparison.beforeAlt"
        width="1600"
        height="893"
        fetchpriority="high"
      >
      <img
        class="image after"
        :src="comparison.after"
        :srcset="srcset(comparison.after)"
        :sizes="sizes"
        :alt="comparison.afterAlt"
        width="1600"
        height="893"
      >
      <span class="badge badge-before" aria-hidden="true">{{ comparison.beforeLabel }}</span>
      <span class="badge badge-after" aria-hidden="true">{{ comparison.afterLabel }}</span>
      <span class="divider" aria-hidden="true" />
      <!-- A range input gives dragging, the keyboard and screen readers in one native control -->
      <input
        v-model.number="position"
        class="slider"
        type="range"
        min="0"
        max="100"
        step="1"
        :aria-label="comparison.label"
      >
    </div>
  </section>
</template>

<style scoped>
.comparison {
  padding: 0 24px 48px;
}

@media (width >= 640px) {
  .comparison {
    padding-inline: 48px;
  }
}

@media (width >= 960px) {
  .comparison {
    padding-inline: 64px;
  }
}

.frame {
  position: relative;
  max-width: 1152px;
  margin-inline: auto;
  overflow: hidden;
  aspect-ratio: 1600 / 893;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.after {
  clip-path: inset(0 0 0 var(--position));
}

.divider {
  position: absolute;
  inset-block: 0;
  inset-inline-start: var(--position);
  width: 3px;
  translate: -50%;
  background: #fff;
  box-shadow: 0 0 6px rgb(0 0 0 / 35%);
  pointer-events: none;
}

.divider::after {
  content: '';
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  width: 36px;
  height: 36px;
  translate: -50% -50%;
  border: 3px solid #fff;
  border-radius: 50%;
  background: rgb(0 0 0 / 35%);
  box-shadow: 0 0 6px rgb(0 0 0 / 35%);
}

.badge {
  position: absolute;
  inset-block-start: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgb(0 0 0 / 60%);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 500;
  pointer-events: none;
}

.badge-before {
  inset-inline-start: 12px;
}

.badge-after {
  inset-inline-end: 12px;
}

.slider {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  touch-action: pan-y;
}

.frame:has(.slider:focus-visible) {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
</style>
