<template>
  <div class="magnification-controls">
    <input type="range" :min="minValue" :max="maxValue" :step="stepValue" v-model="magnification" @input="emitInput" />
    <span>{{ roundedMagnification.toFixed(1) }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits, computed } from 'vue';

const props = defineProps({
  defaultMagnification: {
    default: 1,
    type: Number,
  },
  minValue: {
    default: 1,
    type: Number,
  },
  maxValue: {
    default: 1000000,
    type: Number,
  },
  stepValue: {
    default: 0.1,
    type: Number,
  },
});

const magnification = ref(props.defaultMagnification);
const emit = defineEmits(['input']);

const emitInput = () => {
  emit('input', magnification.value);
};

const roundedMagnification = computed(() => {
  return Math.round(magnification.value * 10) / 10;
});
</script>

  
<style>
.magnification-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Add additional styles for the slider if needed */
</style>

  