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

            <div class="example-component__events">
              <h2 class="example-component__heading">
                Events
              </h2>
              <slot
                v-if="eventItems.length > 0 || $slots.events"
                name="events"
              >
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
              <p v-else>
                No events documented.
              </p>
            </div>

            <div class="example-component__slots">
              <h2 class="example-component__heading">
                Slots
              </h2>
              <slot
                v-if="slotItems.length > 0 || $slots.slots"
                name="slots"
              >
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
              <p v-else>
                No slots documented.
              </p>
            </div>
          </div>
        </template>

        <template #[`tab-1`]>
          <div class="tab-content">
            <button
              v-if="templateSource"
              class="copy-button"
              :title="copyStatus === 'template' ? 'Copied!' : 'Copy code'"
              @click="copyToClipboard(templateSource, 'template')"
            >
              <DocsIcon :icon="copyStatus === 'template' ? 'mdi-check' : 'mdi-content-copy'" />
            </button>
            <DocsSourceCode
              v-if="templateSource"
              :source="templateSource"
              language="markup"
            />
          </div>
        </template>

        <template #[`tab-2`]>
          <div class="tab-content">
            <button
              v-if="scriptSource"
              class="copy-button"
              :title="copyStatus === 'script' ? 'Copied!' : 'Copy code'"
              @click="copyToClipboard(scriptSource, 'script')"
            >
              <DocsIcon :icon="copyStatus === 'script' ? 'mdi-check' : 'mdi-content-copy'" />
            </button>
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

<script
  setup
  lang="ts"
>
import {computed, inject, ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders
} from '../utils/docGenerator';
import {
  extractTemplateContent,
  extractScriptContent,
  extractStyleContent
} from '../utils/sourceCodeExtractors';
import DocsDataTable from './DocsDataTable.vue';
import DocsTabs from './DocsTabs.vue';
import DocsSourceCode from './DocsSourceCode.vue';
import DocsComponentIsolation from './DocsComponentIsolation.vue';
import {ComponentDocPlugin} from '../types';
import DocsIcon from "./DocsIcon.vue";

const route = useRoute();
// Inject the plugin
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);
const styleSource = ref<string | null>(null);
const loadedComponent = ref<any>(null); // New ref to store the loaded component


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
  { title: 'API' },
  { title: 'Template' },
  { title: 'Script' },
  { title: 'Styles' },
];

// --- START: Added for copy functionality ---
const copyStatus = ref('');
const copyToClipboard = async (source: string | null, type: string) => {
  if (!source) {
    console.error('No source to copy.');
    return;
  }
  try {
    await navigator.clipboard.writeText(source);
    copyStatus.value = type;
    setTimeout(() => {
      copyStatus.value = '';
    }, 2000); // Reset after 2 seconds
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};
// --- END: Added for copy functionality ---


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

<style
  scoped
  lang="scss"
>
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
    position: relative; // Needed for positioning the copy button
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

.copy-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--atomic-docs-background-color, white);
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.12));
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  padding: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--atomic-docs-surface-color, #f5f5f5);
  }

  .docs-icon {
    font-size: 18px;
  }
}
</style>