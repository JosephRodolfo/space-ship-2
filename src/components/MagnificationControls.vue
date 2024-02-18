<template>
  <div class="magnification-controls control-element-border">
    <input type="range" :min="magnificationOpts.minValue" :max="magnificationOpts.maxValue" :step="magnificationOpts.stepValue" v-model="magnification" @input="emitInput" />
    <span>{{ roundedMagnification.toFixed(1) }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits, computed } from 'vue';

const props = defineProps({
  magnificationOpts: {
  default: () => {},
    type: Object,
  },

});

const magnification = ref(props.magnificationOpts.defaultMagnification);
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

</style>

  