<template>
  <header class="atomic-docs-app-bar">
    <div class="atomic-docs-app-bar-content">
      <div class="atomic-docs-app-bar-title">
        <button
          class="atomic-docs-nav-icon-button"
          @click="toggleDrawer"
        >
          <span class="atomic-docs-nav-icon">☰</span>
        </button>
        <span class="atomic-docs-title-text">🚀 Atomic Docs</span>
      </div>

      <div class="atomic-docs-app-bar-actions">
        <div
          class="atomic-docs-search-container"
        >
          <div class="atomic-docs-text-field">
            <div class="atomic-docs-input-wrapper">
              <span class="atomic-docs-prepend-icon">🔍</span>
              <input
                v-model="filterText"
                name="filter-list"
                placeholder="Search Components"
                class="atomic-docs-input"
                autocomplete="one-time-code"
                @focus="handleInputFocus"
                @blur="handleInputBlur"
              >
              <span
                v-if="filterText"
                class="atomic-docs-append-icon"
                @click="filterText = ''"
              >
                ✕
              </span>
            </div>
          </div>

          <div class="atomic-docs-menu-container">
            <div
              v-show="isMenuOpen"
              class="atomic-docs-menu"
            >
              <DocsComponentNavigation
                :filter-text="filterText"
                :on-nav-click="handleNavClick"
                bg-color="surface"
              />
            </div>
          </div>
        </div>

        <div class="atomic-docs-theme-toggle">
          <span class="atomic-docs-theme-icon">
            {{ props.isDark ? '🌙' : '☀️' }}
          </span>
          <label class="atomic-docs-switch">
            <input
              type="checkbox"
              :checked="props.isDark"
              @change="toggleTheme(($event.target as HTMLInputElement).checked)"
            >
            <span class="atomic-docs-slider" />
          </label>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from "vue-router";
import DocsComponentNavigation from "./DocsComponentNavigation.vue";
import { ComponentItem } from '../types';

// Define props and emits
const props = defineProps<{
  isDark: boolean
}>();

const emit = defineEmits<{
  (e: 'toggle-theme', value: boolean): void
  (e: 'toggle-drawer'): void
}>();

const router = useRouter();
const route = useRoute();
const filterText = ref('');
const isMenuOpen = ref(false);

// Computed property to check if the current route is 'componentDocs'
const isComponentDocsRoute = computed(() => {
  return (route.name as any) === 'componentDocs';
});

function handleNavClick(arg: ComponentItem): void {
  router.push({
    name: 'componentDoc' as any,
    params: { componentName: arg.exampleComponent },
    query: { relativePath: arg.relativePath }
  });
  isMenuOpen.value = false;
}

// Function to toggle the drawer and rail
function toggleDrawer() {
  emit('toggle-drawer');
}

// Function to toggle the theme
function toggleTheme(value: boolean | null) {
  // If value is null, default to false or keep the current value
  const isDarkValue = value !== null ? value : false;

  // Emit the theme change event
  emit('toggle-theme', isDarkValue);

  // No direct DOM manipulation - theme will be handled by class binding in parent
}

// Handle input focus and blur events
const handleInputFocus = () => {
  isMenuOpen.value = true;
};

const handleInputBlur = () => {
  // Small delay to allow for clicking on menu items
  setTimeout(() => {
    isMenuOpen.value = false;
  }, 200);
};

// No event listeners needed for onMounted and onUnmounted
onMounted(() => {
  // No direct DOM manipulation for theme initialization
});

onUnmounted(() => {
  // No event listeners to remove
});
</script>

<style scoped lang="scss">
.atomic-docs-app-bar {
  position: fixed; /* Fixed positioning on mobile */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  //box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
  height: var(--atomic-docs-appbar-height);
  width: 100%;
  //background-color: var(--atomic-docs-surface-color-dark, #f5f5f5);
  padding: 0 16px;
}

.atomic-docs-app-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.atomic-docs-app-bar-title {
  display: flex;
  align-items: center;
}

.atomic-docs-nav-icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;
  border-radius: var(--atomic-docs-border-radius-sm, 4px);

  &:hover {
    background-color: var(--atomic-docs-hover-color, rgba(0, 0, 0, 0.04));
  }
}

.atomic-docs-nav-icon {
  font-size: var(--atomic-docs-font-size-md, 18px);
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

.atomic-docs-title-text {
  font-size: 20px;
  font-weight: 500;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

.atomic-docs-app-bar-actions {
  display: flex;
  align-items: center;
}

.atomic-docs-search-container {
  position: relative;
  margin-right: 16px;
}

.atomic-docs-text-field {
  width: 300px;
  background-color: var(--atomic-docs-surface-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  box-shadow: var(--atomic-docs-shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
}

.atomic-docs-input-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 12px;
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
  //background-color: transparent;
}

.atomic-docs-menu-container {
  position: relative;
}

.atomic-docs-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  max-height: 80vh; /* Limit height to 80% of viewport height */
  overflow-y: auto; /* Enable vertical scrolling */
  background-color: var(--atomic-docs-surface-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  box-shadow: var(--atomic-docs-shadow-md, 0 4px 8px rgba(0, 0, 0, 0.1));
  z-index: 100;
  margin-top: 4px;
}

.atomic-docs-theme-toggle {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.atomic-docs-theme-icon {
  margin-right: 8px;
  font-size: var(--atomic-docs-font-size-lg, 20px);
}

/* Custom switch styling */
.atomic-docs-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.atomic-docs-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.atomic-docs-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--atomic-docs-text-secondary, #ccc);
  transition: .4s;
  border-radius: 20px;
}

.atomic-docs-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: var(--atomic-docs-surface-color, white);
  transition: .4s;
  border-radius: 50%;
}

input:checked + .atomic-docs-slider {
  background-color: var(--atomic-docs-primary-color, #2196F3);
}

input:checked + .atomic-docs-slider:before {
  transform: translateX(20px);
}

</style>
