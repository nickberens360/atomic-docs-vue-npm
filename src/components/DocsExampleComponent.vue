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
            <div
              v-if="templateSource"
              class="template-source-section"
            >
              <pre><code v-html="highlightedTemplateSource" /></pre>
            </div>
            <div v-else>
              <p>No template source available or loaded for '{{ props.relativePath }}'.</p>
            </div>
          </div>
        </template>

        <template #tab-2>
          <div class="tab-content">
            <div
              v-if="scriptSource"
              class="script-source-section"
            >
              <pre><code v-html="highlightedScriptSource" /></pre>
            </div>
            <div v-else>
              <p>No script source available or loaded for '{{ props.relativePath }}'.</p>
            </div>
          </div>
        </template>

        <template #tab-3>
          <div class="tab-content">
            <div
              v-if="styleSource"
              class="style-source-section"
            >
              <pre><code v-html="highlightedStyleSource" /></pre>
            </div>
            <div v-else>
              <p>No style source available or loaded for '{{ props.relativePath }}'.</p>
            </div>
          </div>
        </template>

        <template #tab-4>
          <div class="tab-content">
            <div
              v-if="compiledSource"
              class="compiled-source-section"
            >
              <pre><code v-html="highlightedCompiledSource" /></pre>
            </div>
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
import { computed, ref, watchEffect } from 'vue';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders
} from '../utils/docGenerator';
import DocsDataTable from './DocsDataTable.vue';
import DocsTabs from './DocsTabs.vue';

// Import from the new virtual module
import { rawSourcesMap } from 'virtual:raw-component-sources';

// Import Vue compiler
import { parse, compile } from '@vue/compiler-dom';
// Import Prism.js
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Consider if this should be globally imported
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';

const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);
const styleSource = ref<string | null>(null);
const compiledSource = ref<string | null>(null);

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

watchEffect(() => {
  if (props.relativePath && rawSourcesMap.hasOwnProperty(props.relativePath)) {
    const rawSource = rawSourcesMap[props.relativePath];
    templateSource.value = extractTemplateContent(rawSource);
    scriptSource.value = extractScriptContent(rawSource);
    styleSource.value = extractStyleContent(rawSource);
    compiledSource.value = generateCompiledCode(rawSource);
  } else {
    templateSource.value = null;
    scriptSource.value = null;
    styleSource.value = null;
    compiledSource.value = null;
    // Optional: log if a path is given but not found, for debugging
    // if (props.relativePath) {
    //   console.warn(`[DocsExampleComponent] Raw source not found for path: '${props.relativePath}'. Available paths:`, Object.keys(rawSourcesMap));
    // }
  }
});

const tabsExample = [
  { title: '📚API' },
  { title: '🖼️Template' },
  { title: '🚀Script' },
  { title: '🎨Styles' },
  { title: '📦Compiled' },
];

const highlightedTemplateSource = computed(() => {
  if (!templateSource.value) return '';
  try {
    return Prism.highlight(templateSource.value, Prism.languages.html || Prism.languages.markup, 'html');
  } catch (e) { return templateSource.value; } // Fallback
});

const highlightedScriptSource = computed(() => {
  if (!scriptSource.value) return '';
  try {
    return Prism.highlight(scriptSource.value, Prism.languages.javascript, 'javascript');
  } catch (e) { return scriptSource.value; }
});

const highlightedStyleSource = computed(() => {
  if (!styleSource.value) return '';
  try {
    return Prism.highlight(styleSource.value, Prism.languages.css, 'css');
  } catch (e) { return styleSource.value; }
});

const highlightedCompiledSource = computed(() => {
  if (!compiledSource.value) return '';
  try {
    return Prism.highlight(compiledSource.value, Prism.languages.javascript, 'javascript');
  } catch (e) { return compiledSource.value; }
});

function extractTemplateContent(source: string): string | null {
  const match = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return match ? match[0].trim() : null; // Return the whole tag
}

function extractScriptContent(source: string): string | null {
  const match = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return match ? match[0].trim() : null; // Return the whole tag
}

function extractStyleContent(source: string): string | null {
  const match = source.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return match ? match[0].trim() : null; // Return the whole tag
}

function generateCompiledCode(source: string): string | null {
  try {
    const templateContentMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateContentMatch || !templateContentMatch[1]) return '';

    const template = templateContentMatch[1];
    const ast = parse(template); // Parse only the content of the template
    const { code } = compile(ast, { source: template, mode: 'module' }); // Or 'function' mode
    return `// Compiled Template Render Function (client-side approximation)\n${code}`;
  } catch (error) {
    console.error('Failed to compile component template:', error);
    return `// Error compiling component template: ${error instanceof Error ? error.message : String(error)}`;
  }
}

const computedPropItems = computed(() => {
  if (props.propItems && props.propItems.length > 0) return props.propItems;
  if (props.component) return generatePropsItems(props.component);
  return [];
});

const propHeaders = computed(() => getPropsHeaders());
const eventHeaders = computed(() => getEventHeaders());
const slotHeaders = computed(() => getSlotHeaders());

</script>

<style scoped lang="scss">
/* Styles remain the same */
.example-component {
  &__heading {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 48px;
    margin-bottom: 24px;
  }
}

.template-source-section pre,
.script-source-section pre,
.style-source-section pre,
.compiled-source-section pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

.template-source-section code,
.script-source-section code,
.style-source-section code,
.compiled-source-section code {
  font-family: monospace;
  white-space: pre-wrap; /* Allow wrapping */
  word-break: break-all; /* Break long words if necessary */
}

.docs-tabs-example {
  margin-bottom: 32px;

  h3 {
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 16px;
  }

  .tab-content {
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 4px;

    h4 {
      margin-bottom: 12px;
    }

    ul {
      margin-left: 20px;

      li {
        margin-bottom: 8px;
      }
    }
  }
}
</style>