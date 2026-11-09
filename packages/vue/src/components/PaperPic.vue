<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/core'
import type { PaperPicProps } from '../types'
import { PaperPic } from '@paperpic/core'
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

const props = withDefaults(defineProps<PaperPicProps>(), {
  editable: true,
  toolbar: true,
  wheelZoom: true,
})

const emit = defineEmits<{
  apply: [payload: PaperPicEvents['apply']]
  change: [payload: PaperPicEvents['change']]
  error: [payload: PaperPicEvents['error']]
  load: [payload: PaperPicEvents['load']]
}>()

const host = useTemplateRef<HTMLElement>('host')

/** The viewer, for a custom interface. It is `null` until the component mounts. */
const instance = shallowRef<PaperPic | null>(null)

onMounted(() => {
  const pic = new PaperPic(host.value!, { ...props })
  pic.on('apply', payload => emit('apply', payload))
  pic.on('change', payload => emit('change', payload))
  pic.on('error', payload => emit('error', payload))
  pic.on('load', payload => emit('load', payload))
  instance.value = pic
})

watch(() => ({ ...props }), options => instance.value?.setOptions(options))

onBeforeUnmount(() => {
  instance.value?.destroy()
  instance.value = null
})

defineExpose({ instance })
</script>

<template>
  <div ref="host" class="paperpic-host" />
</template>
