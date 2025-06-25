<template>
  <div class="atomic-docs-markdown">
    <DocsMarkdown :content="readmeContent" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DocsMarkdown from './DocsMarkdown.vue';

// Import the README.md file directly using Vite's feature
import readmeContent from '../../README.md?raw';
</script>
