<template>
    <p>Velocity X: {{ ship.velocity.x!.toFixed(2) }}</p>
    <p>Velocity Y: {{ ship.velocity.y!.toFixed(2) }}</p>
    <p>Accleration X: {{ ship.acceleration.x!.toFixed(2) }} Accleration Y: {{ ship.acceleration.y?.toFixed(2) }}</p>
    <p>Angle: {{ (ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>

    <!-- <div>{{ keysPressed }}</div> -->
    <p>Position: {{ ship.position.x!.toFixed(2) }}, {{ ship.position.y!.toFixed(2) }}</p>
    <div class="canvas-container">
      <CanvasWithControls :ship="ship"  :other-objects="[otherObject]" :background="true"></CanvasWithControls>
      <CanvasWithControls :ship="ship" :other-objects="[otherObject]" :background="false" :canvas-size="{ x: 250, y: 250 }" :default-magnification="100000"></CanvasWithControls>
  </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
  import { useKeyPress } from '../composables/useKeyPress';
  import { useMovement } from '../composables/useMovement';
  import { Ship } from '../entitites/ship';
  import CanvasWithControls from './CanvasWithControls.vue';
  
  const { keysPressed, onKeydown, onKeyup } = useKeyPress();
  const massStation = 420000;
  const G = 6.674 * Math.pow(10, -11); 
  const earthMass = 5.972e+24;
  const distanceFromCenterOfEarth = 6_791_000;

  const orbitalVelocity = Math.sqrt(G * earthMass / distanceFromCenterOfEarth);
  const ship = ref(new Ship('ship', massStation, { x: 0, y: 0 }, { x:  -orbitalVelocity, y: 0 }, 100));
  const earthRadius = 6_371_000;
  const otherObject = ref(new Ship('otherobj', earthMass, { x: 0, y: distanceFromCenterOfEarth }, { x: 0, y: 0 }, earthRadius));
  const { updateShipMovement } = useMovement(ship.value, keysPressed, [otherObject.value]);
  
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
  