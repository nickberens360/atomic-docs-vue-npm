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
import Prism from 'prismjs';

// 1. Import Prettier and its parsers/plugins
import prettier from 'prettier/standalone';
import * as parserHtml from 'prettier/parser-html';
import * as parserTypeScript from 'prettier/parser-typescript';
import * as parserPostcss from 'prettier/parser-postcss';

// (Prism CSS and language imports would remain here)
import 'prismjs/themes/prism.css';
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

// A map to select the correct Prettier parser and plugin
const prettierOptionsMap = {
  markup: { parser: 'html', plugins: [parserHtml] },
  javascript: {
    parser: 'typescript',
    plugins: [parserTypeScript],
  },
  css: { parser: 'css', plugins: [parserPostcss] },
};

const highlightedSource = computed(() => {
  if (!props.source || typeof props.source !== 'string') return '';

  try {
    // First, try to highlight the source directly without Prettier formatting
    // This ensures we at least get syntax highlighting even if formatting fails
    const highlightedOriginal = Prism.highlight(
      props.source,
      Prism.languages[props.language] || {},
      props.language
    );

    // Then try to format with Prettier in a separate try block
    try {
      // Only attempt Prettier formatting for HTML and CSS
      // Skip JavaScript/TypeScript to avoid the estree plugin error
      if (props.language === 'markup' || props.language === 'css') {
        const options = prettierOptionsMap[props.language];
        if (options) {
          const formattedSource = prettier.format(props.source, {
            ...options,
            semi: false,
            singleQuote: true,
          });

          // If formatting succeeded, highlight the formatted source
          if (typeof formattedSource === 'string') {
            return Prism.highlight(
              formattedSource,
              Prism.languages[props.language] || {},
              props.language
            );
          }
        }
      }

      // If we got here, either:
      // 1. It's JavaScript code (which we're skipping Prettier for)
      // 2. Formatting failed but didn't throw an error
      // 3. The formatted result wasn't a string
      // In all cases, return the already highlighted original source
      return highlightedOriginal;
    } catch (prettierError) {
      console.error('Error formatting with Prettier:', prettierError);
      // Return the already highlighted original source
      return highlightedOriginal;
    }
  } catch (error) {
    console.error('Error highlighting source code:', error);
    // Last resort fallback - return the original source unformatted and unhighlighted
    return props.source;
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
