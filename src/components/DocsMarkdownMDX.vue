<template>
  <MDXProvider>
    <component :is="mdxComponent" />
  </MDXProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MDXProvider from './MDXProvider.vue';

const props = defineProps({
  content: {
    type: Object, // This would be an imported MDX component
    required: true
  }
});

const mdxComponent = computed(() => props.content);
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
    margin-left: auto;
  }

  pre {
    background-color: var(--atomic-docs-surface-color);
    padding: var(--atomic-docs-spacing-md);
    border-radius: 0 0 var(--atomic-docs-border-radius-sm) var(--atomic-docs-border-radius-sm);
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