<template>
    <p>Velocity X: {{ ship.velocity.x!.toFixed(2) }}</p>
    <p>Velocity Y: {{ ship.velocity.y!.toFixed(2) }}</p>
    <p>Accleration X: {{ ship.acceleration.x!.toFixed(2) }} Accleration Y: {{ ship.acceleration.y?.toFixed(2) }}</p>
    <p>Angle: {{ (ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>

    <!-- <div>{{ keysPressed }}</div> -->
    <p>Position: {{ ship.position.x!.toFixed(2) }}, {{ ship.position.y!.toFixed(2) }}</p>
    <div class="canvas-container">
      <CanvasWithControls :ship="ship"  :other-objects="[otherObject]" :background="true"></CanvasWithControls>
      <CanvasWithControls :ship="ship" :other-objects="[otherObject]" :background="false" :canvas-size="{ x: 250, y: 250 }"></CanvasWithControls>

      <!-- <div class="canvas-controls">
    <MagnificationControls @input="handleMagnificationChange"></MagnificationControls>
    <Canvas :ship="ship" :magnification="magnification" :background="true"></Canvas>
  </div>
  <div class="canvas-controls">
    <MagnificationControls @input="handleMagnificationChange"></MagnificationControls>
    <Canvas :ship="ship" :magnification="magnification" :background="false" :canvas-size="{ x: 250, y: 250 }"></Canvas>
  </div> -->
  </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
  import { useKeyPress } from '../composables/useKeyPress';
  import { useMovement } from '../composables/useMovement';
  import { Ship } from '../entitites/ship';
  import CanvasWithControls from './CanvasWithControls.vue';
  // import MagnificationControls from '../components/MagnificationControls.vue';
  // import Canvas from '../components/Canvas.vue';
  
  
  const { keysPressed, onKeydown, onKeyup } = useKeyPress();
  const ship = ref(new Ship('ship', 100, { x: 0, y: 0 }, { x: 0, y: 0 }, 100));
  const otherObject = ref(new Ship('otherobj', 100, { x: 0, y: 0 }, { x: 0, y: 0 }, 100));
  const { updateShipMovement } = useMovement(ship.value, keysPressed);
  
  onMounted(() => {
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('keyup', onKeyup);
  });
  
  watchEffect(() => {
    updateShipMovement.value;
  
  });
  </script>
  <style>
  .canvas-container {
    display: flex;
    flex-direction: row;
  }
</style>
  