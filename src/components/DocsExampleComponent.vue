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
import { computed } from 'vue';
import {
  generatePropsItems,
  getPropsHeaders,
  getEventHeaders,
  getSlotHeaders
} from '../utils/docGenerator';
import DocsDataTable from './DocsDataTable.vue';

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
</style>
