<template>
  <div
    class="docs-custom-nav-list"
    :class="bgColor"
  >
    <template
      v-for="(item, key) in finalStructure"
      :key="key"
    >
      <DocsRecursiveNavItem
        :nav-items="item"
        @nav-click="handleNavClick"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import DocsRecursiveNavItem from './DocsRecursiveNavItem.vue';
import { ComponentItem, DirectoryItem, NavigationItem, ComponentDocPlugin, ComponentNavItem, DirectoryNavItem, NavItem } from '../types';

interface Props {
  filterText: string;
  onNavClick?: ((arg: ComponentItem) => void) | null;
  bgColor: 'background' | 'white' | string; // More specific typing
}

const props = withDefaults(defineProps<Props>(), {
  filterText: '',
  onNavClick: null,
  bgColor: 'background'
});

const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const router = useRouter();
const componentModules = componentDocPlugin?.componentModules ?? {};
const componentsDirName = componentDocPlugin?.componentsDirName;


const directoryStructure = computed<Record<string, NavigationItem>>(() => {
  if (!componentModules) return {};

  const structure: Record<string, NavigationItem> = {};

  Object.keys(componentModules).forEach(filePath => {
    if (!filePath.includes(`${componentsDirName}/`)) return;

    const relativePath = filePath.split(`${componentsDirName}/`).slice(1).join('');
    const exampleComponent = componentDocPlugin.convertPathToExampleName(relativePath);
    const pathSegments = relativePath.split('/');

    let currentLevel = structure;
    const segmentPath: string[] = [];

    pathSegments.forEach((segment, index) => {
      segmentPath.push(segment);
      const currentPath = segmentPath.join('/');

      if (segment.endsWith('.vue')) {
        // It's a component file
        currentLevel[segment] = { 
          type: 'component', 
          label: segment, 
          relativePath, 
          exampleComponent 
        };
      } else {
        // It's a directory
        if (!currentLevel[segment]) {
          currentLevel[segment] = { 
            type: 'directory', 
            label: segment, 
            relativePath: currentPath, 
            children: {} 
          };
        }

        currentLevel = (currentLevel[segment] as DirectoryItem).children;
      }
    });
  });

  return structure;
});

function filterNestedStructure(
  structure: Record<string, NavigationItem>,
  filterText: string
): Record<string, NavigationItem> {
  if (!filterText) return structure; // Early return if no filter

  const result: Record<string, NavigationItem> = {};
  const lowerFilterText = filterText.toLowerCase();

  for (const [key, value] of Object.entries(structure)) {
    if (value.type === 'directory') {
      const filteredChildren = filterNestedStructure(value.children, filterText);

      if (Object.keys(filteredChildren).length > 0) {
        result[key] = { ...value, children: filteredChildren };
      }
    } else if (
      value.type === 'component' && 
      value.label.toLowerCase().includes(lowerFilterText)
    ) {
      result[key] = value;
    }
  }

  return result;
}

const finalStructure = computed<Record<string, NavigationItem>>(() => {
  return filterNestedStructure(directoryStructure.value, props.filterText);
});


function handleNavClick(arg: NavItem): void {
  // Only process component items for navigation
  if (arg.type !== 'component') return;

  try {
    if (props.onNavClick) {
      // Make sure relativePath and exampleComponent are defined before passing to onNavClick
      if (arg.relativePath && arg.exampleComponent) {
        props.onNavClick({
          type: 'component',
          label: arg.label,
          relativePath: arg.relativePath,
          exampleComponent: arg.exampleComponent
        });
      } else {
        console.warn('Missing required properties for navigation item:', arg);
      }
      return;
    }

    // Make sure relativePath and exampleComponent are defined before using them
    if (arg.relativePath && arg.exampleComponent) {
      router.push({
        name: 'componentDoc',
        params: { componentName: arg.exampleComponent },
        query: { relativePath: arg.relativePath }
      });
    } else {
      console.warn('Missing required properties for navigation item:', arg);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
}
</script>

<style lang="scss" scoped>
.docs-custom-nav-list {
  padding: 8px;
  border-radius: 4px;
  background-color: white;

  &.background {
    background-color: #f5f5f5;
  }
}
</style>
