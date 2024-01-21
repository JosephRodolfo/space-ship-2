<template>
  <div class="scenario-selector">
    <p>Scenario Selector</p>
    <div class="selector-links">
      <button
        v-for="scenario in mainStore.scenarioOptions"
        :key="scenario.id"
        :class="{ 'selected-button': selectedScenario === scenario.id }"
        @click="selectScenario(scenario.id)"
      >
        {{ scenario.name }}
      </button>
      <button @click="resetScenario">Reset</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../store/store";
const mainStore = useMainStore();
const selectedScenario = ref<number | null>(null);

function selectScenario(id: number) {
  mainStore.setScenario(id);
  selectedScenario.value = id;
}
onMounted(() => {
  selectedScenario.value = mainStore.initialState!.id;
});
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
