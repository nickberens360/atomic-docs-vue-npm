<template>
  <span 
    class="docs-icon" 
    :class="[
      size && `docs-icon--size-${size}`,
      color && `docs-icon--color-${color}`
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
.docs-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  user-select: none;
  
  // Size variants
  &--size-18 {
    font-size: 18px;
  }
  
  &--size-small {
    font-size: 16px;
  }
  
  &--size-large {
    font-size: 36px;
  }
  
  &--size-x-large {
    font-size: 48px;
  }
  
  // Color variants
  &--color-primary {
    color: #1976d2;
  }
  
  &--color-error {
    color: #ff5252;
  }
  
  &--color-success {
    color: #4caf50;
  }
  
  &--color-warning {
    color: #fb8c00;
  }
  
  &--color-info {
    color: #2196f3;
  }
}
</style>