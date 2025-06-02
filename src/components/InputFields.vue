<template>
    <div class="flex-1">
        <label :for="id" v-if="label">{{ label }}</label>
        <input
            :id="id"
            :placeholder="placeholder"
            :value="modelValue"
            @input="onInput"
            @blur="onBlur"
            :disabled="disabled"
            :type="type"
            :min="min"
            class="border-2 rounded-2xl text-center hover:bg-gray-500/20 w-full"
        />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const touched = ref(false);  

const props = defineProps({
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    rules: {
        type: Array,
        default: () => []
    },
    disabled: Boolean,
    type: String,
    min: String,
    id: String
});

const emit = defineEmits(['update:modelValue']);

const errorMessage = ref('');

function onBlur(event) {
    touched.value = true;
    const value = event.target.value;
    validate(value);
}

function validate(value = null) {
    const valToValidate = value !== null ? value : props.modelValue;
    for (const rule of props.rules) {
        const result = rule(valToValidate);
        if (result !== true) {
        errorMessage.value = result;
        return false;
        }
    }
    errorMessage.value = '';
    return true;
}

function onInput(event) {
    let value = event.target.value;
    if (props.type === 'number' && value !== '') {
        value = Number(value);
    }
    emit('update:modelValue', value);
    if (touched.value) validate(value);
}

</script>
