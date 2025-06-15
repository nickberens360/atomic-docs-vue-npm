<template>
  <div class="docs-accordion">
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="docs-accordion__section"
      :class="{
        'docs-accordion__section--below-active': isSectionBelowActive(index),
        'docs-accordion__section--active': activeSection === index
      }"
    >
      <button
        class="docs-accordion__header"
        :class="{ 'docs-accordion__header--active': activeSection === index }"
        @click="toggleSection(index)"
      >
        <span class="docs-accordion__title">{{ section.title }}</span>
        <span class="docs-accordion__icon">
          {{ activeSection === index ? '−' : '+' }}
        </span>
      </button>
      <div
        class="docs-accordion__content"
        :class="{ 'docs-accordion__content--active': activeSection === index }"
      >
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
  defaultSection?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  defaultSection: null
});

const activeSection = ref<number | null>(props.defaultSection);
const slots = useSlots();

// Method to toggle a section
const toggleSection = (index: number) => {
  if (activeSection.value === index) {
    activeSection.value = null; // Close if already open
  } else {
    activeSection.value = index; // Open the clicked section
  }
};

// Check if slots exist for each section
const hasSlotContent = computed(() => {
  return props.sections.map((_, index) => !!slots[`section-${index}`]);
});

// Check if a section is below the active section
const isSectionBelowActive = (index: number) => {
  return activeSection.value !== null && index > activeSection.value;
};

// Set the first section with content as active if no default is provided
onMounted(() => {
  if (activeSection.value === null) {
    const firstSectionWithContent = hasSlotContent.value.findIndex(has => has);
    if (firstSectionWithContent !== -1) {
      activeSection.value = firstSectionWithContent;
    }
  }
});
</script>
<style scoped lang="scss">
.docs-accordion {
  //margin: var(--atomic-docs-spacing-md, 16px) 0;
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

    // Active section should be able to grow
    &--active {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0; // Important for Firefox
    }

    // Sections below active will be sticky to the bottom
    &--below-active {
      position: sticky;
      bottom: 0;
      z-index: 5; // Lower than the active header z-index
      margin-top: auto; // Push to the bottom when there's space
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-sm, 12px);
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
    background-color: var(--atomic-docs-surface-color, #f5f5f5);
    border-radius: var(--atomic-docs-border-radius-sm, 4px);

    &:hover {
      color: var(--atomic-docs-primary-color, #1976d2);
      background-color: var(--atomic-docs-hover-color, rgba(0, 0, 0, 0.04));
    }

    &--active {
      color: var(--atomic-docs-primary-color, #1976d2);
      background-color: var(--atomic-docs-active-color, rgba(0, 0, 0, 0.08));
      position: sticky;
      top: 0;
      z-index: 10;
    }
  }

  &__title {
    font-size: var(--atomic-docs-font-size-xs, 13px);
    font-weight: 500;
    color: inherit;
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
      flex: 1;
      overflow-y: auto; // Make content scrollable
      max-height: none; // Remove the hardcoded height
      height: 100%; // Fill the available space
      padding: var(--atomic-docs-spacing-xs, 4px) var(--atomic-docs-spacing-sm, 12px) var(--atomic-docs-spacing-sm, 8px);
    }
  }
}

@media (max-width: 600px) {
  .docs-accordion {
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