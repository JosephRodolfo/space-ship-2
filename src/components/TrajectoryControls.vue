<template>
  <div class="magnification-controls control-element-border">
    <div class="tiles">
      <button v-for="(value, index) in tileValues" :key="index" class="tile" :class="['button', {selected: selectedTile === value * multiplier}]" @click="selectTile(value * multiplier)">
        {{ (value * multiplier).toLocaleString() }}
      </button>
    </div>
    <div class="slider-container">
      <input type="range" min="1" max="5" step=".5" v-model="multiplier" />
      <span>Multiplier: x{{ multiplier }}</span>
    </div>
    <!-- Granularity Slider -->
    <div class="slider-container">
      <input type="range" min="20" max="200" step="1" v-model="granularity" />
      <span>Granularity: {{ granularity }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useMainStore } from "../store/store";

const mainStore = useMainStore();
const tileValues = [1000, 10000, 100000, 1000000];
const selectedTile = ref(1000); 
const multiplier = ref(1); 
const granularity = ref(mainStore.trajectorySettings.granularity || 1); 

watch([selectedTile, multiplier, granularity], () => {
  const windowValue = selectedTile.value * multiplier.value;
  mainStore.setTrajectorySettings({ window: windowValue, granularity: granularity.value });
}, { deep: true });

function selectTile(value: number) {
  selectedTile.value = value;
}
</script>


<style>
.magnification-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tiles {
  display: flex;
  gap: 5px;
}

.tile {
  padding: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.tile.selected {
  border-color: #646cff;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
