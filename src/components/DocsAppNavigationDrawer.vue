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
        v-model="activeComponentsSection"
        :sections="navigationSections"
      >
        <!-- Static slot for the component filter -->
        <template #section-0>
          <DocsComponentFilter
            input-variant="solo"
            background-color="background"
            :close-on-click="false"
            :as-menu="false"
          />
        </template>

        <!-- The v-for loop is now cleaner, iterating over the new computed property -->
        <template v-for="section in dynamicNavigationSections" :key="section.title" #[section.slotName]>
          <!-- Loop directly over the routes that were grouped in the script -->
          <div v-for="route in section.routes" :key="route.name" class="atomic-docs-nav-item">
            <router-link
              :to="route.path"
              class="atomic-docs-nav-link"
              active-class="atomic-docs-nav-link--active"
            >
              <!-- Data comes directly from the route's 'meta' object -->
              <span class="atomic-docs-icon atomic-docs-file-icon">{{ route.meta.icon || '📄' }}</span>
              <span class="atomic-docs-title">{{ route.meta.title }}</span>
            </router-link>
          </div>
        </template>
      </DocsAccordion>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, RouteRecordRaw } from 'vue-router';
import DocsAccordion from "./DocsAccordion.vue";
import DocsComponentFilter from "@/components/DocsComponentFilter.vue";

// Initialize router
const router = useRouter();

// This computed property builds the full list of sections for the accordion component.
const navigationSections = computed(() => {
  const navigableRoutes = router.options.routes
    .flatMap(route => route.children || [])
    .filter(route => route.meta && route.meta.section);

  const groupedBySection = navigableRoutes.reduce((acc, route) => {
    const sectionTitle = route.meta.section as string;
    if (!acc[sectionTitle]) {
      acc[sectionTitle] = [];
    }
    acc[sectionTitle].push(route as RouteRecordRaw);
    return acc;
  }, {} as Record<string, RouteRecordRaw[]>);

  const dynamicSections = Object.entries(groupedBySection).map(([title, routes]) => ({
    title,
    routes,
  }));

  return [
    { title: 'Components', routes: [] },
    ...dynamicSections,
  ];
});

// ✨ NEW: This computed property prepares the dynamic sections specifically for the v-for loop.
// It handles slicing and adds the dynamic slot name needed by the template.
const dynamicNavigationSections = computed(() => {
  return navigationSections.value.slice(1).map((section, index) => ({
    ...section,
    slotName: `section-${index + 1}` // e.g., 'section-1', 'section-2'
  }));
});


// Define refs
const activeComponentsSection = ref<number | null>(); // Initialize Components section as open

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
:deep(.atomic-docs-accordion) {
  padding-left: 16px;
}
:deep(.atomic-docs-accordion__section--active) {
  max-height: 81vh;
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
  max-width: 85%;
  margin: 0 auto;
  background-color: var(--atomic-docs-background-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
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
