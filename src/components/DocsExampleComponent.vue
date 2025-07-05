<template>
  <div class="example-component position-relative">
    <div
      v-if="description || $slots.description"
      class="mb-6"
      style="max-width: 900px;"
    >
      <slot name="description">
        <p style="margin-bottom: 18px;">
          {{ description }}
        </p>
      </slot>
    </div>
    <DocsComponentIsolation>
      <slot name="default" />
    </DocsComponentIsolation>

    <div class="atomic-docs-tabs-example">
      <DocsTabs :tabs="tabsExample">
        <template #[`tab-0`]>
          <div class="tab-content">
            <div class="atomic-docs-table-search">
              <DocsTextField
                v-model="searchTerm"
                name="table-search"
                placeholder="Search API documentation..."
                prepend-inner-icon="mdi-magnify"
                hide-details
                bg-color="background"
              >
                <template #append-inner>
                  <span
                    v-if="searchTerm"
                    class="atomic-docs-append-icon"
                    @click="searchTerm = ''"
                  >
                    ✕
                  </span>
                </template>
              </DocsTextField>
            </div>


            <h2 class="atomic-docs-example-component__heading">
              Props
            </h2>
            <slot
              v-if="filteredPropItems.length > 0 || $slots.props"
              name="props"
            >
              <DocsDataTable
                :headers="propHeaders"
                :items="filteredPropItems"
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
            <p v-else>
              No props documented.
            </p>

            <div class="atomic-docs-example-component__events">
              <h2 class="atomic-docs-example-component__heading">
                Events
              </h2>
              <slot
                v-if="filteredEventItems.length > 0 || $slots.events"
                name="events"
              >
                <DocsDataTable
                  :headers="eventHeaders"
                  :items="filteredEventItems"
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

            <div class="atomic-docs-example-component__slots">
              <h2 class="atomic-docs-example-component__heading">
                Slots
              </h2>
              <slot
                v-if="filteredSlotItems.length > 0 || $slots.slots"
                name="slots"
              >
                <DocsDataTable
                  :headers="slotHeaders"
                  :items="filteredSlotItems"
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
            <DocsCopyToClipboard
              v-if="templateSource"
              :text="templateSource"
              title="Copy code"
              class="copy-button"
            />
            <DocsSourceCode
              v-if="templateSource"
              :source="templateSource"
              language="markup"
            />
          </div>
        </template>

        <template #[`tab-2`]>
          <div class="tab-content">
            <DocsCopyToClipboard
              v-if="scriptSource"
              :text="scriptSource"
              title="Copy code"
              class="copy-button"
            />
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
            <DocsCopyToClipboard
              v-if="styleSource"
              :text="styleSource"
              title="Copy code"
              class="copy-button"
            />
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
import {computed, inject, ref, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders,
  PropItem
} from '../utils/docGenerator';
import {
  extractTemplateContent,
  extractScriptContent,
  extractStyleContent
} from '../utils/sourceCodeExtractors';
import { fuzzyMatch, debounce } from '../utils/stringUtils'; // Import the extracted functions
import DocsDataTable from './DocsDataTable.vue';
import DocsTabs from './DocsTabs.vue';
import DocsSourceCode from './DocsSourceCode.vue';
import DocsComponentIsolation from './DocsComponentIsolation.vue';
import {ComponentDocPlugin} from '../types';
// Removed unused import DocsIcon from "./DocsIcon.vue";
import DocsCopyToClipboard from './DocsCopyToClipboard.vue';
import DocsTextField from './DocsTextField.vue'; // Import the DocsTextField component

const route = useRoute();
// Inject the plugin
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);
const styleSource = ref<string | null>(null);
const loadedComponent = ref<any>(null); // New ref to store the loaded component
const rawSource = ref<string>('');


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

// --- Search Filter Logic ---
const searchTerm = ref('');
const debouncedSearchTerm = ref('');

// Create a debounced function to update the debouncedSearchTerm
const updateDebouncedSearchTerm = debounce((value: string) => {
  debouncedSearchTerm.value = value;
}, 300); // 300ms debounce delay

