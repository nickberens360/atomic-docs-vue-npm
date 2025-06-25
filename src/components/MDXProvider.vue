<template>
  <slot></slot>
</template>

<script setup>
import { provide, h } from 'vue';
import DocsCodeBlock from './DocsCodeBlock.vue';

// Define the components that will be available in MDX files
const mdxComponents = {
  // Map markdown elements to custom components
  pre: (props, children) => {
    // For code blocks, extract code and language
    if (children && children.type === 'code') {
      const { className, children: codeContent } = children.props;
      const language = className ? className.replace('language-', '') : '';

      return h(DocsCodeBlock, {
        code: codeContent,
        language
      });
    }
    // Default pre rendering
    return h('pre', props, children);
  },
  // Add other component mappings as needed
};

// Provide the components to be used by MDX
provide('mdxComponents', mdxComponents);
</script>
