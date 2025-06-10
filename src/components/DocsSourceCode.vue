<template>
  <div class="docs-source-code">
    <div
      v-if="source"
      class="source-section"
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
import { computed } from 'vue';
// Import Prism.js
import Prism from 'prismjs';
// Import Prism.js CSS theme
import 'prismjs/themes/prism.css';
// Import language support
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';

const props = defineProps({
  source: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'markup',
    validator: (value) => ['markup', 'javascript', 'css'].includes(value)
  }
});

// Computed property for highlighted source
const highlightedSource = computed(() => {
  if (!props.source) return '';
  return Prism.highlight(props.source, Prism.languages[props.language], props.language);
});
</script>

<style scoped lang="scss">
.docs-source-code {
  .source-section pre {
    background-color: var(--atomic-docs-surface-color, #f5f5f5);
    padding: var(--atomic-docs-spacing-md, 16px);
    border-radius: var(--atomic-docs-border-radius-sm, 4px);
    overflow-x: auto;
    margin: 0;
  }

  .source-section code {
    font-family: var(--atomic-docs-font-family-mono, monospace);
    white-space: pre;
    word-break: normal;
  }
}
</style>
