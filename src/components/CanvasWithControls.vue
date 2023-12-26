<template>
  <div class="canvas-with-controls">
    <div class="controls">
      <button @click="toggleOtherObjects">
        Hide other: {{ !hideOtherObjects }}
      </button>
      <MagnificationControls
        :magnificationOpts="magnificationOpts"
        @input="handleMagnificationChange"
      ></MagnificationControls>
      <button @click="recenterCanvas">Recenter</button>
      <div class="reference-body-buttons">
        <button
          v-for="body in otherObjects"
          :key="body.name"
          :class="{ 'selected-button': referenceBody === body.name }"
          @click="selectReferenceBody(body.name)"
        >
          {{ body.name }}
        </button>
      </div>
    </div>

    <div class="canvas">
      <Canvas
        :ship="ship"
        :draw-other-objects="hideOtherObjects"
        :other-objects="otherObjects"
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
import { Ship } from "../entitites/ship";
import { Planet } from "../entitites/planet";
import { useMainStore } from "../store/store";

const props = defineProps({
  ship: Object as () => Ship,
  background: Boolean,
  canvasSize: {
    default: { x: 500, y: 500 },
    type: Object,
  },
  otherObjects: {
    default: () => [],
    type: Array as () => Planet[],
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

function handleMagnificationChange(val: number) {
  magnification.value = val;
}

function toggleOtherObjects() {
  hideOtherObjects.value = !hideOtherObjects.value;
}
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
</style>
