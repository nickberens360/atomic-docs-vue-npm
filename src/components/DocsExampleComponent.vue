<template>
  <div class="example-component position-relative">
    <div
      v-if="description || $slots.description"
      class="mb-6"
      style="max-width: 900px;"
    >
      <slot name="description">
        <p>
          {{ description }}
        </p>
      </slot>
    </div>
    <slot name="default" />

    <div class="docs-tabs-example">
      <DocsTabs :tabs="tabsExample">
        <template #tab-0>
          <div class="tab-content">
            <h2 class="example-component__heading">
              Props
            </h2>
            <slot name="props">
              <DocsDataTable
                :headers="propHeaders"
                :items="computedPropItems"
                hide-default-footer
              >
                <template
                  v-for="header in propHeaders"
                  :key="header.key"
                  #[`item.${header.key}`]="slotProps"
                >
                  <slot
                    :name="`item.${header.key}`"
                    v-bind="slotProps"
                  >
                    {{ slotProps.value }}
                  </slot>
                </template>
              </DocsDataTable>
            </slot>

            <h2 class="example-component__heading">
              Events
            </h2>
            <slot name="events">
              <DocsDataTable
                :headers="eventHeaders"
                :items="eventItems"
                hide-default-footer
              >
                <template
                  v-for="header in eventHeaders"
                  :key="header.key"
                  #[`item.${header.key}`]="slotProps"
                >
                  <slot
                    :name="`item.${header.key}`"
                    v-bind="slotProps"
                  >
                    {{ slotProps.value }}
                  </slot>
                </template>
              </DocsDataTable>
            </slot>

            <h2 class="example-component__heading">
              Slots
            </h2>
            <slot name="slots">
              <DocsDataTable
                :headers="slotHeaders"
                :items="slotItems"
                hide-default-footer
              >
                <template
                  v-for="header in slotHeaders"
                  :key="header.key"
                  #[`item.${header.key}`]="slotProps"
                >
                  <slot
                    :name="`item.${header.key}`"
                    v-bind="slotProps"
                  >
                    {{ slotProps.value }}
                  </slot>
                </template>
              </DocsDataTable>
            </slot>
          </div>
        </template>

        <template #tab-1>
          <div class="tab-content">
            <DocsSourceCode 
              v-if="templateSource" 
              :source="templateSource" 
              language="markup" 
            />
          </div>
        </template>

        <template #tab-2>
          <div class="tab-content">
            <DocsSourceCode 
              v-if="scriptSource" 
              :source="scriptSource" 
              language="javascript" 
            />
            <div
              v-else
              class="script-source-section"
            >
              <p>No script code available for this component.</p>
            </div>
          </div>
        </template>

        <template #tab-3>
          <div class="tab-content">
            <DocsSourceCode 
              v-if="styleSource" 
              :source="styleSource" 
              language="css" 
            />
            <div
              v-else
              class="style-source-section"
            >
              <p>No style code available for this component.</p>
            </div>
          </div>
        </template>

        <template #tab-4>
          <div class="tab-content">
            <DocsSourceCode 
              v-if="compiledSource" 
              :source="compiledSource" 
              language="javascript" 
            />
            <div
              v-else
              class="compiled-source-section"
            >
              <p>No compiled code available for this component.</p>
            </div>
          </div>
        </template>
      </DocsTabs>
    </div>
    <div
      v-if="$slots.actions"
      class="mt-6"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders
} from '../utils/docGenerator';
import DocsDataTable from './DocsDataTable.vue';
import DocsTabs from './DocsTabs.vue';
import DocsSourceCode from './DocsSourceCode.vue';
import { ComponentDocPlugin } from '../types';
// Import Vue compiler
import { parse, compile } from '@vue/compiler-dom';
// Import Prism.js
import Prism from 'prismjs';
// Import Prism.js CSS theme
import 'prismjs/themes/prism.css';
// Import language support
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';

// Inject the plugin
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);
const styleSource = ref<string | null>(null);
const compiledSource = ref<string | null>(null);

// Example data for DocsTabs
const tabsExample = [
  { title: '📚API' },
  { title: '🖼️Template' },
  { title: '🚀Script' },
  { title: '🎨Styles' },
  { title: '📦Compiled' },
];


// Function to extract template content from raw source
function extractTemplateContent(source: string): string | null {
  const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return templateMatch ? templateMatch[0] : null;
}

