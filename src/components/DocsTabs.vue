<template>
  <div class="atomic-docs-tabs">
    <div class="atomic-docs-tabs__headers">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="atomic-docs-tabs__tab-button"
        :class="{ 'atomic-docs-tabs__tab-button--active': activeTab === index }"
        @click="setActiveTab(index)"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="atomic-docs-tabs__content">
      <div
        v-for="(_, index) in tabs"
        :key="index"
        class="atomic-docs-tabs__tab-content"
        :class="{ 'atomic-docs-tabs__tab-content--active': activeTab === index }"
      >
        <slot :name="`tab-${index}`"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useSlots, computed } from 'vue';

interface Tab {
  title: string;
}

interface Props {
  tabs: Tab[];
  defaultTab?: number;
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 0
});

const activeTab = ref(props.defaultTab);
const slots = useSlots();

// Method to set the active tab
const setActiveTab = (index: number) => {
  activeTab.value = index;
};

// Check if slots exist for each tab
const hasSlotContent = computed(() => {
  return props.tabs.map((_, index) => !!slots[`tab-${index}`]);
});

// Set the first tab with content as active if the default tab has no content
onMounted(() => {
  if (!hasSlotContent.value[activeTab.value]) {
    const firstTabWithContent = hasSlotContent.value.findIndex(has => has);
    if (firstTabWithContent !== -1) {
      activeTab.value = firstTabWithContent;
    }
  }
});
</script>

<style scoped lang="scss">
.atomic-docs-tabs {
  margin: var(--atomic-docs-spacing-lg, 24px) 0;

  &__headers {
    display: flex;
    border-bottom: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
    margin-bottom: var(--atomic-docs-spacing-md, 16px);
  }

  &__tab-button {
    padding: var(--atomic-docs-spacing-sm, 12px) var(--atomic-docs-spacing-md, 16px);
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--atomic-docs-font-size-sm, 14px);
    font-weight: 500;
    color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;

    &:hover {
      color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
    }

    &--active {
      color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
      border-bottom-color: var(--atomic-docs-primary-color, #1976d2);
    }
  }

  &__tab-content {
    display: none;

    &--active {
      display: block;
    }
  }
}

@media (max-width: 600px) {
  .atomic-docs-tabs {
    &__headers {
      flex-wrap: wrap;
    }

    &__tab-button {
      padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-sm, 12px);
      font-size: var(--atomic-docs-font-size-xs, 12px);
    }
  }
}
</style>
