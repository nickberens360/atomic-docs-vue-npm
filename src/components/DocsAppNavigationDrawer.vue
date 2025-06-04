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
      <DocsAccordion :sections="[
        { title: 'Components' },
        { title: 'Colors' }
      ]">
        <template #section-0>
          <DocsComponentNavigation />
        </template>

        <template #section-1>
          <!-- Placeholder for Colors section -->
          <div>Colors content placeholder</div>
        </template>
      </DocsAccordion>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DocsComponentNavigation from "./DocsComponentNavigation.vue";
import DocsAccordion from "./DocsAccordion.vue";

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
  background-color: var(--docs-background-color, #f5f5f5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  padding: 8px;
}

.docs-navigation-card {
  background-color: transparent;
  border-radius: 4px;
  height: 100%;
}
</style>
