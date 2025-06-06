<template>
  <div class="docs-text-field" :class="{ 'docs-text-field--solo': variant === 'solo' }">
    <div class="docs-input-wrapper">
      <span v-if="prependInnerIcon" class="docs-prepend-icon">
        <slot name="prepend-inner">
          {{ prependInnerIcon === 'mdi-magnify' ? '🔍' : prependInnerIcon }}
        </slot>
      </span>
      <input
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        class="docs-input"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="$slots['append-inner']" class="docs-append-icon">
        <slot name="append-inner"></slot>
      </span>
    </div>
    <div v-if="!hideDetails" class="docs-details">
      <slot name="details"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string;
  name?: string;
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'solo' | 'underlined' | 'plain';
  prependInnerIcon?: string;
  hideDetails?: boolean;
  autocomplete?: string;
  density?: 'default' | 'comfortable' | 'compact';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outlined',
  hideDetails: false,
  density: 'default'
});

defineEmits(['update:modelValue']);
</script>

<style scoped lang="scss">
.docs-text-field {
  width: 100%;
  margin-bottom: 8px;

  &--solo {
    .docs-input-wrapper {
      background-color: var(--atomic-docs-surface-color, white);
      border-radius: var(--atomic-docs-border-radius-sm, 4px);
      box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }
}

.docs-input-wrapper {
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

.docs-prepend-icon, .docs-append-icon {
  font-size: var(--atomic-docs-font-size-md, 18px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.54));
  display: flex;
  align-items: center;
}

.docs-append-icon {
  cursor: pointer;
}

.docs-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 var(--atomic-docs-spacing-sm, 8px);
  font-size: var(--atomic-docs-font-size-sm, 14px);
  background: transparent;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

.docs-details {
  font-size: var(--atomic-docs-font-size-xs, 12px);
  padding: var(--atomic-docs-spacing-xs, 4px) 0;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}
</style>
