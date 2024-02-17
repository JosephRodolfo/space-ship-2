<template>
  <div v-if="currentScenario">
  <ScenarioSelector></ScenarioSelector>
  <p>Velocity X: {{ currentScenario!.ship.velocity.x!.toFixed(2) }}</p>
  <p>Velocity Y: {{ currentScenario!.ship.velocity.y!.toFixed(2) }}</p>
  <p>
    Accleration X: {{ currentScenario!.ship.acceleration.x!.toFixed(2) }} Accleration Y:
    {{ currentScenario!.ship.acceleration.y?.toFixed(2) }}
  </p>
  <p>Angle: {{ (currentScenario!.ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>
  <div class="speed-controls">
    <input type="range" :min="speedSettings.min" :max="speedSettings.max" :step="1" :value="mainStore.gameEngine.speed" @input="setSpeed"/>
    <span>{{ mainStore.gameEngine.speed }}</span>
    <button @click="handlePause">Pause</button>
    <button @click="initCalculateTrajectory"> calculate Trajectory</button>
  </div>
  <p>
    Position: {{ currentScenario!.ship.position.x!.toFixed(2) }},
    {{ currentScenario!.ship.position.y!.toFixed(2) }}
  </p>
  <div class="canvas-container">
    <CanvasWithControls
      :magnificationOpts="{
        stepValue: 1,
        minValue: magnificationSettings.map.min,
        maxValue: magnificationSettings.map.max,
        defaultMagnification: magnificationSettings.map.default,
      }"
      :background="true"
    ></CanvasWithControls>
    <CanvasWithControls
      :magnificationOpts="{
        stepValue: 1,
        minValue: magnificationSettings.miniMap.min,
        maxValue: magnificationSettings.miniMap.max,
        defaultMagnification: magnificationSettings.miniMap.default,
      }"
      :background="false"
      :canvas-size="canvasSize"
    ></CanvasWithControls>
  </div>
</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch } from "vue";
import ScenarioSelector from "./ScenarioSelector.vue";
import { useKeyPress } from "../composables/useKeyPress";
import CanvasWithControls from "./CanvasWithControls.vue";
import { useMainStore } from "../store/store";
import { Physics } from "../entitites/physics";
const { keysPressed, onKeydown, onKeyup } = useKeyPress();
const currentScenario = computed(() => {
  return mainStore.initialState;
})
const speedSettings = computed(() => {
  return currentScenario.value!.speedSettings;
})
const magnificationSettings = computed(() => {
  return currentScenario.value!.magnificationSettings;
});
const mainStore = useMainStore();
const canvasSize = computed(() => ({
  x: 250,
  y: 250,
}));
const physics = new Physics();
const currentReferenceBody = computed(() => {
  if (!mainStore.initialState) return null;
  return mainStore.initialState.otherBodies.find((el) => el.name === mainStore.referenceBody);
})

function setSpeed(event: Event) {
  const inputEvent = event as InputEvent;
  const inputElement = inputEvent.target as HTMLInputElement;
  mainStore.setSpeed(Number(inputElement.value));
}

function initCalculateTrajectory() {
  if (!currentScenario.value) return;
    const relativeVelocity = 
    currentReferenceBody.value 
    ? physics.calculateRelativeVelocity(currentScenario.value.ship.velocity, currentReferenceBody.value!.velocity)
    :
    currentScenario.value.ship.velocity;
    const relativePosition = 
    currentScenario.value.ship.position;
    const relativeAcceleration = 
    currentScenario.value.ship.acceleration;
    mainStore.setTrajectoryData([]);
    const position = { x: relativePosition.x, y: relativePosition.y };
    const velocity = { x: relativeVelocity.x, y: relativeVelocity.y };
    const acceleration = { x: relativeAcceleration.x, y: relativeAcceleration.y };
    const otherMapped = currentScenario.value.otherBodies.map(
      ({ mass, position, acceleration, velocity, name }) => {
        return {
          mass,
          position: { x: position.x, y: position.y},
          acceleration: { x: acceleration.x, y: acceleration.y},
          velocity: { x: velocity.x, y: velocity.y},
          name,
        };
      }
    );
    const window = 1000;
    mainStore.gameEngine.setWindowCount(1, window);
    worker.postMessage({
      shipData: {
        position,
        velocity,
        acceleration,
        mass: currentScenario.value.ship.mass,
      },
      timeStep: Number(mainStore.gameEngine.speed) ? Number(mainStore.gameEngine.speed) : 1,
      otherBodies: otherMapped,
      window: [0, window],
    });
}

watch(
  () => currentScenario.value?.ship.firingThruster,
  (newVal, oldVal) => {
    if (currentScenario.value && currentScenario.value.ship.firingThruster != null) {
      if (newVal === false && oldVal === undefined) return;
      if (newVal !== false && oldVal !== true) {
        return;
      }
      initCalculateTrajectory();
    }
  },
  {
    immediate: true,
  }
);



let worker: Worker;
onMounted(() => {
  mainStore.setControls(keysPressed);
  mainStore.initializeScenario(4);
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
  mainStore.gameEngine.stop();
});
function handlePause() {
  mainStore.setPause();
}
</script>
<style>
.canvas-container {
  display: flex;
  flex-direction: row;
}
</style>
