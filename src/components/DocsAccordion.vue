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
          {{ activeSection === index ? '▼' : '▶' }}
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
  margin: 24px 0;

  &__section {
    margin-bottom: 8px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    background-color: #f5f5f5;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #e0e0e0;
    }
    
    &--active {
      background-color: #e0e0e0;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.87);
  }

  &__icon {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
  }

  &__content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    
    &--active {
      max-height: 1000px; // Arbitrary large value
      padding: 16px;
    }
  }
}

@media (max-width: 600px) {
  .docs-accordion {
    &__header {
      padding: 8px 12px;
    }
    
    &__title {
      font-size: 12px;
    }
    
    &__content--active {
      padding: 12px;
    }
  }
}
</style>