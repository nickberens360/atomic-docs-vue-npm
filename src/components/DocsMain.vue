<template>
  <main class="atomic-docs-main">
    <DocsContainer :fluid="fluid">
      <slot />
    </DocsContainer>
  </main>
</template>

<script setup lang="ts">
import DocsContainer from './DocsContainer.vue';

interface Props {
  fluid?: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.atomic-docs-main {
  flex: 1 1 auto;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--atomic-docs-appbar-height));
  padding-top: var(--atomic-docs-appbar-height);
  transition: padding-top 0.2s ease-in-out;

  .atomic-docs-navigation-drawer--open + & {
    padding-left: var(--atomic-docs-drawer-width);
    transition: padding-left 0.3s ease;
  }

  // Adjust for the rail mode
  .atomic-docs-navigation-drawer--rail + & {
    padding-left: var(--atomic-docs-drawer-rail-width);
    transition: padding-left 0.3s ease;
  }
}
</style>
