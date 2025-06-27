<template>
  <div>
    {{isDocsEnabled}} dff
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
import { ref, computed, inject, provide, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import DocsAppBar from '../components/DocsAppBar.vue';
import DocsAppNavigationDrawer from '../components/DocsAppNavigationDrawer.vue';
import DocsRow from '../components/DocsRow.vue';
import DocsCol from '../components/DocsCol.vue';
import DocsMain from '../components/DocsMain.vue';
import DocsMarkdown from '../components/DocsMarkdown.vue';
import { ComponentDocPlugin } from '../types';
import Prism from 'prismjs';
// Import Prism themes directly
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/themes/prism-solarizedlight.css';
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
const isNavDrawerOpen = ref(true);

// Watch for changes in isDark to toggle theme classes
watch(isDark, (newValue) => {
  // Save theme preference to localStorage
  localStorage.setItem('theme', newValue ? 'dark' : 'light');

  // Apply theme by toggling a class on the document body
  if (newValue) {
    document.body.classList.add('prism-dark-theme');
    document.body.classList.remove('prism-light-theme');
  } else {
    document.body.classList.add('prism-light-theme');
    document.body.classList.remove('prism-dark-theme');
  }

  // Re-highlight all code blocks after theme change
  setTimeout(() => {
    Prism.highlightAll();
  }, 50);
}, { immediate: true }); // Run immediately on component mount

// Clean up on unmount
onUnmounted(() => {
  document.body.classList.remove('prism-dark-theme', 'prism-light-theme');
});

// Function to toggle theme
function toggleTheme(value: boolean) {
  isDark.value = value;
  // The theme class will be automatically applied through the computed property
}

// Function to toggle drawer
function toggleDrawer() {
  isRailOpen.value = !isRailOpen.value;
  isNavDrawerOpen.value = !isNavDrawerOpen.value;
}

// Computed property to check if the current route is 'componentDocs'
const isComponentDocsRoute = computed(() => {
  return (route.name as any) === 'componentDocs';
});

// Computed property for theme class
const themeClass = computed(() => {
  return isDark.value ? 'atomic-docs-app-theme--dark' : 'atomic-docs-app-theme--light';
});
</script>

<style>
html, body {
  display: unset;
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Prism theme control */
:root {
  --prism-dark-theme: 'prism-okaidia';
  --prism-light-theme: 'prism-solarizedlight';
}

/* Hide both themes by default */
:root .prism-okaidia-theme,
:root .prism-solarizedlight-theme {
  display: none;
}

/* Show the appropriate theme based on body class */
body.prism-dark-theme :root .prism-okaidia-theme {
  display: block;
}

body.prism-light-theme :root .prism-solarizedlight-theme {
  display: block;
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
  overflow: auto;
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
