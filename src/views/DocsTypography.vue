<template>
  <div class="typography-view">
    <h2 class="typography-title">Typography System Test</h2>
    <p class="typography-description">
      The following styles are dynamically extracted by parsing your application's loaded stylesheets.
    </p>

    <!-- Search input -->
    <div class="typography-search">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search by class name..."
        class="typography-search-input"
      />
    </div>

    <div v-if="isLoading" class="loading-message">
      <p>Analyzing stylesheets...</p>
    </div>

    <div v-else class="typography-sections">
      <section v-if="Object.keys(groupedUtilityClasses).length" class="typography-section">
        <h3 class="section-title">Utility Classes</h3>
        <p class="section-subtitle">Classes grouped by shared prefixes.</p>
        <div v-for="(rules, prefix) in groupedUtilityClasses" :key="prefix" class="typography-group">
          <h4 class="group-title">{{ prefix }}</h4>
          <div v-for="rule in rules" :key="rule.selector" class="typography-example">
            <p :class="rule.selector.substring(1)" class="element-preview">{{ rule.selector }}</p>
            <div class="details-list">
              <div v-for="(value, key) in rule.styles" :key="key" class="detail-item">
                <span class="atomic-docs-type-key">{{ key }}:</span>
                <code class="atomic-docs-type-value">{{ value }}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="filteredElementTags.length" class="typography-section">
        <h3 class="section-title">Base Element Styles</h3>
        <p class="section-subtitle">Default styles applied to common HTML tags.</p>
        <div v-for="tag in filteredElementTags" :key="tag" class="typography-example">
          <component :is="tag" class="element-preview">{{ tag.charAt(0).toUpperCase() + tag.slice(1) }} Default Style</component>
          <div class="details-list">
            <div v-for="(value, key) in typographyData.elementStyles[tag]" :key="key" class="detail-item">
              <span class="atomic-docs-type-key">{{ key }}:</span>
              <code class="atomic-docs-type-value">{{ value }}</code>
            </div>
          </div>
        </div>
      </section>

      <section v-if="Object.keys(filteredVariables).length" class="typography-section">
        <h3 class="section-title">CSS Variables</h3>
        <p class="section-subtitle">Typography-related custom properties found in your stylesheets.</p>
        <div class="variables-table">
          <div v-for="(value, key) in filteredVariables" :key="key" class="variable-row">
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

const { extractedTypography: typographyData } = useExtractedTypography();
const isLoading = ref(true);

// Search term
const searchTerm = ref('');

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
  if (!searchTerm.value) return typographyData.value.utilityClasses;
  return typographyData.value.utilityClasses.filter(rule =>
    fuzzyMatch(rule.selector, searchTerm.value)
  );
});

// Group filtered utility classes by shared prefix
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

  return groups;
});

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
  if (!searchTerm.value) return sortedElementTags.value;
  return sortedElementTags.value.filter(tag => fuzzyMatch(tag, searchTerm.value));
});

// Filtered variables
const filteredVariables = computed(() => {
  if (!searchTerm.value) return typographyData.value.variables;

  const result: Record<string, string> = {};
  Object.entries(typographyData.value.variables).forEach(([key, value]) => {
    if (fuzzyMatch(key, searchTerm.value)) result[key] = value;
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

.typography-search {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
}

.typography-search-input {
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

.typography-group {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--atomic-docs-primary-color, #1976d2);
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
  font-family: var(--atomic-docs-font-family-mono, monospace), sans-serif;
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
