<template>
  <div class="atomic-docs-typography-view">
    <h2 class="atomic-docs-typography-title">Typography System Test</h2>
    <p class="atomic-docs-typography-description">
      The following styles are dynamically extracted by parsing your application's loaded stylesheets.
    </p>

    <!-- Search input -->
    <div class="atomic-docs-typography-search">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search by class name..."
        class="atomic-docs-typography-search-input"
      />
    </div>

    <div v-if="isLoading" class="atomic-docs-loading-message">
      <p>Analyzing stylesheets...</p>
    </div>

    <div v-else class="atomic-docs-typography-sections">
      <section v-if="Object.keys(groupedUtilityClasses).length" class="atomic-docs-typography-section">
        <h3 class="atomic-docs-section-title">Utility Classes</h3>
        <p class="atomic-docs-section-subtitle">Classes grouped by shared prefixes, sorted by font size.</p>
        <div v-for="(rules, prefix) in groupedUtilityClasses" :key="prefix" class="atomic-docs-typography-group">
          <h4 class="atomic-docs-group-title">{{ prefix }}</h4>
          <div v-for="rule in rules" :key="rule.selector" class="atomic-docs-typography-example">
            <div class="atomic-docs-example-header">
              <p :class="rule.selector.substring(1)" class="atomic-docs-element-preview">
                {{ rule.selector.substring(1) }}
              </p>
              <DocsCopyToClipboard :text="rule.selector.substring(1)" title="Copy class name" />
            </div>
            <div class="atomic-docs-details-list">
              <div v-for="(value, key) in rule.styles" :key="key" class="atomic-docs-detail-item">
                <span class="atomic-docs-type-key">{{ key }}:</span>
                <code class="atomic-docs-type-value">{{ value }}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="filteredElementTags.length" class="atomic-docs-typography-section">
        <h3 class="atomic-docs-section-title">Base Element Styles</h3>
        <p class="atomic-docs-section-subtitle">Default styles applied to common HTML tags.</p>
        <div v-for="tag in filteredElementTags" :key="tag" class="atomic-docs-typography-example">
          <div class="atomic-docs-example-header">
            <component :is="tag" class="atomic-docs-element-preview">{{ tag.charAt(0).toUpperCase() + tag.slice(1) }} Default Style</component>
            <DocsCopyToClipboard :text="tag" title="Copy element tag" />
          </div>
          <div class="atomic-docs-details-list">
            <div v-for="(value, key) in typographyData.elementStyles[tag]" :key="key" class="atomic-docs-detail-item">
              <span class="atomic-docs-type-key">{{ key }}:</span>
              <code class="atomic-docs-type-value">{{ value }}</code>
            </div>
          </div>
        </div>
      </section>

      <section v-if="Object.keys(filteredVariables).length" class="atomic-docs-typography-section">
        <h3 class="atomic-docs-section-title">CSS Variables</h3>
        <p class="atomic-docs-section-subtitle">Typography-related custom properties found in your stylesheets.</p>
        <div class="atomic-docs-variables-table">
          <div v-for="(value, key) in filteredVariables" :key="key" class="atomic-docs-variable-row">
            <span class="atomic-docs-type-key">{{ key }}:</span>
            <code class="atomic-docs-type-value">{{ value }}</code>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useExtractedTypography } from '../utils/typographyExtractor';
import DocsCopyToClipboard from '../components/DocsCopyToClipboard.vue';

const { extractedTypography: typographyData } = useExtractedTypography();
const isLoading = ref(true);

// Search term
const searchTerm = ref('');

// Normalize search term: remove leading '.' if present
const normalizedSearchTerm = computed(() => {
  return searchTerm.value.startsWith('.') ? searchTerm.value.slice(1) : searchTerm.value;
});

// Fuzzy search function
const fuzzyMatch = (text: string, pattern: string): boolean => {
  if (!pattern) return true;

  const lowerText = text.toLowerCase();
  const lowerPattern = pattern.toLowerCase();

  if (lowerPattern.length <= 2) {
    if (lowerText.startsWith(lowerPattern)) return true;
    const delimiterPattern = new RegExp(`[-_\\s]${lowerPattern}`, 'i');
    return delimiterPattern.test(lowerText);
  }

  const words = lowerText.split(/[-_\s]/);
  for (const word of words) {
    if (word.startsWith(lowerPattern)) return true;
  }

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

  return patternIdx === lowerPattern.length && maxConsecutive >= 2;
};

// Filtered utility classes
const filteredUtilityClasses = computed(() => {
  if (!normalizedSearchTerm.value) return typographyData.value.utilityClasses;
  return typographyData.value.utilityClasses.filter(rule => {
    const selector = rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector;
    return fuzzyMatch(selector, normalizedSearchTerm.value);
  });
});

