<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { PAPERPIC_LABELS } from './paperpic-labels'

/**
 * A live PaperPic inside a page. Its attributes go to the component, such as
 * `<Demo src="/samples/receipt.jpg" alt="A receipt" :editable="false" />`.
 */
defineOptions({ inheritAttrs: false })

// The component, its styles and its worker load only when a demo comes near the screen
const PaperPic = defineAsyncComponent(() => import('@paperpic/vue').then(module => module.PaperPic))

const { localeIndex } = useData()
const labels = computed(() => PAPERPIC_LABELS[localeIndex.value])

const frame = useTemplateRef('frame')
const visible = shallowRef(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      visible.value = true
      observer?.disconnect()
    }
  }, { rootMargin: '200px' })
  observer.observe(frame.value!)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="frame" class="demo">
    <PaperPic v-if="visible" v-bind="$attrs" :labels />
  </div>
</template>

<style scoped>
.demo {
  height: min(28rem, 70dvh);
  margin-block: 1rem;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  background-image: radial-gradient(var(--vp-c-border) 1px, transparent 1px);
  background-size: 16px 16px;
}
</style>
