<template>
  <div class="docs-colors">
    <h2 class="docs-colors-title">
      Color System
    </h2>
    <p class="docs-colors-description">
      These are the colors defined in your design system.
    </p>

    <p v-if="isUsingExtractedColors" class="docs-colors-note">
      <em>Note: Some colors are automatically extracted from CSS variables in your application.</em>
    </p>

    <div class="docs-colors-grid">
      <div
        v-for="(colorItem, index) in colors"
        :key="index"
        class="docs-color-card"
      >
        <div
          class="docs-color-preview"
          :style="{ backgroundColor: colorItem.color }"
        />
        <div class="docs-color-info">
          <div class="docs-color-name">
            {{ colorItem.name }}
          </div>
          <div class="docs-color-value">
            {{ colorItem.color }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onUnmounted } from 'vue';
import { ComponentDocPlugin } from '../types';
import { useExtractedColors } from '../utils/colorExtractor';

// Inject the component doc plugin
const componentDocPlugin = inject<ComponentDocPlugin>('componentDocPlugin');

// Get extracted colors from the DOM and the cleanup function
const { extractedColors, cleanup } = useExtractedColors();

// Call cleanup when component is unmounted
onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});

// Get colors from plugin options or use extracted colors if none provided and autoExtractColors is enabled
const configColors = computed(() => componentDocPlugin?.options?.colors || []);
const shouldExtractColors = computed(() => componentDocPlugin?.options?.autoExtractColors !== false); // Default to true if not specified

const colors = computed(() => {
  // Start with manually configured colors
  let result = [...configColors.value];

  // Add extracted colors if auto-extraction is enabled
  if (shouldExtractColors.value && extractedColors.value.length > 0) {
    result = [...result, ...extractedColors.value];
  }

  return result;
});

// Determine if we're using extracted colors
const isUsingExtractedColors = computed(() =>
  shouldExtractColors.value && extractedColors.value.length > 0
);
</script>

<style scoped lang="scss">
.docs-colors {
  padding: var(--atomic-docs-spacing-lg, 24px);
}

.docs-colors-title {
  font-size: var(--atomic-docs-font-size-xl, 24px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.docs-colors-description {
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.docs-colors-note {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  font-size: var(--atomic-docs-font-size-sm, 14px);
  padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-md, 16px);
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  border-left: 3px solid var(--atomic-docs-primary-color, #1976d2);
}

.docs-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--atomic-docs-spacing-md, 16px);
}

.docs-color-card {
  border-radius: var(--atomic-docs-border-radius-md, 8px);
  overflow: hidden;
  box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
}

.docs-color-preview {
  height: 120px;
  width: 100%;
}

.docs-color-info {
  padding: var(--atomic-docs-spacing-md, 16px);
  background-color: var(--atomic-docs-background-color, white);
}

.docs-color-name {
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-xs, 4px);
}

.docs-color-value {
  font-family: var(--atomic-docs-font-family-mono, monospace);
  font-size: var(--atomic-docs-font-size-sm, 14px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}
</style>
