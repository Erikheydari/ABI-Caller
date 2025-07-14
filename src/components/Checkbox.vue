<script setup>
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])
</script>
<template>
    <div class="checkbox-wrapper">
        <div class="checkbox-input-wrapper">
            <input type="checkbox" :id="label" :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)" :disabled="disabled"
                class="default-transition" />
        </div>
        <label :for="label">{{ label }}</label>
    </div>
</template>
<style scoped>
.default-transition {
    transition: all 0.3s ease;
}

.checkbox-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 0.5rem;
}

.checkbox-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    border: 1px solid var(--color-input-border);
    border-radius: 0.25rem;
    background-color: var(--color-input-background);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    appearance: none;
    position: relative;

    &:checked {
        background-color: var(--color-input-background-active);
        border-color: var(--color-input-border-focus);

        &::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 0.9rem;
            height: 0.9rem;
            background-color: var(--color-text-active);
            border-radius: 0.125rem;
        }
    }

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