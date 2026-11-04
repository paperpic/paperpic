<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { ref } from 'vue'

const rotation = ref(0)
</script>

<template>
  <p>
    <label>
      Rotation
      <select v-model.number="rotation">
        <option v-for="degrees in [0, 90, 180, 270]" :key="degrees" :value="degrees">
          {{ degrees }}°
        </option>
      </select>
    </label>
  </p>

  <PaperPic src="/samples/document.svg" alt="Sample document" :rotation />
</template>
