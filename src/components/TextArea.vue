<script setup>
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
    rows: {
        type: Number,
        default: 4
    }
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="textarea-wrapper">
        <label :for="label">{{ label }}</label>
        <textarea 
            class="default-transition" 
            :id="label" 
            :placeholder="placeholder" 
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)" 
            :disabled="disabled"
            :rows="rows" 
        />
    </div>
</template>

<style scoped>
.default-transition {
    transition: all 0.3s ease;
}

.textarea-wrapper {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    width: 100%;
    gap: 0.5rem;
}

textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--color-input-border);
    border-radius: 0.5rem;
    background-color: var(--color-input-background);
    color: var(--color-text);
    outline: none;
    resize: vertical;
    font-family: inherit;

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