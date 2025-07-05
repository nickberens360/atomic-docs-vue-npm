<template>
  <div
    class="atomic-docs-custom-nav-list"
    :class="bgColor"
  >
    <template
      v-for="item in finalStructure"
      :key="item.relativePath"
    >
      <DocsRecursiveNavItem
        :nav-items="item"
        :force-expand="forceExpandAll" @nav-click="handleNavClick"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import DocsRecursiveNavItem from './DocsRecursiveNavItem.vue';
import { ComponentItem, DirectoryItem, NavigationItem, ComponentDocPlugin, NavItem } from '../types';

interface Props {
  filterText?: string;
  onNavClick?: ((arg: ComponentItem) => void) | null;
  bgColor?: string;
  forceExpandAll?: boolean; // New prop for forced expansion from parent
}

const props = withDefaults(defineProps<Props>(), {
  filterText: '',
  onNavClick: null,
  bgColor: 'background',
  forceExpandAll: false // Default to false
});

const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const router = useRouter();
const componentModules = componentDocPlugin?.componentModules;
const componentsDirName = componentDocPlugin?.componentsDirName;


const directoryStructure = computed<Record<string, NavigationItem>>(() => {
  return Object.keys(componentModules).reduce<Record<string, NavigationItem>>((accumulator, filePath) => {
    // Guard against paths that don't include the components directory name
    if (!filePath.includes(componentsDirName)) {
      return accumulator;
    }

    // Safely split the path and default to an empty string if the result is unexpected
    const relativePath = filePath.split(`${componentsDirName}/`)[1] || '';

    const examplesDirName = componentDocPlugin.examplesDirName;
    const isDocumented = Object.keys(componentDocPlugin.exampleModules).some(examplePath => {
      const exampleRelativePath = examplePath.split(`${examplesDirName}/`)[1] || '';
      return exampleRelativePath === relativePath;
    });

    const exampleComponent = componentDocPlugin.convertPathToExampleName(relativePath);
    const pathSegments = relativePath.split('/');
    let lastRef = accumulator;
    pathSegments.forEach((pathSegment) => {
      if (pathSegment.endsWith('.vue')) {
        // --- MODIFIED: Add isDocumented flag ---
        lastRef[pathSegment] = { type: 'component', label: pathSegment, relativePath, exampleComponent, isDocumented };
      } else if (!lastRef[pathSegment]) {
        lastRef[pathSegment] = { type: 'directory', label: pathSegment, relativePath, children: {} };
        lastRef = (lastRef[pathSegment] as DirectoryItem).children;
      } else if (lastRef[pathSegment].type === 'directory') {
        lastRef = (lastRef[pathSegment] as DirectoryItem).children;
      }
    });
    return accumulator;
  }, {});
});

/**
 * Sorts a nested structure of navigation items.
 * Directories are placed before components, and both are sorted alphabetically.
 * The sorting is applied recursively to all children.
 * @param {Record<string, NavigationItem>} structure - The navigation structure to sort.
 * @returns {Record<string, NavigationItem>} The sorted navigation structure.
 */
function sortNestedStructure(
  structure: Record<string, NavigationItem>
): Record<string, NavigationItem> {
  // Convert the object to an array of [key, value] pairs to sort them
  const sortedEntries = Object.entries(structure).sort(([, a], [, b]) => {
    // If types are different, directories come first
    if (a.type === 'directory' && b.type === 'component') {
      return -1;
    }
    if (a.type === 'component' && b.type === 'directory') {
      return 1;
    }

    // If types are the same, sort alphabetically by label
    return a.label.localeCompare(b.label);
  });

  // Map over the sorted entries to apply sorting recursively
  const recursivelySortedEntries = sortedEntries.map(([key, value]) => {
    // If it's a directory with children, sort its children recursively
    if (value.type === 'directory' && value.children) {
      return [key, { ...value, children: sortNestedStructure(value.children) }];
    }
    // Otherwise, return the item as is
    return [key, value];
  });

  // Convert the sorted array of entries back into an object
  return Object.fromEntries(recursivelySortedEntries);
}


function filterNestedStructure(
  structure: Record<string, NavigationItem>,
  filterText: string
): Record<string, NavigationItem> {
  return Object.entries(structure).reduce<Record<string, NavigationItem>>((accumulator, [key, value]) => {
    if (value.type === 'directory' && Object.keys(value.children).length > 0) {
      const filteredChildren = filterNestedStructure(value.children, filterText);

      if (Object.keys(filteredChildren).length > 0) {
        accumulator[key] = { ...value, children: filteredChildren };
      }
    } else if (value.type === 'component' && value.label.toLowerCase().includes(filterText.toLowerCase())) {
      accumulator[key] = value;
    }

    return accumulator;
  }, {});
}

const finalStructure = computed<Record<string, NavigationItem>>(() => {
  const filteredStructure = filterNestedStructure(directoryStructure.value, props.filterText);
  // After filtering, apply the recursive sorting
  return sortNestedStructure(filteredStructure);
});


function handleNavClick(arg: NavItem): void {
  // Only process component items for navigation
  if (arg.type !== 'component') return;

  if (props.onNavClick) {
    // Make sure relativePath and exampleComponent are defined before passing to onNavClick
    if (arg.relativePath && arg.exampleComponent) {
      props.onNavClick({
        type: 'component',
        label: arg.label,
        relativePath: arg.relativePath,
        exampleComponent: arg.exampleComponent,
        isDocumented: arg.isDocumented
      });
    }
    return;
  }

  // Make sure relativePath and exampleComponent are defined before using them
  if (arg.relativePath && arg.exampleComponent) {
    router.push({
      name: 'componentDoc' as any,
      params: { componentName: arg.exampleComponent },
      query: { relativePath: arg.relativePath }
    });
  }
}
</script>

<style lang="scss" scoped>
.atomic-docs-custom-nav-list {
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
}
</style>