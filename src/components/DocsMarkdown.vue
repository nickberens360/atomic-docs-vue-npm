<template>
  <div
    class="docs-markdown"
    v-html="renderedContent"
    @click="handleCopyClick"
  />
</template>

<script
  setup
  lang="ts"
>
import {computed} from 'vue';
import MarkdownIt from 'markdown-it';
// Import Prism.js
import Prism from 'prismjs';
// Import Prism.js CSS theme
import 'prismjs/themes/prism.css';
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
        <button class="copy-button" data-code="${encodeURIComponent(code)}">
          <span class="copy-icon">📋</span>
          <span class="copy-text">Copy</span>
        </button>
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

const renderedContent = computed(() => {
  return md.render(props.content);
});

// Handle copy button clicks
const handleCopyClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  // Check if the click was on a copy button or its children
  const copyButton = target.closest('.copy-button');
  if (!copyButton) return;

  // Get the code to copy
  const code = decodeURIComponent(copyButton.getAttribute('data-code') || '');
  if (!code) return;

  // Copy to clipboard
  navigator.clipboard.writeText(code)
    .then(() => {
      // Update button text temporarily
      const copyText = copyButton.querySelector('.copy-text');
      if (copyText) {
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied!';

        // Reset after 2 seconds
        setTimeout(() => {
          copyText.textContent = originalText;
        }, 2000);
      }
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
};
</script>

<style lang="scss">
/* Import CSS variables */
@use '../styles/variables.scss' as *;

/* Main markdown container */
.docs-markdown {
  /* Base typography */
  font-family: var(--atomic-docs-font-family);
  font-size: var(--atomic-docs-font-size-md);
  line-height: 1.5;
  color: var(--atomic-docs-text-primary);

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
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: var(--atomic-docs-text-color-secondary);
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--atomic-docs-border-radius-sm);
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: var(--atomic-docs-primary-color-light);
      color: var(--atomic-docs-primary-color);
    }
  }

  .copy-icon {
    font-size: 1rem;
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
}
</style>
