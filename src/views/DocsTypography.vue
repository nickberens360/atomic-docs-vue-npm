<template>
  <div class="typography-view">
    <h2 class="typography-title">Typography System</h2>
    <p class="typography-description">
      These are the typography styles dynamically extracted from your application's computed styles.
    </p>

    <div v-if="isLoading" class="loading-message">
      <p>Loading and analyzing typography styles...</p>
    </div>

    <div v-else class="typography-sections">
      <section v-if="typographyData['font-family']?.length" class="typography-section">
        <h3 class="section-title">Font Families</h3>
        <div v-for="family in typographyData['font-family']" :key="family" class="typography-example">
          <p :style="{ fontFamily: family }">The quick brown fox jumps over the lazy dog.</p>
          <div class="typography-details">
            <code>{{ family }}</code>
          </div>
        </div>
      </section>

      <section v-if="typographyData['font-size']?.length" class="typography-section">
        <h3 class="section-title">Font Sizes</h3>
        <div v-for="size in sortedFontSizes" :key="size" class="typography-example">
          <p :style="{ fontSize: size }">Font Size Example</p>
          <div class="typography-details">
            <code>{{ size }}</code>
          </div>
        </div>
      </section>

      <section v-if="typographyData['font-weight']?.length" class="typography-section">
        <h3 class="section-title">Font Weights</h3>
        <div v-for="weight in typographyData['font-weight']" :key="weight" class="typography-example">
          <p :style="{ fontWeight: weight }">Font Weight Example</p>
          <div class="typography-details">
            <code>{{ weight }}</code>
          </div>
        </div>
      </section>

      <section v-if="typographyData['line-height']?.length" class="typography-section">
        <h3 class="section-title">Line Heights</h3>
        <div v-for="height in typographyData['line-height']" :key="height" class="typography-example">
          <div :style="{ lineHeight: height }" class="line-height-box">
            <p>This text demonstrates a line height of {{ height }}. The quick brown fox jumps over the lazy dog, showing how lines of text are spaced vertically.</p>
          </div>
          <div class="typography-details">
            <code>{{ height }}</code>
          </div>
        </div>
      </section>

      <section v-if="typographyData['letter-spacing']?.length" class="typography-section">
        <h3 class="section-title">Letter Spacing</h3>
        <div v-for="spacing in typographyData['letter-spacing']" :key="spacing" class="typography-example">
          <p :style="{ letterSpacing: spacing }">Letter Spacing Example</p>
          <div class="typography-details">
            <code>{{ spacing }}</code>
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

// Computed property to sort font sizes from largest to smallest for display
const sortedFontSizes = computed(() => {
  const sizes = typographyData.value['font-size'];
  if (!sizes) return [];
  // Sort values numerically, parsing out units like 'px' or 'rem'
  return [...sizes].sort((a, b) => {
    const valA = parseFloat(a);
    const valB = parseFloat(b);
    return valB - valA;
  });
});

// Watch for the data to be loaded to turn off the loading indicator
watch(typographyData, (newData) => {
  if (Object.values(newData).some(arr => arr.length > 0)) {
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

.typography-description {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.typography-sections {
  display: flex;
  flex-direction: column;
  gap: var(--atomic-docs-spacing-xl, 32px);
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

  p {
    margin: 0;
    padding: 0;
  }
}

.typography-details {
  margin-top: var(--atomic-docs-spacing-sm, 8px);
  font-size: var(--atomic-docs-font-size-sm, 14px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: var(--atomic-docs-spacing-xs, 4px) var(--atomic-docs-spacing-sm, 8px);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  display: inline-block;
}

code {
  font-family: var(--atomic-docs-font-family-mono, monospace);
}

.line-height-box {
  background-color: var(--atomic-docs-primary-color-light, rgba(25, 118, 210, 0.1));
  outline: 1px dashed var(--atomic-docs-primary-color, #1976d2);
  padding: var(--atomic-docs-spacing-xs);
}

.loading-message {
  padding: var(--atomic-docs-spacing-lg, 24px);
  text-align: center;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  font-style: italic;
}
</style>