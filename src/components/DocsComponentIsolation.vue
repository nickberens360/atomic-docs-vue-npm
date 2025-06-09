<template>
  <div
    ref="wrapperRef"
    class="component-isolation-wrapper"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ComponentDocPlugin } from '../types';

const componentDocPlugin = inject<ComponentDocPlugin>('componentDocPlugin');
const wrapperRef = ref<HTMLElement>();
let observer: MutationObserver | null = null;

const emit = defineEmits<{
  domChanged: []
}>();

const componentFont = computed(() => {
  return componentDocPlugin?.options?.componentFont ||
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
});

const handleDomChange = () => {
  emit('domChanged');
};

onMounted(async () => {
  await nextTick(); // Wait for slot content to render
  handleDomChange();
  if (wrapperRef.value) {
    observer = new MutationObserver(() => {
      handleDomChange();
    });
    observer.observe(wrapperRef.value, {
      childList: true,    // Watch for added/removed children
      subtree: true,      // Watch all descendants
      attributes: true,   // Watch attribute changes (optional)
      characterData: true // Watch text content changes (optional)
    });
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped lang="scss">
.component-isolation-wrapper {
  /* Create a new stacking context */
  position: relative;
  z-index: 0;

  /* Remove the atomic-docs class influence */
  color: initial;
  font-family: v-bind(componentFont);
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