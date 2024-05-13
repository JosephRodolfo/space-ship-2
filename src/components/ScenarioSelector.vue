<template>
  <div class="magnification-controls control-element-border">
        <CollapsibleControls label="Scenario" type="display" :value="scenarioName">
            <div class="speed-controls">
        <button
          v-for="scenario in mainStore.scenarioOptions.filter((el) => el.id !== selectedScenario)"
          :key="scenario.id"
          :class="['button', { 'selected-button': selectedScenario === scenario.id }]"
          @click="selectScenario(scenario.id)"
        >
          {{ scenario.name }}
        </button>
        <button class="button" @click="resetScenario">Reset</button>
      </div>
        </CollapsibleControls>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { onMounted, ref, computed } from "vue";
  import { useMainStore } from "../store/store";
  import CollapsibleControls from "./CollapsibleControls.vue";
  const mainStore = useMainStore();
  const selectedScenario = ref<number | null>(null);
  
  function selectScenario(id: number) {
    mainStore.setScenario(id);
    selectedScenario.value = id;
  }
  onMounted(() => {
    selectedScenario.value = mainStore.initialState!.id;
  });

  const scenarioName = computed(() => {
    return mainStore.scenarioOptions.find((el) => el.id === selectedScenario.value)?.name || 'Unknown';
  })
  function resetScenario() {
    mainStore.resetScenario();
  }
  </script>
  