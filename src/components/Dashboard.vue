<template>
  <ScenarioSelector></ScenarioSelector>
  <p>Velocity X: {{ currentScenario.ship.velocity.x!.toFixed(2) }}</p>
  <p>Velocity Y: {{ currentScenario.ship.velocity.y!.toFixed(2) }}</p>
  <p>
    Accleration X: {{ currentScenario.ship.acceleration.x!.toFixed(2) }} Accleration Y:
    {{ currentScenario.ship.acceleration.y?.toFixed(2) }}
  </p>
  <p>Angle: {{ (currentScenario.ship.rotationAngle * (180 / Math.PI)).toFixed(0) }}</p>
  <div class="speed-controls">
    <input type="range" :min="speedSettings.min" :max="speedSettings.max" :step="1" v-model="speed" />
    <span>{{ speed }}</span>
    <button @click="handlePause">Pause</button>
    <button @click="initCalculateTrajectory"> calculate Trajectory</button>
  </div>
  <p>
    Position: {{ currentScenario.ship.position.x!.toFixed(2) }},
    {{ currentScenario.ship.position.y!.toFixed(2) }}
  </p>
  <div class="canvas-container">
    <CanvasWithControls
      :magnificationOpts="{
        stepValue: 1,
        minValue: magnificationSettings.map.min,
        maxValue: magnificationSettings.map.max,
        defaultMagnification: magnificationSettings.map.default,
      }"
      :ship="currentScenario.ship"
      :other-objects="currentScenario.otherBodies"
      :background="true"
    ></CanvasWithControls>
    <CanvasWithControls
      :magnificationOpts="{
        stepValue: 1,
        minValue: magnificationSettings.miniMap.min,
        maxValue: magnificationSettings.miniMap.max,
        defaultMagnification: magnificationSettings.miniMap.default,
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
import ScenarioSelector from "./ScenarioSelector.vue";
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
const speedSettings = computed(() => {
  return currentScenario.value.speedSettings;
})
const magnificationSettings = computed(() => {
  return currentScenario.value.magnificationSettings;
});
const mainStore = useMainStore();
let gameEngine: GameEngine;
const canvasSize = computed(() => ({
  x: 250,
  y: 250,
}));
const physics = new Physics();
const currentReferenceBody = computed(() => {
  return mainStore.initialState.otherBodies.find((el) => el.name === mainStore.referenceBody);
})

function initCalculateTrajectory() {
    const relativeVelocity = currentReferenceBody.value 
    ? physics.calculateRelativeVelocity(currentScenario.value.ship.velocity, currentReferenceBody.value!.velocity)
    :
    currentScenario.value.ship.velocity;

    mainStore.setTrajectoryData([]);
    const position = { ...currentScenario.value.ship.position };
    const velocity = { ...relativeVelocity };
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
      timeStep: Number(speed.value) ? Number(speed.value) : 1,
      otherBodies: otherMapped,
      window: [0, 500],
    });
}

watch(
  () => currentScenario.value.ship.firingThruster,
  (newVal, oldVal) => {
    if (newVal !== false && oldVal !== true) {
      return;
    }
 initCalculateTrajectory();
  }
);

const initializeGameEngine = () => {
  if (gameEngine) {
    gameEngine.stop();
  }
  gameEngine = new GameEngine(
    currentScenario.value.ship,
    currentScenario.value.otherBodies,
    keysPressed,
    speed,
    new Physics()
  );
  gameEngine.start();
};
watch(currentScenario, () => {
  initializeGameEngine();
});

let worker: Worker;
onMounted(() => {
  initializeGameEngine();  
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
