<template>
    <div class="speed-controls button container-margin">
        <label :for="id">{{ label }}</label>
        <input v-if="type!== 'display'"
          :type="type"
          :id="id"
          :value="value"
          @input="$emit('update:value', $event)"
          :min="min"
          :max="max"
          :step="step"
        />
        <div v-else class="button">
         {{ value }}
        </div>
        <div v-if="type === 'range'">{{ value?.toLocaleString() }}</div>
        <button @click="toggleVisibility">{{ showSettings ? '-' : '+' }}</button>
      <div v-show="showSettings">
        <slot></slot> 
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  defineProps({
    label: String,
    id: String,
    type: {
      type: String,
      default: 'number'
    },
    displayValue: {
      type: [Number],
      default: null,
      required: false,
    },
    value: [String, Number],
    min: Number,
    max: Number,
    step: Number
  });
  
  const showSettings = ref(false);
  
  function toggleVisibility() {
    showSettings.value = !showSettings.value;
  }
  </script>
  
  <style scoped>
  button {
    cursor: pointer;
  }
  </style>
  