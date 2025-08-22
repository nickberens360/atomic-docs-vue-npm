<template>
  <div>
    <div
      v-if="isDocsEnabled"
      class="atomic-docs"
      :class="themeClass"
    >
      <DocsAppBar
        :is-dark="isDark"
        @toggle-theme="toggleTheme"
        @toggle-drawer="toggleDrawer"
      />
      <DocsAppNavigationDrawer
        :is-rail-open="isRailOpen"
        :is-nav-drawer-open="isNavDrawerOpen"
      />
      <DocsMain fluid>
        <DocsRow
          class="h-100"
          :justify="isComponentDocsRoute ? 'center' : 'end'"
        >
          <DocsCol cols="12">
            <div class="content">
              <div
                v-if="isComponentDocsRoute"
                class="readme-content"
              >
                <DocsMarkdown :content="readmeContent" />
              </div>
              <Suspense>
                <RouterView :key="route.path" />
                <template #fallback>
                  Loading...
                </template>
              </Suspense>
            </div>
          </DocsCol>
        </DocsRow>
      </DocsMain>
    </div>
    <div v-else>
      <h2>Component documentation is not enabled.</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, provide, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import DocsAppBar from '../components/DocsAppBar.vue';
import DocsAppNavigationDrawer from '../components/DocsAppNavigationDrawer.vue';
import DocsRow from '../components/DocsRow.vue';
import DocsCol from '../components/DocsCol.vue';
import DocsMain from '../components/DocsMain.vue';
import DocsMarkdown from '../components/DocsMarkdown.vue';
import { ComponentDocPlugin } from '../types';
import Prism from 'prismjs';
// Import base styles
import '../styles';
// Import README content
import readmeContent from '../../README.md?raw';

const route = useRoute();
// Inject the componentDocPlugin
const componentDocPlugin = inject<ComponentDocPlugin | undefined>('componentDocPlugin');

const isDocsEnabled = computed(() => !!componentDocPlugin);

// Initialize theme from localStorage or default to false
const isDark = ref(localStorage.getItem('theme') === 'dark');

// Provide isDark globally
provide('isDark', isDark);

const isRailOpen = ref(false);
const isNavDrawerOpen = ref(window.innerWidth > 767);
const windowWidth = ref(window.innerWidth);

// Computed property for mobile detection
const isMobile = computed(() => windowWidth.value <= 767);

// Function to close drawer
function closeDrawer() {
  isNavDrawerOpen.value = false;
  isRailOpen.value = false;
}

// Function to toggle theme
function toggleTheme(value: boolean) {
  isDark.value = value;
  // Save theme preference to localStorage
  localStorage.setItem('theme', value ? 'dark' : 'light');
  // Re-highlight all code blocks after theme change
  // This will pick up the CSS variables from the theme classes
  setTimeout(() => {
    Prism.highlightAll();
  }, 50);
}

// Function to toggle drawer
function toggleDrawer() {
  console.log('Toggle drawer called - current state:', isNavDrawerOpen.value);
  if (windowWidth.value > 767) {
    // Desktop: toggle between fully open and rail mode
    isRailOpen.value = !isRailOpen.value;
    isNavDrawerOpen.value = !isNavDrawerOpen.value;
  } else {
    // Mobile: toggle between open overlay and closed
    isNavDrawerOpen.value = !isNavDrawerOpen.value;
    isRailOpen.value = false;
  }
  console.log('Toggle drawer - new state, rail:', isRailOpen.value, 'nav:', isNavDrawerOpen.value);
}

// Handle responsive drawer behavior
let resizeTimer: ReturnType<typeof setTimeout>;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const width = window.innerWidth;
    windowWidth.value = width;
    console.log('Resize handler - window width:', width);
    
    if (width <= 767) {
      if (isNavDrawerOpen.value) {
        isNavDrawerOpen.value = false;
        isRailOpen.value = false;
        console.log('Side drawer closed - viewport width:', width);
      }
    } else {
      if (!isNavDrawerOpen.value) {
        isNavDrawerOpen.value = true;
        isRailOpen.value = false;
        console.log('Side drawer opened - viewport width:', width);
      }
    }
  }, 100); // Debounce resize events
}

// Set up media query listener
onMounted(() => {
  console.log('Component mounted - initial width:', window.innerWidth);
  window.addEventListener('resize', handleResize);
  handleResize(); // Check initial state
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Computed property to check if the current route is 'componentDocs'
const isComponentDocsRoute = computed(() => {
  return (route.name as any) === 'componentDocs';
});

// Computed property for theme class
const themeClass = computed(() => {
  return isDark.value ? 'atomic-docs-app-theme--dark' : 'atomic-docs-app-theme--light';
});

// Initial highlighting on mount and when theme changes to ensure styles are applied
// This replaces the previous dynamic stylesheet loading logic.
watch(isDark, () => {
  // Trigger re-highlighting when theme changes to ensure Prism applies styles correctly
  setTimeout(() => {
    Prism.highlightAll();
  }, 50);
}, { immediate: true }); // Run immediately on component mount
</script>

<style>
html, body {
  display: unset;
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>

<style scoped lang="scss">
.atomic-docs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--atomic-docs-surface-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  height: 100vh;
  overflow: hidden;
}

@keyframes bounce-right {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

.bounce-right {
  display: inline-block;
  animation: bounce-right 1s ease-in-out infinite;
}

.atomic-docs-title-block {
  display: block;
}

.atomic-docs-header-text {
  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
}

.atomic-docs-divider {
  background-color: var(--atomic-docs-primary-color, #1976d2);
  margin-top: var(--atomic-docs-spacing-md, 16px);
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

.readme-content {
  max-width: 900px;
}

</style>