<template>
  <div
    v-if="navItems.type === 'directory'"
    class="atomic-docs-recursive-list-group"
  >
    <div
      class="atomic-docs-recursive-list-header"
      @click="toggleExpanded($event)"
    >
      <span class="atomic-docs-icon atomic-docs-folder-icon">🗂️</span>
      <span class="atomic-docs-title">{{ navItems.label }}</span>
      <span class="atomic-docs-expand-icon">{{ expanded ? '▲' : '▼' }}</span>
    </div>
    <div
      v-if="expanded"
      class="atomic-docs-recursive-list-children"
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
          class="atomic-docs-recursive-list-item"
          :class="{ 'not-documented': child.isDocumented === false }"
          @click="emit('nav-click', child)"
        >
          <span
            v-if="child.isDocumented"
            class="atomic-docs-icon atomic-docs-file-icon"
          >
            📄
          </span>
          <span
            v-else
            class="atomic-docs-icon atomic-docs-file-icon"
          >
            ❌
          </span>
          <span class="atomic-docs-title">{{ child.label }}</span>
        </div>
      </template>
    </div>
  </div>
  <div
    v-else
    class="atomic-docs-recursive-list-item"
    :class="{ 'not-documented': navItems.isDocumented === false }"
    @click="emit('nav-click', navItems)"
  >
    <span
      v-if="navItems.isDocumented"
      class="atomic-docs-icon atomic-docs-file-icon"
    >
      📄
    </span>
    <span
      v-else
      class="atomic-docs-icon atomic-docs-file-icon"
    >
      ❌
    </span>
    <span class="atomic-docs-title">{{ navItems.label }}</span>
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
.atomic-docs-recursive-list-group {
  margin-bottom: var(--atomic-docs-spacing-xs, 4px);
}

.atomic-docs-recursive-list-header {
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

.atomic-docs-recursive-list-item {
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

.atomic-docs-recursive-list-children {
  padding-left: var(--atomic-docs-spacing-md, 16px);
}

.atomic-docs-icon {
  font-size: var(--atomic-docs-font-size-md, 16px);
  margin-right: var(--atomic-docs-spacing-sm, 8px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.atomic-docs-title {
  flex: 1;
}

.atomic-docs-expand-icon {
  font-size: var(--atomic-docs-font-size-md, 16px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.atomic-docs-recursive-list-item.not-documented {
  font-style: italic;
  opacity: 0.5;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));

  .atomic-docs-icon {
    color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  }
}
</style>