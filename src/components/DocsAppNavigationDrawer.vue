<template>
  <aside
    class="atomic-docs-navigation-drawer"
    :class="{
      'atomic-docs-navigation-drawer--open': props.isNavDrawerOpen,
      'atomic-docs-navigation-drawer--rail': props.isRailOpen,
      'atomic-docs-navigation-drawer--expanded': isExpanded
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="atomic-docs-navigation-content">
      <DocsAccordion
        :sections="[
          { title: 'Components' },
          { title: 'Colors' },
          { title: 'Typography' }
        ]"
      >
        <template #[`section-0`]>
          <DocsComponentFilter
            persist-open
            :background-color="false"
            flat
            input-variant="underlined"
            :input-bg-color="false"
          />
        </template>

        <template #[`section-1`]>
          <div class="atomic-docs-nav-item">
            <router-link
              to="/atomic-docs/colors"
              class="atomic-docs-nav-link"
              active-class="atomic-docs-nav-link--active"
            >
              <span class="atomic-docs-icon atomic-docs-file-icon">🎨</span>
              <span class="atomic-docs-title">Color System</span>
            </router-link>
          </div>
        </template>

        <template #[`section-2`]>
          <div class="atomic-docs-nav-item">
            <router-link
              to="/atomic-docs/typography"
              class="atomic-docs-nav-link"
              active-class="atomic-docs-nav-link--active"
            >
              <span class="atomic-docs-icon atomic-docs-file-icon">🔤</span>
              <span class="atomic-docs-title">Typography System</span>
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
import DocsComponentFilter from "@/components/DocsComponentFilter.vue";

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
:deep(.atomic-docs-menu) {
  position: relative;
  width: unset;
}
.atomic-docs-navigation-drawer {
  position: fixed;
  top: var(--atomic-docs-appbar-height);
  left: 0;
  bottom: 0;
  width: var(--atomic-docs-drawer-width);
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
    width: var(--atomic-docs-drawer-rail-width);
    overflow: hidden;

    .atomic-docs-navigation-content {
      opacity: 0;
      visibility: hidden;
    }
  }

  // Expanded state (on hover when in rail mode)
  &--rail.atomic-docs-navigation-drawer--expanded {
    width: var(--atomic-docs-drawer-width);

    .atomic-docs-navigation-content {
      opacity: 1;
      visibility: visible;
    }
  }
}

.atomic-docs-navigation-content {
  transition: opacity 0.2s ease, visibility 0.2s ease;
  padding: 4px;
  height: 100%;
}

.atomic-docs-navigation-card {
  background-color: transparent;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  height: 100%;
}

.atomic-docs-nav-item {
  margin: 4px 0;
}

.atomic-docs-nav-link {
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

.atomic-docs-icon {
  font-size: 16px;
  margin-right: 8px;
}

.atomic-docs-title {
  flex: 1;
}

.atomic-docs-text-field {
  width: 100%;
  background-color: var(--atomic-docs-background-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  margin: 8px 0;
  border: 1px solid var(--atomic-docs-border-color, rgba(0, 0, 0, 0.23));
}

.atomic-docs-input-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 12px;
}

.atomic-docs-prepend-icon, .atomic-docs-append-icon {
  font-size: var(--atomic-docs-font-size-md, 18px);
  color: var(--atomic-docs-text-secondary, rgba(0, 0, 0, 0.54));
}

.atomic-docs-append-icon {
  cursor: pointer;
}

.atomic-docs-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 8px;
  font-size: 14px;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
  background-color: transparent;
}
</style>
