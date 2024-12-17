<template>
  <canvas :class="$style.canvas" ref="canvasRef" canvas-id="canvasId" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Watermark } from '@/utils/watermark'
import logo from '../assets/logo.svg'

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    const img = document.createElement('img')
    img.src = logo
    img.style.opacity = '0.1'
    img.onload = () => {
      new Watermark(canvas, {
        content: '水印',
        xGap: 100,
        yGap: 100,
        rotate: -45,
        color: 'rgba(0, 0, 0, 0.1)',
        font: '40px Arial',
      })
    }
  }
})
</script>

<style lang="scss" module>
.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>
