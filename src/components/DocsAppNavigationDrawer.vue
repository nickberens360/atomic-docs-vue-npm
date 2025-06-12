<template>
  <aside
    class="docs-navigation-drawer"
    :class="{
      'docs-navigation-drawer--open': props.isNavDrawerOpen,
      'docs-navigation-drawer--rail': props.isRailOpen,
      'docs-navigation-drawer--expanded': isExpanded
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="docs-navigation-content">
      <DocsAccordion
        :sections="[
          { title: 'Components' },
          { title: 'Colors' }
        ]"
      >
        <template #[`section-0`]>
          <div class="docs-text-field">
            <div class="docs-input-wrapper">
              <span class="docs-prepend-icon">🔍</span>
              <input
                v-model="filterText"
                name="filter-components"
                placeholder="Search Components"
                class="docs-input"
                autocomplete="one-time-code"
              >
              <span 
                v-if="filterText" 
                class="docs-append-icon" 
                @click="filterText = ''"
              >
                ✕
              </span>
            </div>
          </div>
          <DocsComponentNavigation :filter-text="filterText" />
        </template>

        <template #[`section-1`]>
          <div class="docs-nav-item">
            <router-link
              to="/component-docs/colors"
              class="docs-nav-link"
              active-class="docs-nav-link--active"
            >
              <span class="docs-icon docs-file-icon">🎨</span>
              <span class="docs-title">Color System</span>
            </router-link>
          </div>
        </template>
      </DocsAccordion>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DocsComponentNavigation from "./DocsComponentNavigation.vue";
import DocsAccordion from "./DocsAccordion.vue";

// Define refs
const filterText = ref('');

// Define props
const props = defineProps<{
  isRailOpen: boolean;
  isNavDrawerOpen: boolean;
}>();

const isExpanded = ref(false);

// Handle expand-on-hover functionality
const handleMouseEnter = () => {
  if (props.isRailOpen) {
    isExpanded.value = true;
  }
};

const handleMouseLeave = () => {
  if (props.isRailOpen) {
    isExpanded.value = false;
  }
};

// Watch for changes to the rail state
watch(() => props.isRailOpen, (newValue) => {
  if (!newValue) {
    isExpanded.value = false;
  }
});
</script>

<style scoped lang="scss">
.docs-navigation-drawer {
  position: fixed;
  top: 64px; // Height of the app bar
  left: 0;
  bottom: 0;
  width: 256px;
  background-color: var(--atomic-docs-background-color, #f5f5f5);
  box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease, width 0.3s ease;
  overflow-y: auto;
  z-index: 100;

  // Closed state
  transform: translateX(-100%);

  // Open state
  &--open {
    transform: translateX(0);
  }

  // Rail state (collapsed)
  &--rail {
    width: 56px;
    overflow: hidden;

    .docs-navigation-content {
      opacity: 0;
      visibility: hidden;
    }
  }

  // Expanded state (on hover when in rail mode)
  &--rail.docs-navigation-drawer--expanded {
    width: 256px;

    .docs-navigation-content {
      opacity: 1;
      visibility: visible;
    }
  }
}

.docs-navigation-content {
  transition: opacity 0.2s ease, visibility 0.2s ease;
  padding: 4px;
  height: 100%;
}

.docs-navigation-card {
  background-color: transparent;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  height: 100%;
}

.docs-nav-item {
  margin: 4px 0;
}

.docs-nav-link {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  text-decoration: none;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  transition: background-color 0.2s;
  font-size: 14px;

  &:hover {
    background-color: var(--atomic-docs-hover-color, rgba(0, 0, 0, 0.04));
  }

  &--active {
    background-color: var(--atomic-docs-active-color, rgba(0, 0, 0, 0.08));
    font-weight: 500;
  }
}

.docs-icon {
  font-size: 16px;
  margin-right: 8px;
}

.docs-title {
  flex: 1;
}

.docs-text-field {
  width: 100%;
  background-color: var(--atomic-docs-background-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  margin: 8px 0;
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.23));
}

.docs-input-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 12px;
}

.docs-prepend-icon, .docs-append-icon {
  font-size: var(--atomic-docs-font-size-md, 18px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.54));
}

.docs-append-icon {
  cursor: pointer;
}

.docs-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 8px;
  font-size: 14px;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  background-color: transparent;
}
</style>
