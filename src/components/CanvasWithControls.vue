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
    </div>
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
    <div class="canvas">
      <Canvas
        :ship="ship"
        :draw-other-objects="hideOtherObjects"
        :other-objects="otherObjects"
        :magnification="Number(magnification)"
        :background="background"
        :canvas-size="canvasSize"
      ></Canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import MagnificationControls from "./MagnificationControls.vue";
import Canvas from "./Canvas.vue";
import { Ship } from "../entitites/ship";
import { Planet } from '../entitites/planet';
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
</script>

<style>
.canvas-with-controls {
  display: flex;
  flex-direction: column;
}

</style>
