<template>
  <div class="docs-markdown" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

const renderedContent = computed(() => {
  return md.render(props.content);
});
</script>

<style scoped>
.docs-markdown {
  max-width: 900px;
  margin: 0 auto;
}

.docs-markdown :deep(h1) {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.docs-markdown :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.docs-markdown :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.docs-markdown :deep(p) {
  margin-bottom: 1rem;
}

.docs-markdown :deep(code) {
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: var(--atomic-docs-font-family-mono, monospace);
}

.docs-markdown :deep(pre) {
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
  padding: var(--atomic-docs-spacing-md, 16px);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  overflow-x: auto;
  margin-bottom: 1rem;
}

.docs-markdown :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.docs-markdown :deep(a) {
  color: var(--atomic-docs-primary-color, #1976d2);
  text-decoration: none;
}

.docs-markdown :deep(a:hover) {
  text-decoration: underline;
}

.docs-markdown :deep(ul), .docs-markdown :deep(ol) {
  padding-left: 2rem;
  margin-bottom: 1rem;
}

.docs-markdown :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
}

.docs-markdown :deep(th), .docs-markdown :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.docs-markdown :deep(th) {
  background-color: var(--atomic-docs-surface-color, #f5f5f5);
}

.docs-markdown :deep(blockquote) {
  border-left: 4px solid var(--atomic-docs-primary-color, #1976d2);
  padding-left: 1rem;
  margin-left: 0;
  color: #666;
}

.docs-markdown :deep(hr) {
  border: none;
  border-top: 1px solid #ddd;
  margin: 1.5rem 0;
}
</style>