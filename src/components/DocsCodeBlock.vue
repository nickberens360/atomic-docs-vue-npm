<template>
  <div class="code-block-wrapper">
    <div class="code-block-header">
      <span v-if="language" class="code-language">{{ language }}</span>
      <DocsCopyToClipboard
        :text="code"
        title="Copy code"
        show-text
        button-text="Copy"
        class="copy-button"
      />
    </div>
    <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Prism from 'prismjs';
import DocsCopyToClipboard from './DocsCopyToClipboard.vue';

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: ''
  }
});

const highlightedCode = computed(() => {
  if (props.language && Prism.languages[props.language]) {
    return Prism.highlight(props.code, Prism.languages[props.language], props.language);
  }
  return props.code;
});
</script>

<style lang="scss">
/* Styles are inherited from DocsMarkdown.vue */
</style>