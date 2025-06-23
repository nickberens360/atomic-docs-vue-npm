<template>
  <div class="component-details">
    <div class="component-header">
      <h2 class="component-title">
        {{ componentName }}
      </h2>
      <span
        v-if="props.relativePath"
        class="docs-chip"
      >
        {{ props.relativePath }}
      </span>
    </div>
    <Suspense>
      <Component
        :is="currentComponent"
      />
      <!--        :relative-path="props.relativePath"-->
      <template #fallback>
        Loading...
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import DocsComponentNotDocumented from '../components/DocsComponentNotDocumented.vue';
import { ComponentDocPlugin } from '../types';

// Define a custom type for component definitions
type ComponentType = any;

// Define the interface for the example components
interface ExampleComponent {
  default: ComponentType;
}

// Define the interface for the props
interface Props {
  relativePath: string;
  componentName: string;
}
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const exampleComponents: Record<string, ExampleComponent> = {};

// --- Start of Changes ---

const examplesDirName = componentDocPlugin?.examplesDirName;
const exampleModules = componentDocPlugin?.exampleModules;

// Add guards to prevent crashes in production builds
if (exampleModules && examplesDirName) {
  const importComponentPromises = Object.entries(exampleModules)
    .map(async ([path, moduleImport]) => {
      // Ensure path is a string and contains the directory name before splitting
      if (typeof path !== 'string' || !path.includes(examplesDirName)) {
        return null;
      }
      const relativePath = path.split(`${examplesDirName}/`).slice(1).join('');
      const componentName = componentDocPlugin.convertPathToExampleName(relativePath);
      if (exampleComponents[componentName]) {
        console.warn(`Component example already loaded: ${componentName}`);
      } else {
        exampleComponents[componentName] = await moduleImport();
      }
      return exampleComponents[componentName];
    });
  await Promise.all(importComponentPromises);
}

// --- End of Changes ---

const props = defineProps<Props>();

const componentName = computed<string>(() => {
  // Add guard for relativePath
  if (!props.relativePath || typeof props.relativePath !== 'string') return '';
  return props.relativePath.split('/').pop()?.replace('.vue', '') || '';
});

const currentComponent = computed<ComponentType>(() => {
  if (exampleComponents[props.componentName]) {
    return exampleComponents[props.componentName].default;
  } else {
    return DocsComponentNotDocumented;
  }
});
</script>

<style lang="scss" scoped>

.docs-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--atomic-docs-spacing-sm, 8px);
  height: 24px;
  font-size: var(--atomic-docs-font-size-xs, 12px);
  border-radius: var(--atomic-docs-border-radius-lg, 16px);
  background-color: var(--atomic-docs-hover-color, rgba(0, 0, 0, 0.08));
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  white-space: nowrap;
}

.component-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.component-title {
  margin-bottom: 0;
  margin-right: var(--atomic-docs-spacing-sm, 8px);
}
</style>
