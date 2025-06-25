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
import { ref, computed, inject, provide, watch, onUnmounted } from 'vue'; // Added watch, onUnmounted
import { useRouter, useRoute } from 'vue-router';
import DocsAppBar from '../components/DocsAppBar.vue';
import DocsAppNavigationDrawer from '../components/DocsAppNavigationDrawer.vue';
import DocsComponentNavigation from '../components/DocsComponentNavigation.vue';
import DocsRow from '../components/DocsRow.vue';
import DocsCol from '../components/DocsCol.vue';
import DocsMain from '../components/DocsMain.vue';
import DocsTextField from '../components/DocsTextField.vue';
import DocsIcon from '../components/DocsIcon.vue';
import DocsMenu from '../components/DocsMenu.vue';
import DocsMarkdown from '../components/DocsMarkdown.vue';
import { ComponentDocPlugin } from '../types';
// Import base styles
import '../styles';
// Import README content
import readmeContent from '../../README.md?raw';

// Import the ComponentItem interface from the types used in ComponentNavigation
interface ComponentItem {
  type: 'component';
  label: string;
  relativePath: string;
  exampleComponent: string;
}

const router = useRouter();
const route = useRoute();
const filterText = ref<string>('');
// Inject the componentDocPlugin
const componentDocPlugin = inject<ComponentDocPlugin | undefined>('componentDocPlugin');

const isDocsEnabled = computed(() => !!componentDocPlugin);

// Local state for theme and navigation
const isDark = ref(false);

// Provide isDark globally
provide('isDark', isDark);

const isRailOpen = ref(false);
const isNavDrawerOpen = ref(true);

// Reactive reference to the currently active Prism theme stylesheet link element
const activePrismThemeStylesheet = ref<HTMLLinkElement | null>(null);

// Watch for changes in isDark to dynamically load/unload Prism themes
watch(isDark, async (newValue) => {
  // Remove previous theme stylesheet if it exists
  if (activePrismThemeStylesheet.value) {
    document.head.removeChild(activePrismThemeStylesheet.value);
    activePrismThemeStylesheet.value = null;
  }

  // Dynamically import the correct theme stylesheet URL
  const themeUrl = newValue
    ? (await import('prismjs/themes/prism-okaidia.css?url')).default
    : (await import('prismjs/themes/prism-solarizedlight.css?url')).default;

  // Create and append the new link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = themeUrl;
  document.head.appendChild(link);
  activePrismThemeStylesheet.value = link;
}, { immediate: true }); // Run immediately on component mount

// On component unmount, remove the active stylesheet to clean up
onUnmounted(() => {
  if (activePrismThemeStylesheet.value) {
    document.head.removeChild(activePrismThemeStylesheet.value);
    activePrismThemeStylesheet.value = null;
  }
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

function handleNavClick(arg: ComponentItem): void {
  router.push({
    name: 'componentDoc' as any,
    params: { componentName: arg.exampleComponent },
    query: { relativePath: arg.relativePath }
  });
}
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