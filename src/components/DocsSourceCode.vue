<template>
  <div class="atomic-docs-source-code atomic-docs-markdown">
    <div
      v-if="source"
      class="source-section code-block-wrapper"
    >
      <pre><code v-html="highlightedSource" /></pre>
    </div>
    <div
      v-else
      class="source-section"
    >
      <p>No source code available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import Prism from 'prismjs';

const props = defineProps({
  source: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'markup',
    // Add a type check to ensure value is a string before validation
    validator: (value: unknown) =>
      typeof value === 'string' && ['markup', 'javascript', 'css'].includes(value)
  }
});

// Inject the isDark theme state
const isDark = inject<Ref<boolean>>('isDark', ref(false));

// Computed property for highlighted source
const highlightedSource = computed(() => {
  if (!props.source) {
    return '';
  }
  // Check if the language is supported by Prism before highlighting
  if (props.language && Prism.languages[props.language]) {
    return Prism.highlight(props.source, Prism.languages[props.language], props.language);
  }
  // Fallback to un-highlighted source if language is not supported
  return props.source;
});
</script>

<style scoped lang="scss">
.atomic-docs-source-code {
  .source-section {
    margin-bottom: var(--atomic-docs-spacing-md, 16px);
  }
}
</style>