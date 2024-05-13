<template>
  <div class="magnification-controls control-element-border">
      <CollapsibleControls
        label="Speed"
        id="speed"
        :min="speedSettings.min"
        :max="speedSettings.max"
        :step="currentStep"
        :value="mainStore.gameEngine.speed"
        @update:value="setSpeed"
      >
      <div class="speed-controls">
        <div class="button">
          <label for="step-size">Step Size: </label>
          <input
            id="step-size"
            type="number"
            :value="settings.stepSize"
            @input="updateStepSize($event)"
            min="1"
          />
        </div>
        <div class="button">
          <label for="logarithmic-toggle">Logarithmic:</label>
          <input id="logarithmic-toggle" type="checkbox" v-model="settings.logarithmic" />
        </div>
        <div class="button">
          <label for="logarithmic-sensitivity">Logarithmic Sensitivity: </label>
          <input
            id="logarithmic-sensitivity"
            type="number"
            v-model="settings.logarithmicSensitivity"
            min="1"
          />
        </div>
        </div>
      </CollapsibleControls>
    </div>
  </template>
  
  <script setup lang="ts">
  import CollapsibleControls from './CollapsibleControls.vue';
  import { computed, reactive } from "vue";
  import { useMainStore } from "../store/store";
  
  const mainStore = useMainStore();
  const currentScenario = computed(() => mainStore.initialState);
  const speedSettings = computed(() => currentScenario.value!.speedSettings);
  const settings = reactive({
    stepSize: 1,
    logarithmicSensitivity: 1,
    logarithmic: false,
  });
  

  const currentStep = computed(() => {
    if (settings.logarithmic) {
    const baseLog = Math.log10(mainStore.gameEngine.speed);
    const adjustedLog = baseLog / settings.logarithmicSensitivity;
    return Math.pow(10, Math.floor(adjustedLog));
  }
    return settings.stepSize;
});
  
function setSpeed(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  mainStore.setSpeed(Number(inputElement.value));
}
  
  function updateStepSize(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    settings.stepSize = Math.max(Number(inputElement.value), 1);
  }
  </script>
  