<script setup>
import { computed } from 'vue'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        default: 'Please select an option'
    },
    modelValue: {
        type: [String, Number, Object],
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default: () => []
    },
    optionLabel: {
        type: String,
        default: 'label'
    },
    optionValue: {
        type: String,
        default: 'value'
    }
})

const emit = defineEmits(['update:modelValue'])

// Computed property to determine if we should use slot or props
const useSlot = computed(() => {
    return props.options.length === 0
})

// Handle the select change event
const handleChange = (event) => {
    const value = event.target.value

    // If using prop-based options, find the actual object/value
    if (!useSlot.value && props.options.length > 0) {
        const selectedOption = props.options.find(option => {
            const optionVal = typeof option === 'object' ? option[props.optionValue] : option
            return String(optionVal) === value
        })

        if (selectedOption) {
            const returnValue = typeof selectedOption === 'object' ? selectedOption[props.optionValue] : selectedOption
            emit('update:modelValue', returnValue)
        } else {
            emit('update:modelValue', value)
        }
    } else {
        // For slot-based, emit the raw value
        emit('update:modelValue', value)
    }
}

// Computed property for the current value to display
const displayValue = computed(() => {
    if (!useSlot.value && props.options.length > 0) {
        const option = props.options.find(opt => {
            const optionVal = typeof opt === 'object' ? opt[props.optionValue] : opt
            return optionVal === props.modelValue
        })

        if (option) {
            return typeof option === 'object' ? option[props.optionValue] : option
        }
    }

    return props.modelValue
})
</script>

<template>
    <div class="select-wrapper">
        <label :for="label">{{ label }}</label>
        <div class="flex-row-sm-gap-wrapper w-full">
            <select class="default-transition" :id="label" :value="displayValue" @change="handleChange"
                :disabled="disabled">
                <option value="" disabled>{{ placeholder }}</option>

                <!-- Prop-based options -->
                <template v-if="!useSlot">
                    <option v-for="option in options" :key="typeof option === 'object' ? option[optionValue] : option"
                        :value="typeof option === 'object' ? option[optionValue] : option">
                        {{ typeof option === 'object' ? option[optionLabel] : option }}
                    </option>
                </template>

                <!-- Slot-based options -->
                <slot v-else></slot>
            </select>
            <slot name="suffix" />
        </div>
    </div>
</template>

<style scoped>
.default-transition {
    transition: all 0.3s ease;
}

.select-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
}

select {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--color-input-border);
    border-radius: 0.5rem;
    background-color: var(--color-input-background);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    padding-right: 3rem;

    &:focus {
        border-color: var(--color-input-border-focus);
        color: var(--color-text-active);
    }

    &:disabled {
        opacity: var(--opacity-disabled);
        cursor: not-allowed;
    }
}

option {
    background-color: var(--color-input-background);
    color: var(--color-text);
    padding: 0.5rem;
}
</style>