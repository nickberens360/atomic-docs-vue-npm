<template>
  <button
    class="atomic-docs-copy-button"
    :title="copied ? 'Copied!' : title || 'Copy to clipboard'"
    @click="copyToClipboard"
  >
    <slot name="icon">
      <DocsIcon :icon="copied ? 'mdi-check' : 'mdi-content-copy'" size="small" />
    </slot>
    <slot name="text">
      <span v-if="showText" class="atomic-docs-copy-text">
        {{ copied ? 'Copied!' : buttonText }}
      </span>
    </slot>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DocsIcon from './DocsIcon.vue';

interface Props {
  /** Text to copy to clipboard */
  text: string;
  /** Button tooltip text */
  title?: string;
  /** Text to display on the button */
  buttonText?: string;
  /** Whether to show text next to the icon */
  showText?: boolean;
  /** Duration in ms to show the copied state */
  copiedDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  buttonText: 'Copy',
  showText: true,
  copiedDuration: 2000,
});

const copied = ref(false);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, props.copiedDuration);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};
</script>

<style scoped lang="scss">
.atomic-docs-copy-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  //background: transparent;
  background-color: var(--atomic-docs-surface-color, #fff);
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: opacity 0.2s, background-color 0.2s;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));

  &:hover {
    background-color: var(--atomic-docs-surface-color, #f5f5f5);
  }
}

.atomic-docs-copy-text {
  font-size: var(--atomic-docs-font-size-sm, 14px);
}
</style>