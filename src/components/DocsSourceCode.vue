<template>
  <div class="docs-source-code docs-markdown">
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
/*
 * Styles for code display are now consolidated in DocsMarkdown.vue
 * This component uses those styles for consistency
 */
.docs-source-code {
  .source-section {
    margin-bottom: var(--atomic-docs-spacing-md, 16px);
  }
}
</style>
