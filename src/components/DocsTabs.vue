<template>
  <div class="docs-tabs">
    <div class="docs-tabs__header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="docs-tabs__tab"
        :class="{ 'docs-tabs__tab--active': activeTab === index }"
        @click="setActiveTab(index)"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="docs-tabs__content">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="docs-tabs__panel"
        :class="{ 'docs-tabs__panel--active': activeTab === index }"
      >
        <slot :name="tab.name || `tab-${index}`">
          {{ tab.content }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  tabs: {
    type: Array as () => Array<{
      title: string;
      name?: string;
      content?: string;
    }>,
    required: true,
  },
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:modelValue']);

const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const setActiveTab = (index: number) => {
  activeTab.value = index;
};
</script>

<style scoped lang="scss">
.docs-tabs {
  margin: 16px 0;
  
  &__header {
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    margin-bottom: 16px;
  }
  
  &__tab {
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: inherit;
    position: relative;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--v-primary-base);
    }
    
    &--active {
      color: var(--v-primary-base);
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--v-primary-base);
      }
    }
  }
  
  &__panel {
    display: none;
    
    &--active {
      display: block;
    }
  }
}
</style>