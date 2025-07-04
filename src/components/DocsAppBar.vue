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
        <DocsComponentFilter
          input-variant="solo"
          background-color="background"
          :close-on-click="false"
        />

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
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from "vue-router";
import DocsComponentFilter from "@/components/DocsComponentFilter.vue";

// Define props and emits
const props = defineProps<{
  isDark: boolean
}>();

const emit = defineEmits<{
  (e: 'toggle-theme', value: boolean): void
  (e: 'toggle-drawer'): void
}>();

const route = useRoute();

// Computed property to check if the current route is 'componentDocs'
const isComponentDocsRoute = computed(() => {
  return (route.name as any) === 'componentDocs';
});

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
  z-index: 1000; /* Ensure it stays above other content */
  display: flex;
  align-items: center;
  height: var(--atomic-docs-appbar-height);
  width: 100%;
  padding: 0 16px 0 0;
}

.atomic-docs-app-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.atomic-docs-app-bar-title {
  width: var(--atomic-docs-drawer-width);
  height: 100%;
  //background: var(--atomic-docs-primary-color);
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: red;
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
  font-size: var(--atomic-docs-font-size-xl, 18px);
  //color: white;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

.atomic-docs-title-text {
  font-size: 20px;
  font-weight: 500;
  //color: white;
  color: var(--atomic-docs-text-primary, rgba(0, 0, 0, 0.87));
}

.atomic-docs-app-bar-actions {
  display: flex;
  align-items: center;
}


.atomic-docs-theme-toggle {
  display: flex;
  align-items: center;
  margin-right: 16px;
  margin-left: 16px;
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
