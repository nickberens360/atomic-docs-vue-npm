<template>
  <div class="docs-tabs">
    <div class="docs-tabs__headers">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="docs-tabs__tab-button"
        :class="{ 'docs-tabs__tab-button--active': activeTab === index }"
        @click="setActiveTab(index)"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="docs-tabs__content">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="docs-tabs__tab-content"
        :class="{ 'docs-tabs__tab-content--active': activeTab === index }"
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
.docs-tabs {
  margin: 24px 0;

  &__headers {
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    margin-bottom: 16px;
  }

  &__tab-button {
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
    
    &:hover {
      color: rgba(0, 0, 0, 0.87);
    }
    
    &--active {
      color: rgba(0, 0, 0, 0.87);
      border-bottom-color: #1976d2; // Primary color, can be adjusted to match your theme
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
  .docs-tabs {
    &__headers {
      flex-wrap: wrap;
    }
    
    &__tab-button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
}
</style>