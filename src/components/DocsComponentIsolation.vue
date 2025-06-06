<template>
  <div class="component-isolation-wrapper">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Simple component that provides style isolation for its content
</script>

<style scoped lang="scss">
.component-isolation-wrapper {
  /* Create a new stacking context */
  position: relative;
  z-index: 0;

  /* Remove the atomic-docs class influence */
  color: initial;
  font-family: initial;
  font-size: initial;
  line-height: initial;

  /* Reset specific atomic-docs CSS variables that might affect the component */
  --atomic-docs-primary-color: initial;
  --atomic-docs-secondary-color: initial;
  --atomic-docs-background-color: initial;
  --atomic-docs-surface-color: initial;
  --atomic-docs-error-color: initial;
  --atomic-docs-text-primary: initial;
  --atomic-docs-text-secondary: initial;
  --atomic-docs-border-color: initial;
  --atomic-docs-spacing-xs: initial;
  --atomic-docs-spacing-sm: initial;
  --atomic-docs-spacing-md: initial;
  --atomic-docs-spacing-lg: initial;
  --atomic-docs-spacing-xl: initial;
  --atomic-docs-font-family: initial;
  --atomic-docs-font-family-mono: initial;
  --atomic-docs-font-size-xs: initial;
  --atomic-docs-font-size-sm: initial;
  --atomic-docs-font-size-md: initial;
  --atomic-docs-font-size-lg: initial;
  --atomic-docs-font-size-xl: initial;
  --atomic-docs-border-radius-sm: initial;
  --atomic-docs-border-radius-md: initial;
  --atomic-docs-border-radius-lg: initial;

  /* Ensure the container takes full width */
  width: 100%;
}
</style>