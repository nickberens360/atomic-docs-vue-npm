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
    <div
      v-if="$slots.actions"
      class="mt-6"
    >
      <slot name="actions" />
    </div>
    <div
      v-if="templateSource"
      class="template-source-section"
    >
      <h2 class="example-component__heading">
        Template Source
      </h2>
      <pre><code v-html="highlightedTemplateSource"></code></pre>
    </div>

    <div
      v-if="scriptSource"
      class="script-source-section"
    >
      <h2 class="example-component__heading">
        Script Source
      </h2>
      <pre><code v-html="highlightedScriptSource"></code></pre>
    </div>

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

<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders
} from '../utils/docGenerator';
import DocsDataTable from './DocsDataTable.vue';
import { ComponentDocPlugin } from '../types';
// Import Prism.js
import Prism from 'prismjs';
// Import Prism.js CSS theme
import 'prismjs/themes/prism.css';
// Import language support
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';

// Inject the plugin
const componentDocPlugin = inject('componentDocPlugin') as ComponentDocPlugin;
const templateSource = ref<string | null>(null);
const scriptSource = ref<string | null>(null);

// Computed property for highlighted template source
const highlightedTemplateSource = computed(() => {
  if (!templateSource.value) return '';
  return Prism.highlight(templateSource.value, Prism.languages.markup, 'html');
});

// Computed property for highlighted script source
const highlightedScriptSource = computed(() => {
  if (!scriptSource.value) return '';
  return Prism.highlight(scriptSource.value, Prism.languages.javascript, 'javascript');
});

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
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 48px;
    margin-bottom: 24px;
  }
}

.template-source-section,
.script-source-section {
  margin-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}

.template-source-section pre,
.script-source-section pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

.template-source-section code,
.script-source-section code {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
