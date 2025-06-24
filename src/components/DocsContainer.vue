<template>
  <div
    class="atomic-docs-container"
    :class="{ 'atomic-docs-container--fluid': fluid }"
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
.atomic-docs-container {
  width: 100%;
  padding: var(--atomic-docs-spacing-sm, 12px);
  margin-right: auto;
  margin-left: auto;
  background: var(--atomic-docs-background-color, white);
  border-radius: var(--atomic-docs-border-radius-lg, 8px);
  //box-shadow: 10px 10px 30px #bebebe,
  //-10px -10px 30px #ffffff;
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
