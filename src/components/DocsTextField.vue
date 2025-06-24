<template>
  <div
    class="atomic-docs-text-field"
    :class="{ 'atomic-docs-text-field--solo': variant === 'solo' }"
    :style="{ backgroundColor: mappedBgColor }"
  >
    <div class="atomic-docs-input-wrapper">
      <span v-if="prependInnerIcon" class="atomic-docs-prepend-icon">
        <slot name="prepend-inner">
          {{ prependInnerIcon === 'mdi-magnify' ? '🔍' : prependInnerIcon }}
        </slot>
      </span>
      <input
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        class="atomic-docs-input"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="$slots['append-inner']" class="atomic-docs-append-icon">
        <slot name="append-inner"></slot>
      </span>
    </div>
    <div v-if="!hideDetails" class="atomic-docs-details">
      <slot name="details"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string;
  name?: string;
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain';
  prependInnerIcon?: string;
  hideDetails?: boolean;
  autocomplete?: string;
  density?: 'default' | 'comfortable' | 'compact';
  bgColor?: 'background' | 'surface' | 'surface-dark' | false;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outlined',
  hideDetails: false,
  density: 'default',
  bgColor: false
});

const mappedBgColor = computed(() => {
  if (props.bgColor === false) return 'transparent';
  if (props.bgColor === 'background') return 'var(--atomic-docs-background-color)';
  if (props.bgColor === 'surface') return 'var(--atomic-docs-surface-color)';
  if (props.bgColor === 'surface-dark') return 'var(--atomic-docs-surface-color-dark)';
});

defineEmits(['update:modelValue']);
</script>

<style scoped lang="scss">
.atomic-docs-text-field {
  width: 100%;
  margin-bottom: 8px;

  &--solo {
    .atomic-docs-input-wrapper {
      background-color: var(--atomic-docs-surface-color, white);
      border-radius: var(--atomic-docs-border-radius-sm, 4px);
      box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }
}

.atomic-docs-input-wrapper {
  display: flex;
  align-items: center;
  padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-sm, 12px);
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.23));
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--atomic-docs-primary-color, #1976d2);
  }
}

.atomic-docs-prepend-icon, .atomic-docs-append-icon {
  font-size: var(--atomic-docs-font-size-md, 18px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.54));
  display: flex;
  align-items: center;
}

.atomic-docs-append-icon {
  cursor: pointer;
}

.atomic-docs-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 var(--atomic-docs-spacing-sm, 8px);
  font-size: var(--atomic-docs-font-size-sm, 14px);
  background: transparent;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

.atomic-docs-details {
  font-size: var(--atomic-docs-font-size-xs, 12px);
  padding: var(--atomic-docs-spacing-xs, 4px) 0;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}
</style>
