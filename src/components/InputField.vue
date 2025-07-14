<script setup>
import Button from './Button.vue';
import { ref } from 'vue';

defineProps({
    label: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'text'
    }
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="input-wrapper">
        <label :for="label">{{ label }}</label>
        <div class="flex-row-sm-gap-wrapper w-full">
            <input class="default-transition" :id="label" :type="type" :placeholder="placeholder" :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)" :disabled="disabled" />
            <slot name="suffix" />
        </div>
    </div>
</template>

<style scoped>
.default-transition {
    transition: all 0.3s ease;
}

.input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    width: 100%;
    gap: 0.5rem;
}

input {
    width: 100%;
    padding: 1rem;
    height: 2.5rem;
    border: 1px solid var(--color-input-border);
    border-radius: 0.5rem;
    background-color: var(--color-input-background);
    color: var(--color-text);
    outline: none;

    &:focus {
        border-color: var(--color-input-border-focus);
        color: var(--color-text-active);
    }

    &:disabled {
        opacity: var(--opacity-disabled);
        cursor: not-allowed;
    }
}
</style>