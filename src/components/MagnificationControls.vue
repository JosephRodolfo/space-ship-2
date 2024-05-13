<template>
    <div class="magnification-controls control-element-border">
        <CollapsibleControls label="Magnification" :value="magnification" type="range" @update:value="updateValue"
            :min="1" :max="10" :step="1">
            <div class="speed-controls">
                <div class="tiles button">
                    <button v-for="(value, index) in multipliers" :key="index" class="tile"
                        :class="{ 'selected': selectedTile === value }" @click="selectTile(value)">
                        {{ value.toLocaleString() }}
                    </button>
                </div>
                <div>Displayed Magnification: {{ displayedMagnification.toLocaleString() }}</div>
            </div>
        </CollapsibleControls>
    </div>
</template>


<script lang="ts" setup>
import { ref, computed, defineEmits, onMounted } from 'vue';
import CollapsibleControls from './CollapsibleControls.vue';

const props = defineProps({
    magnificationOpts: {
        default: () => {},
        type: Object,
    },
});

onMounted(() => {
    emitInput();
})

const multipliers = [1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];
const selectedTile = ref(multipliers[props.magnificationOpts.defaultMagnification]); 
const magnification = ref(3);  
const displayedMagnification = computed(() => magnification.value * selectedTile.value);

function selectTile(value: number) {
  selectedTile.value = value;
  emitInput();  
}

const emit = defineEmits(['input']);

function emitInput() {
  emit('input', displayedMagnification.value);
}

function updateValue(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    magnification.value = Number(inputElement.value);
    emitInput(); 
}

</script>



<style>
.magnification-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>