// Group filtered utility classes by shared prefix and sort each group by largest font-size first
const groupedUtilityClasses = computed(() => {
  const groups: Record<string, typeof typographyData.value.utilityClasses> = {};
  const filtered = filteredUtilityClasses.value;

  filtered.forEach((rule) => {
    const className = rule.selector.startsWith('.') ? rule.selector.slice(1) : rule.selector;
    const match = className.match(/^([^-_]+[-_]?)/);
    const prefix = match ? match[1] : 'other';

    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(rule);
  });

  for (const prefix in groups) {
    groups[prefix].sort((a, b) => {
      const sizeA = extractFontSizePx(a.styles['font-size']);
      const sizeB = extractFontSizePx(b.styles['font-size']);
      return sizeB - sizeA;
    });
  }

  return groups;
});

/**
 * Converts a CSS font-size string to a pixel number (approximation).
 * Supports px, rem, em (assuming 16px base), fallback 0.
 */
function extractFontSizePx(fontSize?: string): number {
  if (!fontSize) return 0;

  const match = fontSize.match(/^([\d.]+)(px|rem|em)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'px';

  switch (unit) {
    case 'px':
      return value;
    case 'rem':
    case 'em':
      return value * 16;
    default:
      return 0;
  }
}

// Sorted element tags
const sortedElementTags = computed(() => {
  return Object.keys(typographyData.value.elementStyles || {}).sort((a, b) => {
    if (a.startsWith('h') && b.startsWith('h')) return parseInt(a.slice(1)) - parseInt(b.slice(1));
    if (a === 'body') return -1;
    if (b === 'body') return 1;
    return a.localeCompare(b);
  });
});

// Filtered element tags
const filteredElementTags = computed(() => {
  if (!normalizedSearchTerm.value) return sortedElementTags.value;
  return sortedElementTags.value.filter(tag => fuzzyMatch(tag, normalizedSearchTerm.value));
});

// Filtered variables
const filteredVariables = computed(() => {
  if (!normalizedSearchTerm.value) return typographyData.value.variables;

  const result: Record<string, string> = {};
  Object.entries(typographyData.value.variables).forEach(([key, value]) => {
    if (fuzzyMatch(key, normalizedSearchTerm.value)) result[key] = value;
  });
  return result;
});

// Loading state watcher
watch(typographyData, (newData) => {
  if (newData.utilityClasses.length || Object.keys(newData.variables).length || Object.keys(newData.elementStyles).length) {
    isLoading.value = false;
  }
}, { immediate: true, deep: true });
</script>

<style scoped lang="scss">
.atomic-docs-typography-view {
  width: 100%;
}

.atomic-docs-typography-title {
  font-size: var(--atomic-docs-font-size-xl, 24px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
  padding-bottom: var(--atomic-docs-spacing-sm, 8px);
  border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
}

.atomic-docs-typography-description, .atomic-docs-section-subtitle {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.atomic-docs-typography-search {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
}

.atomic-docs-typography-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--atomic-docs-primary-color, #1976d2);
  }
}

.atomic-docs-section-subtitle {
  margin-top: -16px;
  font-size: 14px;
}

.atomic-docs-typography-sections {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.atomic-docs-section-title {
  font-size: var(--atomic-docs-font-size-lg, 20px);
  font-weight: 500;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.atomic-docs-typography-group {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
}

.atomic-docs-group-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--atomic-docs-primary-color, #1976d2);
}

.atomic-docs-typography-example {
  padding: 16px;
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  margin-bottom: 8px;
  overflow-x: auto;
}

.atomic-docs-example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.atomic-docs-element-preview {
  position: unset;
  display: unset;
  margin: 0;
  padding: 0;
}

.atomic-docs-details-list {
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: 12px;
  border-radius: 4px;
}

.atomic-docs-detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
  span {
    margin-right: 16px;
    color: var(--atomic-docs-text-secondary);
  }
}

.atomic-docs-variables-table {
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  overflow: hidden;
}

.atomic-docs-variable-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  &:last-child {
    border-bottom: none;
  }
}

.atomic-docs-variable-name {
  color: var(--atomic-docs-primary-color, #1976d2);
}

code {
  font-family: var(--atomic-docs-font-family-mono, monospace), sans-serif;
  font-size: 13px;
  background-color: transparent;
  padding: 0;
}

.atomic-docs-loading-message {
  padding: var(--atomic-docs-spacing-lg, 24px);
  text-align: center;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  font-style: italic;
}
</style>
