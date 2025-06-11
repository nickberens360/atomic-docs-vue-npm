<template>
  <div
    v-if="navItems.type === 'directory'"
    class="docs-recursive-list-group"
  >
    <div
      class="docs-recursive-list-header"
      @click="toggleExpanded($event)"
    >
      <span class="docs-icon docs-folder-icon">🗂️</span>
      <span class="docs-title">{{ navItems.label }}</span>
      <span class="docs-expand-icon">{{ expanded ? '▲' : '▼' }}</span>
    </div>
    <div
      v-if="expanded"
      class="docs-recursive-list-children"
    >
      <template
        v-for="(child, i) in sortedChildren"
        :key="i"
      >
        <DocsRecursiveNavItem
          v-if="child.type === 'directory'"
          :nav-items="child"
          @nav-click="emit('nav-click', $event)"
        />

        <div
          v-else
          class="docs-recursive-list-item"
          :class="{ 'not-documented': child.isDocumented === false }"
          @click="emit('nav-click', child)"
        >
          <span class="docs-icon docs-file-icon">📄</span>
          <span class="docs-title">{{ child.label }}</span>
        </div>
      </template>
    </div>
  </div>
  <div
    v-else
    class="docs-recursive-list-item"
    :class="{ 'not-documented': navItems.isDocumented === false }"
    @click="emit('nav-click', navItems)"
  >
    <span
      v-if="navItems.isDocumented"
      class="docs-icon docs-file-icon"
    >
      📄
    </span>
    <span
      v-else
      class="docs-icon docs-file-icon"
    >
      ❌
    </span>
    <span class="docs-title">{{ navItems.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
// import DocsRecursiveNavItem from './DocsRecursiveNavItem.vue';
import { NavItem } from '../types';

// Define props
interface Props {
  navItems: NavItem;
}

const props = defineProps<Props>();

// Define emits
const emit = defineEmits<{
  (e: 'nav-click', item: NavItem): void;
}>();

// State
const expanded = ref(true);

// Methods
const toggleExpanded = (event: Event) => {
  event.stopPropagation();
  expanded.value = !expanded.value;
};

// Computed properties
const sortedChildren = computed<NavItem[]>(() => {
  if (props.navItems.type !== 'directory') return [];
  return Object.values(props.navItems.children || {}).sort((a) => a.type === 'directory' ? -1 : 1);
});
</script>

<style lang="scss" scoped>
.docs-recursive-list-group {
  margin-bottom: var(--atomic-docs-spacing-xs, 4px);
}

.docs-recursive-list-header {
  display: flex;
  align-items: center;
  padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-md, 16px);
  cursor: pointer;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: background-color 0.2s;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));

  &:hover {
    background-color: var(--atomic-docs-hover-color, rgba(0, 0, 0, 0.04));
  }
}

.docs-recursive-list-item {
  display: flex;
  align-items: center;
  padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-md, 16px);
  cursor: pointer;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: background-color 0.2s;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  font-size: var(--atomic-docs-font-size-sm, 14px);

  &:hover {
    background-color: var(--atomic-docs-hover-color, rgba(0, 0, 0, 0.04));
  }
}

.docs-recursive-list-children {
  padding-left: var(--atomic-docs-spacing-md, 16px);
}

.docs-icon {
  font-size: var(--atomic-docs-font-size-md, 16px);
  margin-right: var(--atomic-docs-spacing-sm, 8px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.docs-title {
  flex: 1;
}

.docs-expand-icon {
  font-size: var(--atomic-docs-font-size-md, 16px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.docs-recursive-list-item.not-documented {
  font-style: italic;
  opacity: 0.5;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));

  .docs-icon {
    color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  }
}
</style>