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
import { computed, inject, ref } from 'vue'; // Removed watch, onUnmounted
// Import Prism.js
import Prism from 'prismjs';
// Import Vue language support
import '../utils/prism-vue.js';
// Removed 'initPrismTheme' import as it's no longer used

const props = defineProps({
  source: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'markup',
    validator: (value) => ['markup', 'javascript', 'css', 'vue'].includes(value)
  }
});

// Inject the isDark theme state (still available if needed for other component styling)
const isDark = inject<Ref<boolean>>('isDark', ref(false));

// Removed activeThemeStylesheet ref and watch/onUnmounted logic

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
.atomic-docs-source-code {
  .source-section {
    margin-bottom: var(--atomic-docs-spacing-md, 16px);
  }
}
</style>
