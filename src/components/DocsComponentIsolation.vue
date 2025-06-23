<template>
  <div
    ref="componentDom"
    class="atomic-docs-isolation-wrapper"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ComponentDocPlugin } from '../types';

// Inject the plugin to access the configuration
const componentDocPlugin = inject<ComponentDocPlugin>('componentDocPlugin');

// Get the configured font or use a default system font stack if not provided
const componentFont = computed(() => {
  return componentDocPlugin?.options?.componentFont ||
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
});

const componentDom = ref<HTMLElement | null>(null);
</script>

<style scoped lang="scss">
.atomic-docs-isolation-wrapper {
  /* Create a new stacking context */
  position: relative;
  //z-index: 0;

  /* Remove the atomic-docs class influence */
  color: initial;
  font-family: v-bind(componentFont);
  font-size: initial;
  line-height: initial;

  /* Ensure the container takes full width */
  width: 100%;
}
</style>
