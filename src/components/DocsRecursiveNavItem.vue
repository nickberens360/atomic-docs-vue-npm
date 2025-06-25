<template>
  <div
    v-if="navItems.type === 'directory'"
    class="atomic-docs-recursive-list-group"
  >
    <div
      class="atomic-docs-recursive-list-header"
      :class="{
        'atomic-docs-recursive-list-header-active': expanded,
        'not-documented': hasNoDocumentedComponents
      }"
      @click="toggleExpanded($event)"
    >
      <span class="atomic-docs-icon atomic-docs-folder-icon">
        {{ expanded ? '📂' : '📁' }}
      </span>
      <span class="atomic-docs-title">{{ navItems.label }}</span>
    </div>
    <div
      v-if="expanded"
      class="atomic-docs-recursive-list-children"
    >
      <template
        v-for="(child, i) in sortedChildren"
        :key="i"
      >
        <div class="atomic-docs-tree-item">
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
import { computed, ref, inject, provide } from 'vue';
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

// Get or create expanded item ID tracking
const parentExpandedItemId = inject('expandedItemId', null);
const expandedItemId = parentExpandedItemId || ref<string | null>(null);

// If this is the root component, provide the expanded item ID to all children
if (!parentExpandedItemId) {
  provide('expandedItemId', expandedItemId);
}

// Generate a unique ID for this item
const itemId = props.navItems.relativePath || props.navItems.label;

// Computed property to determine if this item is expanded
const expanded = computed(() => {
  return expandedItemId.value === itemId;
});

// Methods
const toggleExpanded = (event: Event) => {
  event.stopPropagation();

  // If this item is already expanded, collapse it
  // Otherwise, expand this item (which will collapse others)
  if (expanded.value) {
    expandedItemId.value = null;
  } else {
    expandedItemId.value = itemId;
  }
};

// Computed properties
const sortedChildren = computed<NavItem[]>(() => {
  if (props.navItems.type !== 'directory') return [];
  return Object.values(props.navItems.children || {}).sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.label.localeCompare(b.label);
  })
});

// Computed property to check if a directory has any documented components
const hasDocumentedComponents = computed(() => {
  if (props.navItems.type !== 'directory') return true;

  // Recursive function to check if a directory has any documented components
  const checkForDocumented = (item: NavItem): boolean => {
    if (item.type === 'component') {
      return item.isDocumented === true;
    } else if (item.type === 'directory') {
      // Check all children recursively
      return Object.values(item.children || {}).some(child => checkForDocumented(child));
    }
    return false;
  };

  return checkForDocumented(props.navItems);
});

// Computed property to check if a directory has no documented components
// and all its subdirectories also have no documented components
const hasNoDocumentedComponents = computed(() => {
  if (props.navItems.type !== 'directory') return false;

  // Recursive function to check if a directory has no documented components
  const checkForNoDocumented = (item: NavItem): boolean => {
    if (item.type === 'component') {
      return item.isDocumented !== true; // Return true if component is NOT documented
    } else if (item.type === 'directory') {
      // Check if directory has any children
      const children = Object.values(item.children || {});
      if (children.length === 0) return true; // Empty directory has no documented components

      // Check all children recursively - ALL must have no documented components
      return children.every(child => checkForNoDocumented(child));
    }
    return true; // Default case (not a component or directory)
  };

  return checkForNoDocumented(props.navItems);
});
</script>

<style lang="scss" scoped>
// Tree structure variables
$tree-base: 48px;
$tree-indent: $tree-base;
$tree-line-offset: $tree-base * 0.42; // ~10px when tree-base is 24px
$tree-branch-width: $tree-base * 0.58; // ~14px when tree-base is 24px
$tree-line-color: var(--atomic-docs-text-color-secondary);
$tree-line-thickness: 1px;

.atomic-docs-recursive-list-group {
  margin-bottom: var(--atomic-docs-spacing-xs, 4px);
}

.atomic-docs-recursive-list-header {
  display: flex;
  font-weight: bold;
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
  position: relative;
  padding-left: $tree-indent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: $tree-line-offset;
    height: 100%;
    width: $tree-line-thickness;
    background-color: $tree-line-color;
  }
}

.atomic-docs-tree-item {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 16px;
    left: -$tree-branch-width;
    width: $tree-branch-width;
    height: $tree-line-thickness;
    background-color: $tree-line-color;
  }
}

.atomic-docs-icon {
  display: inline-block;
  //display: none;
  font-size: var(--atomic-docs-font-size-md, 16px);
  margin-right: var(--atomic-docs-spacing-sm, 8px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
}

.atomic-docs-title {
  flex: 1;
}

.atomic-docs-recursive-list-item.not-documented {
  font-style: italic;
  opacity: 0.5;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));

  .atomic-docs-icon {
    color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  }
}

.atomic-docs-recursive-list-header.not-documented {
  font-style: italic;
  opacity: 0.5;
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));

  .atomic-docs-icon {
    color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.6));
  }
}
</style>
