<template>
    <p>Velocity X: {{ ship.velocity.x!.toFixed(2) }}</p>
    <p>Velocity Y: {{ ship.velocity.y!.toFixed(2) }}</p>
    <p>Accleration X: {{ ship.acceleration.x!.toFixed(2) }} Accleration Y: {{ ship.acceleration.y?.toFixed(2) }}</p>
    <p>Angle: {{ (ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>
    <div class="speed-controls">
    <input type="range" :min="1" :max="300" :step="1" v-model="speed" />
    <span>{{ speed }}</span>
  </div>
    <!-- <div>{{ keysPressed }}</div> -->
    <p>Position: {{ ship.position.x!.toFixed(2) }}, {{ ship.position.y!.toFixed(2) }}</p>
    <div class="canvas-container">
      <CanvasWithControls :magnificationOpts="{
        stepValue: 1,
        minValue: 1,
        maxValue: 10000,
        defaultMagnification: 6000,

      }" :ship="ship"  :other-objects="[otherObject]" :background="true"></CanvasWithControls>
      <CanvasWithControls :magnificationOpts="{
        stepValue: 1,
        minValue: 1,
        maxValue: 1000000,
        defaultMagnification: 407143,
      }"
      :ship="ship" :other-objects="[otherObject]" :background="false" :canvas-size="canvasSize"></CanvasWithControls>
  </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, onUnmounted, ref, watchEffect, computed, watch } from 'vue';
  import { useKeyPress } from '../composables/useKeyPress';
  import { useMovement } from '../composables/useMovement';
  import { Ship } from '../entitites/ship';
  import {Planet} from '../entitites/planet';
  import CanvasWithControls from './CanvasWithControls.vue';
  
  const { keysPressed, onKeydown, onKeyup } = useKeyPress();
  const massStation = 420000;
  const G = 6.674 * Math.pow(10, -11); 
  const earthMass = 5.972e+24;
  const distanceFromCenterOfEarth = 6_791_000;
  const speed = ref(1);
  const orbitalVelocity = Math.sqrt(G * earthMass / distanceFromCenterOfEarth);
  const ship = ref(new Ship('ship', massStation, { x: 0, y: 0 }, { x:  -orbitalVelocity, y: 0 }, 100));
  const earthRadius = 6_371_000;
  const otherObject = ref(new Planet({ x: 0, y: distanceFromCenterOfEarth }, earthMass, { x: 0, y: 0 }, earthRadius, 'earth'));
  const { updateShipMovement } = useMovement(ship.value, keysPressed, [otherObject.value], speed);

  const canvasSize = computed(() => ({
  x: 250, 
  y: 250
}));

watch(() => ship.value.firingThruster, () => {
  throttleUpdateTrajectory();
  const position = { ...ship.value.position };
  const velocity = { ...ship.value.velocity };
  const acceleration = { ...ship.value.acceleration };
  const otherMapped = [otherObject.value].map(({ mass, position, acceleration, velocity}) => {
    return {
      mass, 
      position: { ...position },
      acceleration: { ...acceleration },
      velocity: { ...velocity },
    }
  })
  worker.postMessage({
    position,
    velocity,
    acceleration,
    otherBodies: otherMapped,
    window: [0, 1000],
  },
  );
});

let worker: Worker;
  onMounted(() => {
   worker = new Worker(new URL('../workers/trajectoryWorker.ts', import.meta.url), { type: 'module' });
        window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);
    worker.onmessage = (event) => {
  // console.log(trajectoryPoints);
  // Handle the trajectory points (e.g., updating a canvas or state)
};
worker.onerror = (error) => {
  console.error('Worker error:', error);
};
  });
  
  onUnmounted(() => {
    worker.terminate();
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('keyup', onKeyup);
  });
  watchEffect(() => {
    updateShipMovement.value;
  
  });
  function throttleUpdateTrajectory() {

}
  </script>
  <style>
  .canvas-container {
    display: flex;
    flex-direction: row;
  }
</style>
  