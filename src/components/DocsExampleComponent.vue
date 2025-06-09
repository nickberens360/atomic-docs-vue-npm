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
import { computed, inject, ref, watchEffect } from 'vue';
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
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;

const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);
const styleSource = ref<string | null>(null);
const compiledSource = ref<string | null>(null);
const loadedComponent = ref<any>(null);

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

const tabsExample = [
  { title: '📚API' },
  { title: '🖼️Template' },
  { title: '🚀Script' },
  { title: '🎨Styles' },
  { title: '📦Compiled' },
];

const hmrTrigger = ref(0);
let currentRawSourcePathKey: string | undefined = undefined;
let currentComponentPathKey: string | undefined = undefined;

if (import.meta.hot) {
  console.log('DocsExampleComponent: Attaching HMR listener.');

  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('DocsExampleComponent HMR: vite:afterUpdate event received. Payload:', JSON.stringify(payload));

    let needsReload = false;
    if (componentDocPlugin) {
      for (const update of payload.updates) {
        console.log(`DocsExampleComponent HMR: Processing update - Path: "${update.path}", Type: "${update.type}"`);
        console.log(`DocsExampleComponent HMR: Current relativePath.value: "${relativePath.value}"`);
        console.log(`DocsExampleComponent HMR: Current currentRawSourcePathKey: "${currentRawSourcePathKey}"`);
        // console.log(`DocsExampleComponent HMR: Current currentComponentPathKey: "${currentComponentPathKey}"`); // Optional: if component module also needs checking

        if (update.type === 'js-update' || update.type === 'vue-reload') {
          let isMatch = false;

          // Strategy 1: Check if Vite's updated path includes/ends with relativePath.value
          // This assumes relativePath.value is like "MyComponent.vue" or "feature/MyComponent.vue"
          // And update.path from Vite is like "/src/components/feature/MyComponent.vue"
          if (relativePath.value && update.path.endsWith(relativePath.value)) {
            isMatch = true;
            console.log(`DocsExampleComponent HMR: Matched because update.path ("${update.path}") ends with relativePath.value ("${relativePath.value}").`);
          } else if (relativePath.value && update.path.includes(relativePath.value)) {
             isMatch = true;
             console.log(`DocsExampleComponent HMR: Matched because update.path ("${update.path}") includes relativePath.value ("${relativePath.value}").`);
          }

          // Strategy 2: Check against currentRawSourcePathKey (if strategy 1 failed)
          // This is more complex due to how module keys might be formed (e.g., relative paths, Vite suffixes like ?raw)
          if (!isMatch && currentRawSourcePathKey) {
            // Normalize currentRawSourcePathKey: remove query strings (like ?raw), get the base path
            const normalizedKey = currentRawSourcePathKey.split('?')[0];
            // Check if Vite's update.path ends with this normalized key
            // This is useful if currentRawSourcePathKey is like '../components/MyComponent.vue' and update.path is '/src/components/MyComponent.vue'
            if (update.path.endsWith(normalizedKey)) {
                isMatch = true;
                console.log(`DocsExampleComponent HMR: Matched because update.path ("${update.path}") ends with normalized currentRawSourcePathKey ("${normalizedKey}").`);
            } else {
                 // Fallback: try to get just the filename from the key
                 const keyFilename = normalizedKey.substring(normalizedKey.lastIndexOf('/') + 1);
                 if (update.path.endsWith(keyFilename)) {
                    isMatch = true;
                    console.log(`DocsExampleComponent HMR: Matched because update.path ("${update.path}") ends with filename from currentRawSourcePathKey ("${keyFilename}").`);
                 }
            }
          }

          if (isMatch) {
            needsReload = true;
            console.log(`DocsExampleComponent HMR: Setting needsReload = true for path: ${update.path}`);
            break; 
          }
        }
      }
    } else {
      console.warn('DocsExampleComponent HMR: componentDocPlugin not available at time of HMR event.');
    }

    if (needsReload) {
      console.log(`DocsExampleComponent HMR: Triggering UI refresh for component related to: "${relativePath.value || 'unknown'}" due to update in "${payload.updates.find(u => u.type === 'js-update' || u.type === 'vue-reload')?.path}"`);
      hmrTrigger.value++;
    } else {
      console.log(`DocsExampleComponent HMR: No relevant HMR update found to trigger UI refresh for "${relativePath.value || 'unknown'}".`);
    }
  });
} else {
  console.log('DocsExampleComponent: HMR (import.meta.hot) not available.');
}

