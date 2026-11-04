<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'

defineProps<{
  rotation: number
}>()
</script>

<template>
  <PaperPic src="/samples/document.svg" alt="Sample document" :rotation />
</template>
