<template>
  <div class="typography-view">
    <h2 class="typography-title">Typography System Test</h2>
    <p class="typography-description">
      The following styles are dynamically extracted by parsing your application's loaded stylesheets.
    </p>

    <div v-if="isLoading" class="loading-message">
      <p>Analyzing stylesheets...</p>
    </div>

    <div v-else class="typography-sections">
      <section v-if="typographyData.utilityClasses.length" class="typography-section">
        <h3 class="section-title">Utility Classes</h3>
        <p class="section-subtitle">Classes that apply specific typography styles.</p>
        <div v-for="rule in typographyData.utilityClasses" :key="rule.selector" class="typography-example">
          <p :class="rule.selector.substring(1)" class="element-preview">{{ rule.selector }}</p>
          <div class="details-list">
            <div v-for="(value, key) in rule.styles" :key="key" class="detail-item">
              <span>{{ key }}:</span>
              <code>{{ value }}</code>
            </div>
          </div>
        </div>
      </section>

      <section v-if="Object.keys(typographyData.elementStyles).length" class="typography-section">
        <h3 class="section-title">Base Element Styles</h3>
        <p class="section-subtitle">Default styles applied to common HTML tags.</p>
        <div v-for="tag in sortedElementTags" :key="tag" class="typography-example">
          <component :is="tag" class="element-preview">{{ tag.charAt(0).toUpperCase() + tag.slice(1) }} Default Style</component>
          <div class="details-list">
            <div v-for="(value, key) in typographyData.elementStyles[tag]" :key="key" class="detail-item">
              <span>{{ key }}:</span>
              <code>{{ value }}</code>
            </div>
          </div>
        </div>
      </section>

      <section v-if="Object.keys(typographyData.variables).length" class="typography-section">
        <h3 class="section-title">CSS Variables</h3>
        <p class="section-subtitle">Typography-related custom properties found in your stylesheets.</p>
        <div class="variables-table">
          <div v-for="(value, name) in typographyData.variables" :key="name" class="variable-row">
            <code class="variable-name">{{ name }}</code>
            <code class="variable-value">{{ value }}</code>
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
  // Sort h1-h6 tags numerically, then others alphabetically
  return Object.keys(typographyData.value.elementStyles || {}).sort((a, b) => {
    if (a.startsWith('h') && b.startsWith('h')) return parseInt(a.slice(1)) - parseInt(b.slice(1));
    if (a === 'body') return -1;
    if (b === 'body') return 1;
    return a.localeCompare(b);
  });
});

watch(typographyData, (newData) => {
  if (newData.utilityClasses.length || Object.keys(newData.variables).length || Object.keys(newData.elementStyles).length) {
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
  gap: 48px;
}

.section-title {
  font-size: var(--atomic-docs-font-size-lg, 20px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.typography-example {
  padding: 16px;
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  margin-bottom: 8px;
  overflow-x: auto;
}
.element-preview {
  margin: 0 0 16px 0;
  padding: 0;
}

.details-list {
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: 12px;
  border-radius: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
  span {
    margin-right: 16px;
    color: var(--atomic-docs-text-secondary);
  }
}

.variables-table {
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  overflow: hidden;
}

.variable-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  &:last-child {
    border-bottom: none;
  }
}
.variable-name {
  color: var(--atomic-docs-primary-color, #1976d2);
}
code {
  font-family: var(--atomic-docs-font-family-mono, monospace);
  font-size: 13px;
  background-color: transparent;
  padding: 0;
}
.loading-message {
  padding: var(--atomic-docs-spacing-lg, 24px);
  text-align: center;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  font-style: italic;
}
</style>