<template>
    <div class="scenario-selector">
      <p>Scenario Selector</p>
      <div class="selector-links">
        <button
          v-for="scenario in mainStore.scenarioOptions"
          :key="scenario.id"
          @click="selectScenario(scenario.id)"
        >
          {{ scenario.name }}
        </button>
        <button @click="resetScenario">Reset</button>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
import { useMainStore } from "../store/store";
const mainStore = useMainStore();

function selectScenario(id: number) {
      mainStore.resetScenario();
  mainStore.setScenario(id);
}
function resetScenario() {
    mainStore.resetScenario();
}
</script>
<style>
.scenario-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>


  