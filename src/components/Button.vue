<script setup>
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'button'
    },
    size: {
        type: String,
        default: 'base'
    },
    variant: {
        type: String,
        default: 'primary'
    }
})
</script>
<template>
    <button :type="type" class="default-transition" :disabled="disabled"
        :class="[size === 'small' ? 'button-small button-text-sm' : 'button-base button-text',
        variant === 'secondary' ? 'button-secondary' : ''
        ]">
        <slot />
    </button>
</template>
<style scoped>
button {
    background: var(--color-foreground-mute);
    color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    cursor: pointer;
    text-wrap: nowrap;
    width: max-content;
    transition: all 0.3s ease;

    &:disabled {
        opacity: var(--opacity-disabled);
        cursor: not-allowed;
    }

    &:hover {
        background: var(--color-foreground-soft);
    }
}

.button-small {
    padding: 0.5rem 1rem;
    height: 2rem;
}

.button-base {
    padding: 0.75rem 1rem;
    height: 2.5rem;
}

.button-secondary {
    background: var(--color-background-soft);
    color: var(--color-foreground);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    cursor: pointer;
    text-wrap: nowrap;
    width: max-content;

    &:hover {
        background: var(--color-background-mute);
    }
}
</style>