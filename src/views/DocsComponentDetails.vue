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
      <Component 
        :is="currentComponent" 
        :template-code="templateCode"
        :source-code="sourceCode"
      />

      <template #fallback>
        Loading...
      </template>
    </Suspense>
  </DocsContainer>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import DocsComponentNotDocumented from '../components/DocsComponentNotDocumented.vue';
import DocsContainer from '../components/DocsContainer.vue';
import { ComponentDocPlugin } from '../types';
import { extractTemplateCode } from '../utils/docGenerator';

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

// Create refs to store template and source code
const templateCode = ref<string>('');
const sourceCode = ref<string>('');

// Extract template code from the component file
const extractComponentTemplate = async () => {
  try {
    if (props.relativePath) {
      // Construct the full path to the component file
      // This assumes the component files are in a directory structure that matches the relativePath
      // You may need to adjust this based on your actual file structure
      const componentPath = `${process.env.NODE_ENV === 'development' ? '' : ''}${props.relativePath}`;

      // Extract template code using vue-docgen-api with a longer timeout (10 seconds)
      const { templateCode: template, sourceCode: source } = await extractTemplateCode(componentPath, 10000);
      templateCode.value = template;
      sourceCode.value = source;
    }
  } catch (error) {
    console.error('Error extracting template code:', error);
    // Set fallback values for template and source code
    templateCode.value = `<!-- Unable to extract template code for ${props.relativePath}. -->`;
    sourceCode.value = `/* Unable to extract source code for ${props.relativePath}. */`;
  }
};

// Call the function to extract template code
extractComponentTemplate();

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
