<template>
  <div
    class="docs-container"
    :class="{ 'docs-container--fluid': fluid }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  fluid?: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.docs-container {
  width: 100%;
  padding: var(--atomic-docs-spacing-sm, 12px);
  margin-right: auto;
  margin-left: auto;
  background: var(--atomic-docs-background-color, white);

  // Default container with max-width
  max-width: 1280px;

  // Fluid container takes full width
  &--fluid {
    max-width: 100%;
  }

  // Responsive padding
  @media (min-width: 960px) {
    padding: var(--atomic-docs-spacing-lg, 24px);
  }
}
</style>