// Function to extract script content from raw source
function extractScriptContent(source: string): string | null {
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return scriptMatch ? scriptMatch[0] : null;
}

// Function to extract style content from raw source
function extractStyleContent(source: string): string | null {
  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return styleMatch ? styleMatch[0] : null;
}

// Function to generate the compiled code
function generateCompiledCode(source: string): string | null {
  try {
    // Extract template content
    const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateMatch || !templateMatch[1]) return null;

    const template = templateMatch[1];
    const ast = parse(template);
    const { code } = compile(ast);

    return `// Compiled Template Render Function\n${code}`;
  } catch (error) {
    console.error('Failed to compile component:', error);
    return `// Error compiling component: ${error}`;
  }
}

// Load and process the raw component source
onMounted(async () => {
  if (props.relativePath && componentDocPlugin?.rawComponentSourceModules) {
    // Find the matching raw source module
    const rawSourcePath = Object.keys(componentDocPlugin.rawComponentSourceModules)
      .find(path => path.includes(props.relativePath));

    if (rawSourcePath) {
      try {
        const rawSource = await componentDocPlugin.rawComponentSourceModules[rawSourcePath]();
        templateSource.value = extractTemplateContent(rawSource);
        scriptSource.value = extractScriptContent(rawSource);
        styleSource.value = extractStyleContent(rawSource);

        // Generate compiled code
        compiledSource.value = generateCompiledCode(rawSource);
      } catch (error) {
        console.error('Failed to load raw component source:', error);
      }
    }
  }
});

// Define props directly without TypeScript
const props = defineProps({
  component: {
    type: Object,
    default: undefined
  },
  description: {
    type: String,
    default: ''
  },
  eventItems: {
    type: Array,
    default: () => []
  },
  slotItems: {
    type: Array,
    default: () => []
  },
  propItems: {
    type: Array,
    default: () => []
  },
  relativePath: {
    type: String,
    default: ''
  }
});

// Computed properties
const computedPropItems = computed(() => {
  // Use the propItems prop if it's provided and not empty
  if (props.propItems && props.propItems.length > 0) {
    return props.propItems;
  }
  // Otherwise, generate the props from the component if it's provided
  if (props.component) {
    return generatePropsItems(props.component);
  }
  return [];
});

const propHeaders = computed(() => {
  return getPropsHeaders();
});

const eventHeaders = computed(() => {
  return getEventHeaders();
});

const slotHeaders = computed(() => {
  return getSlotHeaders();
});
</script>

<style scoped lang="scss">
.example-component {
  &__heading {
    font-size: var(--atomic-docs-font-size-lg, 1.2em);
    font-weight: bold;
    margin-top: var(--atomic-docs-spacing-xl, 48px);
    margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  }
}


.docs-tabs-example {
  margin-bottom: var(--atomic-docs-spacing-xl, 32px);

  h3 {
    margin-bottom: var(--atomic-docs-spacing-md, 16px);
  }

  p {
    margin-bottom: var(--atomic-docs-spacing-md, 16px);
  }

  .tab-content {
    padding: var(--atomic-docs-spacing-md, 16px);
    background-color: var(--atomic-docs-surface-color, #f9f9f9);
    border-radius: var(--atomic-docs-border-radius-sm, 4px);

    h4 {
      margin-bottom: var(--atomic-docs-spacing-sm, 12px);
    }

    ul {
      margin-left: var(--atomic-docs-spacing-md, 20px);

      li {
        margin-bottom: var(--atomic-docs-spacing-sm, 8px);
      }
    }
  }

  .code-example {
    background-color: var(--atomic-docs-surface-color, #f5f5f5);
    padding: var(--atomic-docs-spacing-md, 16px);
    border-radius: var(--atomic-docs-border-radius-sm, 4px);
    margin-top: var(--atomic-docs-spacing-md, 16px);

    pre {
      margin: 0;

      code {
        font-family: var(--atomic-docs-font-family-mono, monospace);
      }
    }
  }

  .example-button {
    padding: var(--atomic-docs-spacing-sm, 8px) var(--atomic-docs-spacing-md, 16px);
    background-color: var(--atomic-docs-primary-color, #1976d2);
    color: white;
    border: none;
    border-radius: var(--atomic-docs-border-radius-sm, 4px);
    cursor: pointer;
    margin-top: var(--atomic-docs-spacing-md, 16px);

    &:hover {
      background-color: #1565c0;
    }
  }
}
</style>