watchEffect(async () => {
  // User's log, plus hmrTrigger value and current relativePath for context
  console.log(`DocsExampleComponent: watchEffect triggered. HMR Trigger: ${hmrTrigger.value}, Path: "${relativePath.value}"`);

  // Make hmrTrigger a dependency of this effect by reading it
  const triggerValue = hmrTrigger.value; 

  if (relativePath.value && componentDocPlugin) {
    currentRawSourcePathKey = undefined; // Reset before finding
    currentComponentPathKey = undefined; // Reset before finding

    console.log(`DocsExampleComponent watchEffect: Loading data for relativePath: "${relativePath.value}", Trigger: ${triggerValue}`);

    if (componentDocPlugin.rawComponentSourceModules) {
      currentRawSourcePathKey = Object.keys(componentDocPlugin.rawComponentSourceModules)
        .find(pathKey => pathKey.includes(relativePath.value)); // This find logic might also need adjustment

      if (currentRawSourcePathKey) {
        console.log(`DocsExampleComponent watchEffect: Found raw source key: "${currentRawSourcePathKey}"`);
        try {
          const rawSourceModuleLoader = componentDocPlugin.rawComponentSourceModules[currentRawSourcePathKey];
          const rawSource = await rawSourceModuleLoader();
          templateSource.value = extractTemplateContent(rawSource);
          scriptSource.value = extractScriptContent(rawSource);
          styleSource.value = extractStyleContent(rawSource);
          compiledSource.value = generateCompiledCode(rawSource);
        } catch (error) {
          console.error(`DocsExampleComponent watchEffect: Failed to load raw component source for "${currentRawSourcePathKey}":`, error);
          // Set to error messages or null
        }
      } else {
        console.warn(`DocsExampleComponent watchEffect: No raw source module found for relativePath: "${relativePath.value}"`);
        templateSource.value = scriptSource.value = styleSource.value = compiledSource.value = null;
      }
    }

    if (componentDocPlugin.componentModules) {
      currentComponentPathKey = Object.keys(componentDocPlugin.componentModules)
        .find(pathKey => pathKey.includes(relativePath.value)); // Similar find logic

      if (currentComponentPathKey) {
        console.log(`DocsExampleComponent watchEffect: Found component module key: "${currentComponentPathKey}"`);
        try {
          const componentModuleLoader = componentDocPlugin.componentModules[currentComponentPathKey];
          const componentModule = await componentModuleLoader();
          loadedComponent.value = componentModule.default;
        } catch (error) {
          console.error(`DocsExampleComponent watchEffect: Failed to load component module for "${currentComponentPathKey}":`, error);
          loadedComponent.value = null;
        }
      } else {
        console.warn(`DocsExampleComponent watchEffect: No component module found for relativePath: "${relativePath.value}"`);
        loadedComponent.value = null;
      }
    }
  } else {
    console.log(`DocsExampleComponent watchEffect: Clearing sources because relativePath ("${relativePath.value}") or componentDocPlugin is not set. Trigger: ${triggerValue}`);
    templateSource.value = null;
    scriptSource.value = null;
    styleSource.value = null;
    compiledSource.value = null;
    loadedComponent.value = null;
    currentRawSourcePathKey = undefined;
    currentComponentPathKey = undefined;
  }
});

const computedPropItems = computed(() => {
  if (props.propItems && props.propItems.length > 0) return props.propItems;
  if (props.component) return generatePropsItems(props.component);
  if (loadedComponent.value) return generatePropsItems(loadedComponent.value);
  return [];
});

const propHeaders = computed(getPropsHeaders);
const eventHeaders = computed(getEventHeaders);
const slotHeaders = computed(getSlotHeaders);
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