<template>
  <div class="docs-colors">
    <h2 class="docs-colors-title">
      Color System
    </h2>
    <p class="docs-colors-description">
      These are the colors defined in your design system.
    </p>

    <!-- Search input -->
    <div class="docs-colors-search">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search by variable name..."
        class="docs-colors-search-input"
      />
    </div>

    <!-- User-defined colors section -->
    <div v-if="filteredConfigColors.length > 0" class="docs-colors-section">
      <h3 class="docs-colors-section-title">User-Defined Colors</h3>
      <div class="docs-colors-grid">
        <div
          v-for="(colorItem, index) in filteredConfigColors"
          :key="'config-' + index"
          class="docs-color-card"
        >
          <div
            class="docs-color-preview"
            :style="{ backgroundColor: colorItem.color }"
          />
          <div class="docs-color-info">
            <div class="docs-color-name">
              {{ colorItem.name }}
              <DocsCopyToClipboard
                :text="colorItem.name"
                title="Copy variable name"
                class="docs-color-copy-btn"
              />
            </div>
            <div class="docs-color-value">
              {{ colorItem.color }}
              <DocsCopyToClipboard
                :text="colorItem.color"
                title="Copy color value"
                class="docs-color-copy-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Automatically extracted colors section -->
    <div v-if="isUsingExtractedColors && filteredExtractedColors.length > 0" class="docs-colors-section">
      <h3 class="docs-colors-section-title">Automatically Extracted Colors</h3>
      <p class="docs-colors-note">
        <em>Note: These colors are automatically extracted from CSS variables in your application.</em>
      </p>
      <div class="docs-colors-grid">
        <div
          v-for="(colorItem, index) in filteredExtractedColors"
          :key="'extracted-' + index"
          class="docs-color-card"
        >
          <div
            class="docs-color-preview"
            :style="{ backgroundColor: colorItem.color }"
          />
          <div class="docs-color-info">
            <div class="docs-color-name">
              {{ colorItem.name }}
              <DocsCopyToClipboard
                :text="colorItem.name"
                title="Copy variable name"
                class="docs-color-copy-btn"
              />
            </div>
            <div class="docs-color-value">
              {{ colorItem.color }}
              <DocsCopyToClipboard
                :text="colorItem.color"
                title="Copy color value"
                class="docs-color-copy-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onUnmounted, ref } from 'vue';
import { ComponentDocPlugin } from '../types';
import { useExtractedColors } from '../utils/colorExtractor';
import DocsCopyToClipboard from './DocsCopyToClipboard.vue';
import DocsIcon from './DocsIcon.vue';

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

// Determine if we're using extracted colors
const isUsingExtractedColors = computed(() =>
  shouldExtractColors.value && extractedColors.value.length > 0
);

// Search functionality
const searchTerm = ref('');

// Improved fuzzy search function
const fuzzyMatch = (text: string, pattern: string): boolean => {
  if (!pattern) return true;

  const lowerText = text.toLowerCase();
  const lowerPattern = pattern.toLowerCase();

  // For short search terms (1-2 chars), require word boundary matches
  if (lowerPattern.length <= 2) {
    // Check if pattern is at the start of the text
    if (lowerText.startsWith(lowerPattern)) {
      return true;
    }

    // Check if pattern appears after a delimiter
    const delimiterPattern = new RegExp(`[-_\\s]${lowerPattern}`, 'i');
    return delimiterPattern.test(lowerText);
  }

  // For longer terms, prioritize word boundaries
  const words = lowerText.split(/[-_\s]/);

  // Check if pattern starts at the beginning of any word
  for (const word of words) {
    if (word.startsWith(lowerPattern)) {
      return true;
    }
  }

  // Fall back to standard fuzzy search with consecutive character bonus
  let patternIdx = 0;
  let textIdx = 0;
  let consecutiveMatches = 0;
  let maxConsecutive = 0;

  while (patternIdx < lowerPattern.length && textIdx < lowerText.length) {
    if (lowerPattern[patternIdx] === lowerText[textIdx]) {
      patternIdx++;
      consecutiveMatches++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
    } else {
      consecutiveMatches = 0;
    }
    textIdx++;
  }

  // Require at least 2 consecutive matches for longer patterns
  return patternIdx === lowerPattern.length && maxConsecutive >= 2;
};

// Filter colors based on search term
const filteredConfigColors = computed(() => {
  if (!searchTerm.value) return configColors.value;
  return configColors.value.filter(color => fuzzyMatch(color.name, searchTerm.value));
});

const filteredExtractedColors = computed(() => {
  if (!searchTerm.value) return extractedColors.value;
  return extractedColors.value.filter(color => fuzzyMatch(color.name, searchTerm.value));
});

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
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.docs-colors-search {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
}

.docs-colors-search-input {
  width: 100%;
  padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-md, 16px);
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  font-size: var(--atomic-docs-font-size-md, 16px);
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  background-color: var(--atomic-docs-background-color, white);
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--atomic-docs-primary-color, #1976d2);
  }
}

.docs-colors-section {
  margin-bottom: var(--atomic-docs-spacing-xl, 32px);
}

.docs-colors-section-title {
  font-size: var(--atomic-docs-font-size-lg, 20px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  padding-bottom: var(--atomic-docs-spacing-xs, 4px);
  border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
}

.docs-colors-note {
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
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

.docs-color-name, .docs-color-value {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.docs-color-copy-btn {
  opacity: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: opacity 0.2s, background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--atomic-docs-surface-color, #f5f5f5);
  }
}

.docs-color-card:hover .docs-color-copy-btn {
  opacity: 1;
}
</style>