// Watch for changes to searchTerm and update debouncedSearchTerm with debounce
watch(searchTerm, (newValue) => {
  updateDebouncedSearchTerm(newValue);
});

async function loadComponentData() {
  if (relativePath.value && componentDocPlugin) {
    // Load raw component source for code display
    if (componentDocPlugin.rawComponentSourceModules) {
      const rawSourcePath = Object.keys(componentDocPlugin.rawComponentSourceModules).find(path => path.includes(relativePath.value));
      if (rawSourcePath) {
        try {
          const rawSourceModule = await componentDocPlugin.rawComponentSourceModules[rawSourcePath]();
          rawSource.value = rawSourceModule;
          templateSource.value = extractTemplateContent(rawSource.value);
          scriptSource.value = extractScriptContent(rawSource.value);
          styleSource.value = extractStyleContent(rawSource.value);
        } catch (error) {
          console.error('Failed to load raw component source:', error);
        }
      }
    }

    // Load component module for documentation generation
    if (componentDocPlugin.componentModules) {
      const componentPath = Object.keys(componentDocPlugin.componentModules).find(path => path.includes(relativePath.value));
      if (componentPath) {
        try {
          const componentModule = await componentDocPlugin.componentModules[componentPath]();
          loadedComponent.value = componentModule.default;
        } catch (error) {
          console.error('Failed to load component module:', error);
        }
      }
    }
  }
}

// Watch for changes in relativePath and reload data
watch(relativePath, loadComponentData, { immediate: true });

if (import.meta.hot) {
  import.meta.hot.accept(async () => {
    await loadComponentData();
  });
}


// Computed properties for filtered data
const basePropItems = computed(() => {
  if (props.propItems && props.propItems.length > 0) {
    return props.propItems;
  }
  if (props.component) {
    return generatePropsItems(props.component, rawSource.value);
  }
  if (loadedComponent.value) {
    return generatePropsItems(loadedComponent.value, rawSource.value);
  }
  return [];
});

const filteredPropItems = computed(() => {
  if (!debouncedSearchTerm.value) {
    return basePropItems.value;
  }
  return (basePropItems.value as PropItem[]).filter((item) => {
    // Search across relevant string fields in prop items
    return fuzzyMatch(item.name, debouncedSearchTerm.value) ||
      fuzzyMatch(item.type, debouncedSearchTerm.value) ||
      fuzzyMatch(item.default, debouncedSearchTerm.value);
  });
});

interface EventItem {
  event: string;
  payload?: string;
  description?: string;
}

interface SlotItem {
  name: string;
  content?: string;
  description?: string;
}

const filteredEventItems = computed(() => {
  if (!debouncedSearchTerm.value) {
    return props.eventItems as EventItem[];
  }
  return (props.eventItems as EventItem[]).filter((item) => {
    // Assuming event items have 'event', 'payload', 'description' fields
    return fuzzyMatch(item.event, debouncedSearchTerm.value) ||
      fuzzyMatch(item.payload ?? '', debouncedSearchTerm.value) ||
      fuzzyMatch(item.description ?? '', debouncedSearchTerm.value);
  });
});

const filteredSlotItems = computed(() => {
  if (!debouncedSearchTerm.value) {
    return props.slotItems as SlotItem[];
  }
  return (props.slotItems as SlotItem[]).filter((item) => {
    // Assuming slot items have 'name', 'content', 'description' fields
    return fuzzyMatch(item.name, debouncedSearchTerm.value) ||
      fuzzyMatch(item.content ?? '', debouncedSearchTerm.value) ||
      fuzzyMatch(item.description ?? '', debouncedSearchTerm.value);
  });
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
.atomic-docs-example-component {
  &__heading {
    font-size: var(--atomic-docs-font-size-lg, 1.2em);
    font-weight: bold;
    margin-top: var(--atomic-docs-spacing-xl, 48px);
    margin-bottom: var(--atomic-docs-spacing-lg, 24px);
  }
}

.atomic-docs-table-search {
  margin-bottom: var(--atomic-docs-spacing-lg, 24px);
}

.atomic-docs-tabs-example {
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

  .atomic-docs-icon {
    font-size: 18px;
  }
}
</style>