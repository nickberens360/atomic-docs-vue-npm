<template>
  <DocsContainer
    class="component-details"
  >
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
      <Component :is="currentComponent" />

      <template #fallback>
        Loading...
      </template>
    </Suspense>
  </DocsContainer>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import DocsComponentNotDocumented from '../components/DocsComponentNotDocumented.vue';
import DocsContainer from '../components/DocsContainer.vue';
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
const examplesDirName = componentDocPlugin?.examplesDirName;
const importComponentPromises = Object.entries(componentDocPlugin?.exampleModules || {})
  .map(async ([path, moduleImport]) => {
    const relativePath = path.split(`${examplesDirName}/`).slice(1).join('');
    const componentName = componentDocPlugin.convertPathToExampleName(relativePath);
    if (exampleComponents[componentName]) {
      throw new Error(`Component already registered with name: ${componentName}`);
    } else {
      exampleComponents[componentName] = await moduleImport();
    }
    return exampleComponents[componentName];
  });
await Promise.all(importComponentPromises);

const props = defineProps<Props>();

const componentName = computed<string>(() => props.relativePath.split('/').pop()?.replace('.vue', '') || '');

const currentComponent = computed<ComponentType>(() => {
  if (exampleComponents[props.componentName]) {
    return exampleComponents[props.componentName].default;
  } else {
    return DocsComponentNotDocumented;
  }
});
</script>

<style lang="scss" scoped>
::deep(.example-component code) {
  background-color: #e3e3e3;
  color: red;
  font-size: 0.8em;
  padding: 2px;
  border-radius: 1px;
}
::deep(.example-component mark) {
  background-color: transparent;
  color: #9E9E9E;
}

.docs-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  font-size: 12px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
}

.component-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.component-title {
  margin-right: 8px;
}
</style>
