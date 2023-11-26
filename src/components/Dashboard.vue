<template>
    <p>Velocity X: {{ ship.velocity.x!.toFixed(2) }}</p>
    <p>Velocity Y: {{ ship.velocity.y!.toFixed(2) }}</p>
    <p>Accleration X: {{ ship.acceleration.x!.toFixed(2) }} Accleration Y: {{ ship.acceleration.y?.toFixed(2) }}</p>
  
    <!-- <div>{{ keysPressed }}</div> -->
    <p>Position: {{ ship.position.x!.toFixed(2) }}, {{ ship.position.y!.toFixed(2) }}</p>
    <MagnificationControls @input="handleMagnificationChange"></MagnificationControls>
    <Canvas :ship="ship" :magnification="magnification"></Canvas>
  </template>
  
  <script setup lang="ts">
  import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
  import { useKeyPress } from '../composables/useKeyPress';
  import { useMovement } from '../composables/useMovement';
  import { Ship } from '../entitites/ship';
  import MagnificationControls from '../components/MagnificationControls.vue';
  import Canvas from '../components/Canvas.vue';
  
  
  const magnification = ref(1); // Initialize magnification
  const { keysPressed, onKeydown, onKeyup } = useKeyPress();
  const ship = ref(new Ship('ship', 100, { x: 0, y: 0 }, { x: 0, y: 0 }));
  const { updateShipMovement } = useMovement(ship.value, keysPressed);
  
  function handleMagnificationChange(val: number) {
    magnification.value = val;
  }
  
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
  