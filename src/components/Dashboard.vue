<template>
  <p>Velocity X: {{ currentScenario.ship.velocity.x!.toFixed(2) }}</p>
  <p>Velocity Y: {{ currentScenario.ship.velocity.y!.toFixed(2) }}</p>
  <p>
    Accleration X: {{ currentScenario.ship.acceleration.x!.toFixed(2) }} Accleration Y:
    {{ currentScenario.ship.acceleration.y?.toFixed(2) }}
  </p>
  <p>Angle: {{ (currentScenario.ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>
  <div class="speed-controls">
    <input type="range" :min="1" :max="300" :step="1" v-model="speed" />
    <span>{{ speed }}</span>
    <button @click="handlePause">Pause</button>
  </div>
  <p>
    Position: {{ currentScenario.ship.position.x!.toFixed(2) }},
    {{ currentScenario.ship.position.y!.toFixed(2) }}
  </p>
  <div class="canvas-container">
    <CanvasWithControls
      :magnificationOpts="{
        stepValue: 1,
        minValue: 1,
        maxValue: 10000,
        defaultMagnification: 6000,
      }"
      :ship="currentScenario.ship"
      :other-objects="currentScenario.otherBodies"
      :background="true"
    ></CanvasWithControls>
    <CanvasWithControls
      :magnificationOpts="{
        stepValue: 1,
        minValue: 1,
        maxValue: 1000000,
        defaultMagnification: 407143,
      }"
      :ship="currentScenario.ship"
      :other-objects="currentScenario.otherBodies"
      :background="false"
      :canvas-size="canvasSize"
    ></CanvasWithControls>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useKeyPress } from "../composables/useKeyPress";
import { GameEngine } from "../entitites/GameEngine";
import CanvasWithControls from "./CanvasWithControls.vue";
import { useMainStore } from "../store/store";
import { Physics } from "../entitites/physics";

const { keysPressed, onKeydown, onKeyup } = useKeyPress();
const speed = ref(1);
const currentScenario = computed(() => {
  return mainStore.initialState;
})
const mainStore = useMainStore();
const gameEngine = new GameEngine(
  currentScenario.value.ship,
  currentScenario.value.otherBodies,
  keysPressed,
  speed,
  new Physics()
);
const canvasSize = computed(() => ({
  x: 250,
  y: 250,
}));

watch(
  () => mainStore.initialState.ship.firingThruster,
  (newVal, oldVal) => {
    if (newVal !== false && oldVal !== true) {
      return;
    }
    mainStore.setTrajectoryData([]);
    const position = { ...currentScenario.value.ship.position };
    const velocity = { ...currentScenario.value.ship.velocity };
    const acceleration = { ...currentScenario.value.ship.acceleration };
    const otherMapped = currentScenario.value.otherBodies.map(
      ({ mass, position, acceleration, velocity }) => {
        return {
          mass,
          position: { ...position },
          acceleration: { ...acceleration },
          velocity: { ...velocity },
        };
      }
    );
    worker.postMessage({
      shipData: {
        position,
        velocity,
        acceleration,
        mass: currentScenario.value.ship.mass,
      },
      timeStep: Number(speed.value),
      otherBodies: otherMapped,
      window: [0, 3000],
    });
  }
);
let worker: Worker;
onMounted(() => {
  gameEngine.start();
  worker = new Worker(
    new URL("../workers/trajectoryWorker.ts", import.meta.url),
    { type: "module" }
  );
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("keyup", onKeyup);
  worker.onmessage = (event) => {
    const { chunk } = event.data;
    mainStore.setTrajectoryData([...mainStore.trajectoryData, ...chunk]);
  };
  worker.onerror = (error) => {
    console.error("Worker error:", error);
  };
});

onUnmounted(() => {
  worker.terminate();
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("keyup", onKeyup);
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
