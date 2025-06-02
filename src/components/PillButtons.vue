<script setup>
import { ref } from 'vue';
const sectionValue = ref('sales')
const emit = defineEmits(['update-section']);

function updateSection(value) {
    if(value != sectionValue.value){
        emit('update-section', value);
        sectionValue.value = value
    }
}
</script>

<template>
    <div class="flex gap-2">
        <button class="bg-cyan-600 h-10 flex-1 rounded-3xl baseButton pillButton" @click="updateSection('Sales')">
            Sales History
        </button>
        <button class="bg-cyan-600 h-10 flex-1 rounded-3xl baseButton pillButton" @click="updateSection('Inventory')">
            Inventory
        </button>
    </div>
</template>

<style>
</style>