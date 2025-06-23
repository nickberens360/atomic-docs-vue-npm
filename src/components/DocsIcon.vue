<template>
  <span
    class="atomic-docs-icon"
    :class="[
      size && `atomic-docs-icon--size-${size}`,
      color && `atomic-docs-icon--color-${color}`
    ]"
    @click="$emit('click', $event)"
  >
    <slot>
      {{ getIconContent(icon) }}
    </slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  icon?: string;
  size?: string | number;
  color?: string;
}

const props = defineProps<Props>();

defineEmits(['click']);

// Function to map Material Design Icons to Unicode/emoji equivalents
function getIconContent(iconName?: string): string {
  if (!iconName) return '';

  // Map of common MDI icons to Unicode/emoji equivalents
  const iconMap: Record<string, string> = {
    'mdi-content-copy': '📑', // Use '📋', '⎘', or your preferred emoji here
    'mdi-close': '✕',
    'mdi-magnify': '🔍',
    'mdi-check': '✓',
    'mdi-alert': '⚠️',
    'mdi-information': 'ℹ️',
    'mdi-plus': '+',
    'mdi-minus': '-',
    'mdi-chevron-up': '▲',
    'mdi-chevron-down': '▼',
    'mdi-chevron-left': '◀',
    'mdi-chevron-right': '▶',
    'mdi-menu': '☰',
    'mdi-home': '🏠',
    'mdi-account': '👤',
    'mdi-cog': '⚙️',
    'mdi-delete': '🗑️',
    'mdi-pencil': '✏️',
    'mdi-eye': '👁️',
    'mdi-eye-off': '👁️‍🗨️',
    'mdi-refresh': '🔄',
    'mdi-download': '⬇️',
    'mdi-upload': '⬆️',
    'mdi-moon-waning-crescent': '🌙',
    'mdi-white-balance-sunny': '☀️'
  };

  return iconMap[iconName] || iconName;
}
</script>

<style scoped lang="scss">
.atomic-docs-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--atomic-docs-font-size-md, 18px);
  width: 1em;
  height: 1em;
  vertical-align: middle;
  user-select: none;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));

  // Size variants
  &--size-18 {
    font-size: var(--atomic-docs-font-size-md, 18px);
  }

  &--size-small {
    font-size: var(--atomic-docs-font-size-sm, 16px);
  }

  &--size-large {
    font-size: var(--atomic-docs-font-size-xl, 36px);
  }

  &--size-x-large {
    font-size: 48px;
  }

  // Color variants
  &--color-primary {
    color: var(--atomic-docs-primary-color, #1976d2);
  }

  &--color-error {
    color: var(--atomic-docs-error-color, #ff5252);
  }

  &--color-success {
    color: var(--atomic-docs-success-color, #4caf50);
  }

  &--color-warning {
    color: var(--atomic-docs-warning-color, #fb8c00);
  }

  &--color-info {
    color: var(--atomic-docs-info-color, #2196f3);
  }
}
</style>