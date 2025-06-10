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
    <DocsComponentIsolation>
      <slot name="default" />
    </DocsComponentIsolation>

    <div class="docs-tabs-example">
      <DocsTabs :tabs="tabsExample">
        <template #[`tab-0`]>
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

        <template #[`tab-1`]>
          <div class="tab-content">
            <DocsSourceCode
              v-if="templateSource"
              :source="templateSource"
              language="markup"
            />
          </div>
        </template>

        <template #[`tab-2`]>
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

        <template #[`tab-3`]>
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

        <template #[`tab-4`]>
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

        <template #[`tab-5`]>
          <div class="tab-content">
            <DocsSourceCode
              v-if="renderedDomSource"
              :source="renderedDomSource"
              language="markup"
            />
            <div
              v-else
              class="rendered-dom-section"
            >
              <p>No rendered DOM available for this component.</p>
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
import { computed, inject, ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders
} from '../utils/docGenerator';
import {
  extractTemplateContent,
  extractScriptContent,
  extractStyleContent,
  generateCompiledCode
} from '../utils/sourceCodeExtractors';
import DocsDataTable from './DocsDataTable.vue';
import DocsTabs from './DocsTabs.vue';
import DocsSourceCode from './DocsSourceCode.vue';
import DocsComponentIsolation from './DocsComponentIsolation.vue';
import { ComponentDocPlugin } from '../types';

const route = useRoute();
// Inject the plugin
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);
const styleSource = ref<string | null>(null);
const compiledSource = ref<string | null>(null);
const renderedDomSource = ref<string | null>(null);
const loadedComponent = ref<any>(null); // New ref to store the loaded component
const observer = ref<MutationObserver | null>(null); // Ref for the MutationObserver

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
});

const relativePath = computed(() => route.query.relativePath as string);

// Example data for DocsTabs
const tabsExample = [
  { title: '📚API' },
  { title: '🖼️Template' },
  { title: '🚀Script' },
  { title: '🎨Styles' },
  { title: '📦Compiled' },
  { title: '🔍Rendered DOM' },
];


// Helper function to format HTML with indentation
const formatHtml = (html: string): string => {
  let formatted = '';
  let indent = 0;

  // Split the HTML string into an array of tags and text
  const arr = html.replace(/>\s*</g, '>\n<').split('\n');

  arr.forEach(line => {
    // Check if this line is a closing tag
    if (line.match(/<\//)) {
      indent--;
    }

    // Add the line with proper indentation
    formatted += '  '.repeat(indent > 0 ? indent : 0) + line + '\n';

    // Check if this line is an opening tag and not a self-closing tag
    if (line.match(/<[^/]/) && !line.match(/\/>/)) {
      indent++;
    }
  });

  return formatted;
};

// Function to update the rendered DOM
const updateRenderedDom = async () => {
  await nextTick();
  // Get the component container element
  const componentContainer = document.querySelector('.component-isolation-wrapper');
  if (componentContainer) {
    // Clone the DOM to avoid modifying the actual component
    const clonedDom = componentContainer.cloneNode(true) as HTMLElement;

    // Clean up the DOM by removing any script tags or other unwanted elements
    const scripts = clonedDom.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Get the HTML as a string, with proper indentation
    renderedDomSource.value = formatHtml(clonedDom.innerHTML);
  } else {
    renderedDomSource.value = null;
  }
};

// Load and process the raw component source and component module
onMounted(async () => {
  if (relativePath.value && componentDocPlugin) {
    // Load raw component source for code display
    if (componentDocPlugin.rawComponentSourceModules) {
      // Find the matching raw source module
      const rawSourcePath = Object.keys(componentDocPlugin.rawComponentSourceModules)
        .find(path => path.includes(relativePath.value));

      if (rawSourcePath) {
        try {
          const rawSource = await componentDocPlugin.rawComponentSourceModules[rawSourcePath]();

          // Use the imported extractor functions directly
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

    // Load component module for documentation generation
    if (componentDocPlugin.componentModules) {
      const componentPath = Object.keys(componentDocPlugin.componentModules)
        .find(path => path.includes(relativePath.value));

      if (componentPath) {
        try {
          const componentModule = await componentDocPlugin.componentModules[componentPath]();
          loadedComponent.value = componentModule.default; // Assuming the component is the default export
        } catch (error) {
          console.error('Failed to load component module:', error);
        }
      }
    }
  }

  // Add a small delay to ensure the component is fully rendered
  setTimeout(updateRenderedDom, 100);

  // Set up a MutationObserver to watch for DOM changes
  const componentContainer = document.querySelector('.component-isolation-wrapper');
  if (componentContainer) {
    observer.value = new MutationObserver(() => {
      // When DOM changes are detected, update the rendered DOM
      updateRenderedDom();
    });

    // Start observing the component container for all changes
    observer.value.observe(componentContainer, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    });
  }
});

// Update the rendered DOM whenever the component changes
watch(() => props.component, updateRenderedDom, { deep: true });

// Clean up the MutationObserver when the component is unmounted
onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
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
  // If neither propItems nor component is provided, use the loaded component
  if (loadedComponent.value) {
    return generatePropsItems(loadedComponent.value);
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
