<template>
  <div class="docs-accordion">
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="docs-accordion__section"
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
        <slot :name="`section-${index}`"></slot>
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
  margin: 16px 0;

  &__section {
    margin-bottom: 4px;
    overflow: hidden;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--docs-primary-color, #1976d2);
    }

    &--active {
      color: var(--docs-primary-color, #1976d2);
    }
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: inherit;
  }

  &__icon {
    font-size: 10px;
    color: inherit;
    opacity: 0.7;
  }

  &__content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease;

    &--active {
      max-height: 1000px; // Arbitrary large value
      padding: 4px 12px 8px;
    }
  }
}

@media (max-width: 600px) {
  .docs-accordion {
    &__header {
      padding: 6px 8px;
    }

    &__title {
      font-size: 12px;
    }

    &__content--active {
      padding: 4px 8px 6px;
    }
  }
}
</style>
