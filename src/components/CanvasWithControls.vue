<template>
  <div class="canvas-with-controls">
    <div class="controls">
      <!-- <button class="button" @click="toggleOtherObjects">
        Hide other: {{ !hideOtherObjects }}
      </button> -->
      <MagnificationControls
        :magnificationOpts="magnificationOpts"
        @input="handleMagnificationChange"
      ></MagnificationControls>
      <button class="button" @click="recenterCanvas">Recenter</button>
      <div class="reference-body-buttons">
        <button
          v-for="body in otherObjects"
          :key="body.name"
          :class="['button', { 'selected-button': referenceBody === body.name }]"
          @click="selectReferenceBody(body.name)"
        >
          {{ body.name }}
        </button>
      </div>
    </div>

    <div class="canvas">
      <Canvas
        :draw-other-objects="hideOtherObjects"
        :magnification="Number(magnification)"
        :background="background"
        :canvas-size="canvasSize"
        :canvas-center-offset="canvasCenterOffset"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      ></Canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import MagnificationControls from "./MagnificationControls.vue";
import Canvas from "./Canvas.vue";
import { useMainStore } from "../store/store";

const props = defineProps({
  background: Boolean,
  canvasSize: {
    default: { x: 500, y: 500 },
    type: Object,
  },
  magnificationOpts: {
    default: () => {},
    type: Object,
  },
});
const magnification = ref(props.magnificationOpts.defaultMagnification);
const hideOtherObjects = ref(true);
const mainStore = useMainStore();
const referenceBody = computed(() => {
  return mainStore.referenceBody;
});

const otherObjects = computed(() => {
  return mainStore.initialState?.otherBodies;
})

function handleMagnificationChange(val: number) {
  magnification.value = val;
}

// function toggleOtherObjects() {
//   hideOtherObjects.value = !hideOtherObjects.value;
// }
function selectReferenceBody(value: string) {
  mainStore.setReferenceBody(value);
}
const canvasCenterOffset = ref({ x: 0, y: 0 });

function recenterCanvas() {
  canvasCenterOffset.value = { x: 0, y: 0 };
}

const isDragging = ref(false);
const lastMousePosition = ref({ x: 0, y: 0 });

function handleMouseDown(event: MouseEvent) {
  isDragging.value = true;
  lastMousePosition.value = { x: event.clientX, y: event.clientY };
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value) {
    const dx = event.clientX - lastMousePosition.value.x;
    const dy = event.clientY - lastMousePosition.value.y;

    canvasCenterOffset.value.x += dx;
    canvasCenterOffset.value.y += dy;

    lastMousePosition.value = { x: event.clientX, y: event.clientY };
  }
}

function handleMouseUp() {
  isDragging.value = false;
}
</script>

<style>
.canvas-with-controls {
  display: flex;
  flex-direction: column;
}
.reference-body-buttons {
  display: flex;
  flex-direction: row;
  gap: 5px;
}
</style>
