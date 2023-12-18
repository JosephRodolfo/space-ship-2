<template>
  <div class="canvas-with-controls">
    <div class="controls">
      <button @click="toggleOtherObjects">
        Hide other: {{ !hideOtherObjects }}
      </button>
      <MagnificationControls
        :initialMagnificatoin="defaultMagnification"
        @input="handleMagnificationChange"
      ></MagnificationControls>
    </div>
    <div class="canvas">
      <Canvas
        :ship="ship"
        :draw-other-objects="hideOtherObjects"
        :other-objects="otherObjects"
        :magnification="magnification"
        :background="background"
        :canvas-size="canvasSize"
      ></Canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import MagnificationControls from "./MagnificationControls.vue";
import Canvas from "./Canvas.vue";
import { Ship } from "../entitites/ship";

const props = defineProps({
  ship: Object as () => Ship,
  background: Boolean,
  canvasSize: Object,
  otherObjects: {
    default: () => [],
    type: Array as () => Ship[],
  },
  defaultMagnification: {
    default: 1,
    type: Number,
  },
});
const magnification = ref(props.defaultMagnification);
const hideOtherObjects = ref(true);

function handleMagnificationChange(val: number) {
  magnification.value = val;
}

function toggleOtherObjects() {
  hideOtherObjects.value = !hideOtherObjects.value;
}
</script>

<style>
.canvas-with-controls {
  display: flex;
  flex-direction: column;
}
</style>
