<template>
    <div class="magnification-controls">
      <button @click="changeMagnification(-.1)">-</button>
      <span>{{ roundedMagnification }}</span>
      <button @click="changeMagnification(.1)">+</button>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, defineEmits, computed } from 'vue';
  
  const magnification = ref(1);
  const emit = defineEmits(['input']);
  
  const changeMagnification = (value: number) => {
    const result = magnification.value + value;
    if (result > 0) {
      magnification.value = result;
          emit('input', magnification.value);
    }
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
  
  .magnification-controls button {
    cursor: pointer;
  }
  </style>
  