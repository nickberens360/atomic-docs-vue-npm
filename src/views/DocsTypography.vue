<template>
  <div class="typography-view">
    <h2 class="typography-title">Typography System</h2>
    <p class="typography-description">
      The following typography styles are dynamically extracted from your application's rendered elements and their computed styles.
    </p>

    <div v-if="isLoading" class="loading-message">
      <p>Loading and analyzing typography styles...</p>
    </div>

    <div v-else class="typography-sections">
      <section class="typography-section">
        <h3 class="section-title">Element Styles</h3>
        <p class="section-subtitle">Styles applied to common HTML tags.</p>
        <div v-for="tag in sortedElementTags" :key="tag" class="typography-example">
          <component :is="tag" class="element-preview">
            {{ tag.charAt(0).toUpperCase() + tag.slice(1) }} Heading
          </component>
          <div class="typography-details-grid">
            <div class="detail-item">
              <strong>Size:</strong> <code>{{ typographyData.elementStyles[tag]['font-size'] }}</code>
            </div>
            <div class="detail-item">
              <strong>Weight:</strong> <code>{{ typographyData.elementStyles[tag]['font-weight'] }}</code>
            </div>
            <div class="detail-item">
              <strong>Line Height:</strong> <code>{{ typographyData.elementStyles[tag]['line-height'] }}</code>
            </div>
            <div class="detail-item full-width">
              <strong>Font Family:</strong> <code>{{ typographyData.elementStyles[tag]['font-family'] }}</code>
            </div>
          </div>
        </div>
      </section>

      <section v-if="typographyData.scales['font-size']?.size" class="typography-section">
        <h3 class="section-title">Typography Scales</h3>
        <p class="section-subtitle">All unique typography values found in the application.</p>
        <div v-for="size in sortedFontSizes" :key="size" class="typography-example">
          <p :style="{ fontSize: size }">Font Size</p>
          <div class="typography-details">
            <code>{{ size }}</code>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useExtractedTypography } from '../utils/typographyExtractor';

const { extractedTypography: typographyData } = useExtractedTypography();
const isLoading = ref(true);

const sortedElementTags = computed(() => {
  return Object.keys(typographyData.value.elementStyles || {}).sort((a, b) => {
    if (a.startsWith('h') && b.startsWith('h')) {
      return parseInt(a.slice(1)) - parseInt(b.slice(1));
    }
    return a.localeCompare(b);
  });
});

const sortedFontSizes = computed(() => {
  const sizes = typographyData.value.scales?.['font-size'];
  if (!sizes) return [];
  return [...sizes].sort((a, b) => parseFloat(b) - parseFloat(a));
});

watch(typographyData, (newData) => {
  if (Object.keys(newData.elementStyles || {}).length > 0 || Object.keys(newData.scales || {}).length > 0) {
    isLoading.value = false;
  }
}, { immediate: true, deep: true });
</script>

<style scoped lang="scss">
.typography-view {
  width: 100%;
}

.typography-title {
  font-size: var(--atomic-docs-font-size-xl, 24px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
  padding-bottom: var(--atomic-docs-spacing-sm, 8px);
  border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
}

.typography-description, .section-subtitle {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}
.section-subtitle {
  margin-top: -16px;
  font-size: 14px;
}

.typography-sections {
  display: flex;
  flex-direction: column;
  gap: var(--atomic-docs-spacing-xl, 48px);
}

.section-title {
  font-size: var(--atomic-docs-font-size-lg, 20px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.typography-example {
  padding: var(--atomic-docs-spacing-md, 16px);
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  margin-bottom: var(--atomic-docs-spacing-sm, 8px);
  overflow-x: auto;
}

.element-preview {
  margin: 0 0 16px 0;
  padding: 0;
}

.typography-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px 16px;
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: var(--atomic-docs-spacing-sm, 8px);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
}

.detail-item {
  font-size: 14px;
  &.full-width {
    grid-column: 1 / -1;
  }
}

.typography-details {
  margin-top: var(--atomic-docs-spacing-sm, 8px);
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: var(--atomic-docs-spacing-xs, 4px) var(--atomic-docs-spacing-sm, 8px);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  display: inline-block;
}

code {
  font-family: var(--atomic-docs-font-family-mono, monospace);
  font-size: 13px;
}

.loading-message {
  padding: var(--atomic-docs-spacing-lg, 24px);
  text-align: center;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  font-style: italic;
}
</style>