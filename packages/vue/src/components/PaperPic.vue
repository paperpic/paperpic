<script setup lang="ts">
import type { PaperPicProps } from '../types'
import { normalizeRotation } from '@paperpic/core'
import { computed } from 'vue'

const props = withDefaults(defineProps<PaperPicProps>(), {
  alt: '',
  rotation: 0,
})

const transform = computed(() => `rotate(${normalizeRotation(props.rotation)}deg)`)
</script>

<template>
  <div class="paperpic">
    <img :src :alt :style="{ transform }">
  </div>
</template>

<style>
@layer paperpic {
  .paperpic {
    display: inline-block;
    overflow: hidden;
  }

  .paperpic img {
    display: block;
    max-width: 100%;
    transition: transform var(--paperpic-transition-duration, 0.2s) ease;
  }
}
</style>
