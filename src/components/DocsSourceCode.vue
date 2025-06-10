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
// Import indent.js for proper code indentation
import { indent } from 'indent.js';

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

  try {
    // Format the source code with proper indentation using indent.js
    let formattedSource = props.source;

    // Apply different formatting based on language
    if (props.language === 'markup') {
      formattedSource = indent.html(props.source, { tabString: '  ' });
    } else if (props.language === 'javascript') {
      formattedSource = indent.js(props.source, { tabString: '  ' });
    } else if (props.language === 'css') {
      formattedSource = indent.css(props.source, { tabString: '  ' });
    }

    // Highlight the formatted source with Prism.js
    return Prism.highlight(formattedSource, Prism.languages[props.language], props.language);
  } catch (error) {
    console.error('Error formatting or highlighting source code:', error);

    // Fall back to highlighting the original source without formatting
    try {
      return Prism.highlight(props.source, Prism.languages[props.language], props.language);
    } catch (fallbackError) {
      console.error('Error highlighting original source code:', fallbackError);
      return props.source; // Return the original source as a last resort
    }
  }
});
</script>

<!--<style scoped lang="scss">
.docs-source-code {
  .source-section pre {
    background-color: var(&#45;&#45;atomic-docs-surface-color, #f5f5f5);
    padding: var(&#45;&#45;atomic-docs-spacing-md, 16px);
    border-radius: var(&#45;&#45;atomic-docs-border-radius-sm, 4px);
    overflow-x: auto;
    margin: 0;
  }

  .source-section code {
    font-family: var(&#45;&#45;atomic-docs-font-family-mono, monospace);
    white-space: pre;
    word-break: normal;
  }
}
</style>-->
