<template>
  <div class="atomic-docs-accordion">
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="atomic-docs-accordion__section"
      :class="{
        'atomic-docs-accordion__section--below-active': isSectionBelowActive(index),
        'atomic-docs-accordion__section--active': modelValue === index // Use modelValue
      }"
    >
      <button
        class="atomic-docs-accordion__header"
        @click="toggleSection(index)"
      >
        <span class="atomic-docs-accordion__icon">
          {{ modelValue === index ? '−' : '+' }} </span>
        <span class="atomic-docs-accordion__title">{{ section.title }}</span>
      </button>
      <div
        class="atomic-docs-accordion__content"
        :class="{ 'atomic-docs-accordion__content--active': modelValue === index }" >
        <slot :name="`section-${index}`" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, useSlots, computed } from 'vue';

interface Section {
  title: string;
}

interface Props {
  sections: Section[];
  modelValue?: number | null; // Changed to modelValue
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
});

const emit = defineEmits(['update:modelValue']); // Emit update:modelValue

const slots = useSlots();

// Method to toggle a section
const toggleSection = (index: number) => {
  if (props.modelValue === index) {
    emit('update:modelValue', null); // Close if already open
  } else {
    emit('update:modelValue', index); // Open the clicked section
  }
};

// Check if slots exist for each section
const hasSlotContent = computed(() => {
  return props.sections.map((_, index) => !!slots[`section-${index}`]);
});

// Check if a section is below the active section
const isSectionBelowActive = (index: number) => {
  return props.modelValue !== null && index > props.modelValue;
};

// No longer automatically opening the first section by default
onMounted(() => {
  // If a specific default section is provided via modelValue, use it
  if (props.modelValue !== null) {
    // Validate that the section exists and has content
    if (props.modelValue < props.sections.length &&
      hasSlotContent.value[props.modelValue]) {
      // Keep the specified default section
    } else {
      // Invalid default section, reset to null (all closed)
      emit('update:modelValue', null);
    }
  }
});
</script>
<style scoped lang="scss">
.atomic-docs-accordion {
  position: absolute;
  height: 100%;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;

  &__section {
    margin-bottom: var(--atomic-docs-spacing-xs, 4px);
    overflow: hidden;
    //background-color: var(--atomic-docs-background-color, #fff);
    border-radius: var(--atomic-docs-border-radius-md, 8px);

    // Active section should be able to grow
    &--active {
      display: flex;
      flex-direction: column;
      //flex: 1;
      min-height: 0; // Important for Firefox
    }

    // Sections below active with normal behavior
    &--below-active {
      position: relative;
      z-index: 5; // Lower than the active header z-index
    }
  }

  &__header {
    display: flex;
    justify-content: start;
    align-items: center;
    width: 100%;
    padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-sm, 12px);
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
    //background-color: var(--atomic-docs-surface-color, #f5f5f5);
    background-color: transparent;
    border-radius: var(--atomic-docs-border-radius-sm, 4px);

    &:hover {
      color: var(--atomic-docs-primary-color, #1976d2);
    }

    &--active {
      color: var(--atomic-docs-primary-color, #1976d2);
      //background-color: var(--atomic-docs-active-color, rgba(0, 0, 0, 0.08));
      position: sticky;
      top: 0;
      z-index: 10;
    }
  }

  &__title {
    font-size: var(--atomic-docs-font-size-md, 13px);
    font-weight: 500;
    color: inherit;
    margin-left: var(--atomic-docs-spacing-xs, 4px);
  }

  &__icon {
    font-size: var(--atomic-docs-font-size-xs, 10px);
    color: inherit;
    opacity: 0.7;
  }

  &__content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease, flex 0.2s ease;

    &--active {
      //flex: 1;
      overflow-y: auto; // Make content scrollable
      max-height: none; // Remove the hardcoded height
      height: 100%; // Fill the available space
      //padding: var(--atomic-docs-spacing-xs, 4px) var(--atomic-docs-spacing-sm, 12px) var(--atomic-docs-spacing-sm, 8px);
    }
  }
}

/* Dark mode specific styles */
:global(.atomic-docs.atomic-docs-app-theme--dark) {
  .atomic-docs-accordion {
    &__header {
      &--active {
        /* Lighter background for better contrast in dark mode */
        background-color: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

@media (max-width: 600px) {
  .atomic-docs-accordion {
    &__header {
      padding: 6px var(--atomic-docs-spacing-sm, 8px);
    }

    &__title {
      font-size: var(--atomic-docs-font-size-xs, 12px);
    }

    &__content--active {
      padding: var(--atomic-docs-spacing-xs, 4px) var(--atomic-docs-spacing-sm, 8px) 6px;
    }
  }
}
</style>