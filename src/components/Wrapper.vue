<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Wrapper Component'
  }
})
</script>

<template>
  <details class="details-wrapper" open>
    <summary class="title-text-sm">
      {{ props.title }}
    </summary>
    <fieldset class="fieldset-wrapper">
      <legend class="text-xs">
        {{ props.title }}
      </legend>
      <slot></slot>
    </fieldset>
  </details>
</template>

<style scoped>
.details-wrapper {
  width: 100%;
  border: 1px solid var(--color-border);
}

summary {
  background-color: var(--color-background-soft);
  padding: 1rem
}

fieldset legend {
  padding: 1rem 0;
}

fieldset {
  padding: 0 1rem 1rem 1rem;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  gap: 1rem
}
</style>
