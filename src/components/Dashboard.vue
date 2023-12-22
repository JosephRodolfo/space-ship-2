<template>
    <p>Velocity X: {{ ship.velocity.x!.toFixed(2) }}</p>
    <p>Velocity Y: {{ ship.velocity.y!.toFixed(2) }}</p>
    <p>Accleration X: {{ ship.acceleration.x!.toFixed(2) }} Accleration Y: {{ ship.acceleration.y?.toFixed(2) }}</p>
    <p>Angle: {{ (ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>
    <div class="speed-controls">
    <input type="range" :min="1" :max="300" :step="1" v-model="speed" />
    <span>{{ speed }}</span>
    <button @click="handlePause">Pause</button>
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
  import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
  import { useKeyPress } from '../composables/useKeyPress';
  import { Ship } from '../entitites/ship';
  import { Planet } from '../entitites/planet';
import { GameEngine } from '../entitites/GameEngine';
  import CanvasWithControls from './CanvasWithControls.vue';
  import { useMainStore } from '../store/store';
import { Physics } from '../entitites/physics';
  
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
  const mainStore = useMainStore();
  const gameEngine = new GameEngine(ship.value, [otherObject.value], keysPressed, speed, new Physics());
  const canvasSize = computed(() => ({
  x: 250, 
  y: 250
    }));


watch(() => ship.value.firingThruster, (newVal, oldVal) => {
  if (newVal !== false && oldVal !== true) {
    return;
  }
  mainStore.setTrajectoryData([]);
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
    shipData: {
      position,
      velocity,
      acceleration,
      mass: ship.value.mass,
    },
    timeStep: Number(speed.value),
    otherBodies: otherMapped,
    window: [0, 3000],
  },
  );
});
let worker: Worker;
  onMounted(() => {
    gameEngine.start();
   worker = new Worker(new URL('../workers/trajectoryWorker.ts', import.meta.url), { type: 'module' });
        window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);
    worker.onmessage = (event) => {
  const { chunk } = event.data;
  mainStore.setTrajectoryData([...mainStore.trajectoryData, ...chunk]);
      };
worker.onerror = (error) => {
  console.error('Worker error:', error);
};
  });
  
  onUnmounted(() => {
    worker.terminate();
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('keyup', onKeyup);
    gameEngine.stop();
  });
  function handlePause() {
    mainStore.setPause();
    if (mainStore.pause) {
      speed.value = 0;
    } else {
      speed.value = 1;
    }
  }
  </script>
  <style>
  .canvas-container {
    display: flex;
    flex-direction: row;
  }
</style>
  