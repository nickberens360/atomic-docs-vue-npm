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
      <DocsMain>
        <DocsContainer fluid>
          <DocsRow
            class="h-100"
            :justify="isComponentDocsRoute ? 'center' : 'end'"
          >
            <DocsCol
              cols="12"
              md="5"
              sm="6"
              class="px-6"
            >
              <div>
                <div v-if="isComponentDocsRoute">
                  <p
                    class="docs-header-text"
                    style="line-height: .80; letter-spacing: -4px;"
                  >
                    <span style="font-size: 10vw;">Atomic</span>
                    <span
                      class="docs-title-block"
                      style="font-size: 17vw; letter-spacing: -9px;"
                    >Docs</span>
                  </p>
                  <div
                    style="height: 4px;"
                    class="docs-divider"
                  />
                </div>
                <DocsTextField
                  v-if="isComponentDocsRoute"
                  v-model="filterText"
                  name="filter-list"
                  placeholder="Search Components"
                  variant="solo"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  autocomplete="one-time-code"
                >
                  <template #append-inner>
                    <DocsIcon
                      v-if="filterText"
                      icon="mdi-close"
                      size="18"
                      @click="filterText = ''"
                    />
                  </template>
                </DocsTextField>
                <DocsMenu
                  :model-value="isComponentDocsRoute"
                  activator="parent"
                  :open-on-hover="true"
                  :open-on-focus="true"
                >
                  <DocsComponentNavigation
                    :filter-text="filterText"
                    :on-nav-click="handleNavClick"
                  />
                </DocsMenu>
              </div>
            </DocsCol>
            <DocsCol cols="12">
              <div class="content">
                <Suspense>
                  <RouterView :key="route.path" />
                  <template #fallback>
                    Loading...
                  </template>
                </Suspense>
              </div>
            </DocsCol>
          </DocsRow>
        </DocsContainer>
      </DocsMain>
    </div>
    <div v-else>
      <h2>Component documentation is not enabled.</h2>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DocsAppBar from '../components/DocsAppBar.vue';
import DocsAppNavigationDrawer from '../components/DocsAppNavigationDrawer.vue';
import DocsComponentNavigation from '../components/DocsComponentNavigation.vue';
import DocsRow from '../components/DocsRow.vue';
import DocsCol from '../components/DocsCol.vue';
import DocsMain from '../components/DocsMain.vue';
import DocsContainer from '../components/DocsContainer.vue';
import DocsTextField from '../components/DocsTextField.vue';
import DocsIcon from '../components/DocsIcon.vue';
import DocsMenu from '../components/DocsMenu.vue';
import { ComponentDocPlugin } from '../types';
// Import base styles
import '../styles';

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
const isRailOpen = ref(false);
const isNavDrawerOpen = ref(true);

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
  return isDark.value ? 'docs-app-theme--dark' : 'docs-app-theme--light';
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



<!--<style lang="scss" scoped>-->
<!--#atomic-docs-app {-->
<!--  position: fixed;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  //z-index: 2000;-->
<!--  background-color: var(&#45;&#45;atomic-docs-background-color, white);-->
<!--}-->
<!--</style>-->

<style scoped lang="scss">
.atomic-docs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--atomic-docs-background-color, white);
  border-radius: var(--atomic-docs-border-radius-sm, 4px);
  padding: var(--atomic-docs-spacing-md, 16px);
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

.docs-title-block {
  display: block;
}

.docs-header-text {
  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
}

.docs-divider {
  background-color: var(--atomic-docs-primary-color, #1976d2);
  margin-top: var(--atomic-docs-spacing-md, 16px);
  margin-bottom: var(--atomic-docs-spacing-md, 16px);
}

</style>
