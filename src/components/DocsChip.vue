<template>
  <div
    class="atomic-docs-chip"
    :class="[
      `atomic-docs-chip--${size}`,
      {
        'atomic-docs-chip--flat': variant === 'flat',
        'atomic-docs-chip--rounded': rounded,
        'atomic-docs-chip--label': label
      }
    ]"
    :style="{
      backgroundColor: color ? color : undefined,
      width: width
    }"
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  color?: string;
  variant?: 'flat' | 'outlined' | 'elevated';
  size?: 'small' | 'default' | 'large';
  rounded?: boolean;
  label?: boolean;
  width?: string;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.atomic-docs-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 32px;
  font-size: 14px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;

  &--small {
    height: 24px;
    font-size: 12px;
    padding: 0 8px;
  }

  &--large {
    height: 40px;
    font-size: 16px;
    padding: 0 16px;
  }

  &--flat {
    box-shadow: none;
  }

  &--rounded {
    border-radius: 9999px;
  }

  &--label {
    border-radius: 4px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.12);
  }
}
</style>