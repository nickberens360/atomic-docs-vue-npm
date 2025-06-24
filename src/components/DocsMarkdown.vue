<template>
  <div
    class="atomic-docs-markdown"
    v-html="renderedContent"
  />
</template>

<script
  setup
  lang="ts"
>
import {computed, onMounted, createApp, h} from 'vue';
import MarkdownIt from 'markdown-it';
// Import Prism.js
import Prism from 'prismjs';
// Import theme loader utility instead of static Prism theme
import { initPrismTheme } from '../utils/themeLoader';
import DocsCopyToClipboard from './DocsCopyToClipboard.vue';
// Import language support
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

// Create a custom markdown-it-prism plugin
const markdownItPrism = (md) => {
  const highlight = md.options.highlight;

  md.options.highlight = (str, lang) => {
    // If a language is specified and Prism has it, use Prism for highlighting
    if (lang && Prism.languages[lang]) {
      try {
        return Prism.highlight(str, Prism.languages[lang], lang);
      } catch (err) {
        console.error('Prism highlighting error:', err);
      }
    }

    // Fall back to original highlight function if available
    return highlight ? highlight(str, lang) : str;
  };
};

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    // This will be overridden by our plugin, but we need it here for TypeScript
    return str;
  }
});

// Apply our custom Prism plugin
markdownItPrism(md);

// Customize the renderer to add copy buttons to code blocks
const originalFence = md.renderer.rules.fence!;
md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
  const token = tokens[idx];
  const code = token.content.trim();
  const language = token.info || '';

  // Get the original rendered HTML
  const originalRendered = originalFence(tokens, idx, options, env, slf);

  // Add a copy button to the code block
  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        ${language ? `<span class="code-language">${language}</span>` : ''}
        <div class="copy-button-wrapper" data-code="${encodeURIComponent(code)}"></div>
      </div>
      ${originalRendered}
    </div>
  `;
};

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

// Initialize Prism theme with default light theme
// The MutationObserver in initPrismTheme will handle theme changes
initPrismTheme(false);

const renderedContent = computed(() => {
  return md.render(props.content);
});

// Mount DocsCopyToClipboard components after the content is rendered
onMounted(() => {
  // Wait for the next tick to ensure the content is rendered
  setTimeout(() => {
    // Find all copy button wrappers
    const copyButtonWrappers = document.querySelectorAll('.copy-button-wrapper');

    // Mount a DocsCopyToClipboard component in each wrapper
    copyButtonWrappers.forEach(wrapper => {
      const code = decodeURIComponent(wrapper.getAttribute('data-code') || '');
      if (!code) return;

      // Create a new instance of DocsCopyToClipboard
      const app = createApp({
        render() {
          return h(DocsCopyToClipboard, {
            text: code,
            title: 'Copy code',
            showText: true,
            buttonText: 'Copy',
            class: 'copy-button'
          });
        }
      });

      // Mount the component
      app.component('DocsCopyToClipboard', DocsCopyToClipboard);
      app.mount(wrapper);
    });
  }, 0);
});
</script>

<style lang="scss">
/* Import CSS variables */
@use '../styles/variables.scss' as *;

/* Main markdown container */
.atomic-docs-markdown {
  /* Base typography */
  font-family: var(--atomic-docs-font-family);
  font-size: var(--atomic-docs-font-size-md);
  line-height: 1.5;
  //color: var(--atomic-docs-text-primary);

  /* Headings */
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  h2 {
    font-size: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  h3 {
    font-size: 1.25rem;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  /* Paragraphs */
  p {
    margin-bottom: 1rem;
  }

  /* Links */
  a {
    color: var(--atomic-docs-primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  /* Lists */
  ul, ol {
    padding-left: 2rem;
    margin-bottom: 1rem;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
  }

  th, td {
    border: 1px solid var(--atomic-docs-border-color);
    padding: var(--atomic-docs-spacing-sm);
    text-align: left;
  }

  th {
    background-color: var(--atomic-docs-surface-color);
    font-weight: 500;
  }

  /* Blockquotes */
  blockquote {
    border-left: 4px solid var(--atomic-docs-primary-color);
    padding-left: 1rem;
    margin-left: 0;
    color: var(--atomic-docs-text-color-secondary);
  }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1px solid var(--atomic-docs-border-color);
    margin: 1.5rem 0;
  }

  /* Code blocks and inline code */
  code {
    background-color: var(--atomic-docs-surface-color);
    padding: 0.2rem 0.4rem;
    border-radius: var(--atomic-docs-border-radius-sm);
    font-family: var(--atomic-docs-font-family-mono);
  }

  .code-block-wrapper {
    position: relative;
    margin-bottom: 1rem;
  }

  .code-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--atomic-docs-surface-color-dark);
    padding: 0.5rem var(--atomic-docs-spacing-md);
    border-top-left-radius: var(--atomic-docs-border-radius-sm);
    border-top-right-radius: var(--atomic-docs-border-radius-sm);
    font-family: var(--atomic-docs-font-family-mono);
    font-size: 0.85rem;
  }

  .code-language {
    color: var(--atomic-docs-text-color-secondary);
    font-weight: 500;
  }

  .copy-button {
    /* Styles are now handled by the DocsCopyToClipboard component */
    margin-left: auto;
  }

  .copy-button-wrapper {
    margin-left: auto;
  }

  pre {
    background-color: var(--atomic-docs-surface-color);
    padding: var(--atomic-docs-spacing-md);
    border-radius: 0 0 var(--atomic-docs-border-radius-sm) var(--atomic-docs-border-radius-sm);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    overflow-x: auto;
    margin-top: 0;
    margin-bottom: 0;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Override Prism.js text shadow in dark mode */
  .atomic-docs-app-theme--dark & {
    pre, code {
      text-shadow: none !important;
    }
  }
}
</style>
