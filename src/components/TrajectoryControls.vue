<template>
  <div class="magnification-controls control-element-border">
    <CollapsibleControls
      label="Trajectory"
      :value="mainStore.trajectorySettings.window"
      type="range"
      @update:value="updateValue"
      :min="computedValue.min"
      :max="computedValue.max"
      :step="selectedTile"
    >
    <div class="speed-controls">

      <div class="tiles button">
        <button v-for="(value, index) in multipliers" :key="index" class="tile"
                :class="{'selected': selectedTile === value}"
                @click="selectTile(value)">
          {{ value.toLocaleString() }}
        </button>
      </div>
      <div class="slider-container button">
        <input type="range" :min="20" :max="200" :step="1" v-model="granularity" />
        <span>Granularity: {{ granularity }}</span>
      </div>
      <p class="button">Trajectory storage: {{ mainStore.trajectoryData.length }}</p>
  <p class="button">Total chunk: {{ mainStore.trajectorySettings.totalChunks }}</p>
      </div> 
    </CollapsibleControls>
  </div>
</template>



<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useMainStore } from "../store/store";
import CollapsibleControls from './CollapsibleControls.vue';

const mainStore = useMainStore();
const multipliers = [1000, 10000, 100000, 1000000]; // Multiplier options
const selectedTile = ref(multipliers[0]); // Initialize with the first multiplier
const granularity = ref(mainStore.trajectorySettings.granularity || 20);

const computedValue = computed(() => {
  return {
    min: 1 * selectedTile.value,
    max: 10 * selectedTile.value
  }
});

watch([selectedTile, granularity], () => {
  const windowValue = selectedTile.value;
  mainStore.setTrajectorySettings({ window: windowValue, granularity: granularity.value });
}, { deep: true });

function updateValue(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  mainStore.setTrajectorySettings({ ...mainStore.trajectorySettings, window: Number(inputElement.value) });
}

function selectTile(value: number) {
  selectedTile.value = value;
}
</script>




<style>
.magnification-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
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
