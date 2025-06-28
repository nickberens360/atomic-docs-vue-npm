// src/index.ts

import { App, Plugin, Component, createApp } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes';
import { createRouter, createWebHistory } from 'vue-router';
import './styles';

export function convertPathToExampleName(path: string): string {
  if (!path) return '';
  try {
    return 'Example' + path.replace(/ /g, '-')
      .replace(/\.vue/g, '')
      .split('/')
      .map((part) => {
        return part.split('-')
          .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
          .join('')
          .trim();
      }).join('')
      .trim();
  } catch {
    return 'ExampleComponent';
  }
}

function createDocsAppMountPoint(): HTMLElement {
  const mountPoint = document.createElement('div');
  mountPoint.id = 'atomic-docs-app';
  document.body.appendChild(mountPoint);
  return mountPoint;
}

// Define a list of all internal component names from your plugin
// This list is crucial for the autoRegisterComponents feature to prevent recursion.
// Ensure this list is exhaustive. Add any other components if they are internal to atomic-docs.
const internalDocsComponents = [
  'RouterLink', // Typically provided by Vue Router
  'RouterView', // Typically provided by Vue Router
  'ExampleComponentUsage',
  'DocsAppBar',
  'DocsAppNavigationDrawer',
  'DocsAccordion',
  'DocsComponentNavigation',
  'DocsRecursiveNavItem',
  'DocsComponentNotDocumented',
  'DocsMain',
  'DocsMarkdown',
  'DocsRow',
  'DocsCol',
  'DocsDataTable',
  'DocsTabs',
  'DocsSourceCode',
  'DocsComponentIsolation',
  'DocsCopyToClipboard',
  'DocsTextField',
  'DocsSlider',
  'DocsMenu',
  'DocsChip',
  'DocsColors',
  'DocsColorPicker',
  'DocsIcon',
  // Add any other Vue component names that are part of your atomic-docs plugin
];


const componentDocsPlugin: Plugin<[ComponentDocOptions]> = {
  install(app: App, options: ComponentDocOptions = {
    componentModules: {},
    componentsDirName: "",
    exampleModules: {},
    examplesDirName: ""
  }) {
    try {
      const componentModules = options?.componentModules;
      const componentsDirName = options?.componentsDirName;
      const exampleModules = options?.exampleModules;
      const examplesDirName = options?.examplesDirName;
      const rawComponentSourceModules = options?.rawComponentSourceModules;
      const plugins = options?.plugins;
      const enableDocs = options?.enableDocs;

      if (!enableDocs) {
        return;
      }
      if (!componentModules) {
        console.error('Component docs plugin failed to initialize: componentModules is required');
        return;
      }
      if (!exampleModules) {
        console.error('Component docs plugin failed to initialize: exampleModules is required');
        return;
      }
      if (!componentsDirName) {
        console.error('Component docs plugin failed to initialize: componentsDirName is required');
        return;
      }
      if (!examplesDirName) {
        console.error('Component docs plugin failed to initialize: examplesDirName is required');
        return;
      }

      const plugin: ComponentDocPlugin = {
        convertPathToExampleName,
        componentModules,
        componentsDirName,
        examplesDirName,
        exampleModules,
        rawComponentSourceModules,
        options
      };

      app.provide('componentDocPlugin', plugin);

      const docsApp = createApp(DocsComponentIndex);
      const docsRouter = createRouter({
        history: options.history || createWebHistory(),
        routes: routesConfig
      });

      if (plugins && Array.isArray(plugins)) {
        plugins.forEach(plugin => {
          docsApp.use(plugin);
        });
      }

      if (options.globalComponents) {
        Object.entries(options.globalComponents).forEach(([name, component]) => {
          docsApp.component(name, component);
        });
      }

      if (options.autoRegisterComponents) {
        const mainAppComponents = app._context.components;
        if (mainAppComponents) {
          Object.entries(mainAppComponents).forEach(([name, component]) => {
            // Filter out components that are part of the atomic-docs plugin itself
            if (!internalDocsComponents.includes(name) &&
              (!docsApp._context.components || !docsApp._context.components[name])) {
              docsApp.component(name, component);
            }
          });
        }
      }

      docsApp.provide('componentDocPlugin', plugin);
      docsApp.use(docsRouter);
      docsApp.component('ExampleComponentUsage', ExampleComponent as Component);

      const mountPoint = createDocsAppMountPoint();
      docsApp.mount(mountPoint);


      let mainAppContainer: HTMLElement | null = null;


      console.log('options.mainAppID', options.mainAppID);

      const toggleDocs = (show: boolean) => {
        const docsElement = document.getElementById('atomic-docs-app');

        if (!mainAppContainer) {
          // First try to find the container by ID if mainAppID is provided
          if (options.mainAppID) {
            mainAppContainer = document.getElementById(options.mainAppID);
          }

          // Fall back to the current method if mainAppID is not provided or element not found
          if (!mainAppContainer) {
            mainAppContainer = app._container as HTMLElement;
          }
        }

        if (docsElement) {
          docsElement.style.display = show ? 'block' : 'none';
        }

        if (mainAppContainer) {
          if (show) {
            // When showing docs, hide the main app
            mainAppContainer.style.display = 'none';
          } else {
            // When hiding docs, always ensure the main app is visible
            mainAppContainer.style.display = ''; // Use empty string to reset to default display value
          }
        }
      };

      // --- MODIFICATION START ---

      // Get the initial path from the main app's router
      const initialPath = app.config.globalProperties.$router.currentRoute.value.fullPath;
      const isInitialDocsRoute = initialPath.startsWith('/atomic-docs');

      // Immediately toggle visibility based on the initial route
      toggleDocs(isInitialDocsRoute);

      // If it's an initial docs route, explicitly push it to the docsRouter
      // to ensure content renders right away on direct page load/refresh.
      if (isInitialDocsRoute) {
        docsRouter.push(initialPath).catch(() => { /* handle errors or log */ });
      }

      // Existing beforeEach hook for *subsequent* navigations (client-side transitions)
      app.config.globalProperties.$router.beforeEach((to, _from, next) => {
        const isDocsRoute = to.path.startsWith('/atomic-docs');
        toggleDocs(isDocsRoute);
        if (isDocsRoute && docsRouter.currentRoute.value.fullPath !== to.fullPath) {
          docsRouter.push(to.fullPath).catch(() => {
            // It's good practice to handle potential navigation failures.
            // In this case, we can safely ignore them.
          });
        }
        next();
      });

      // --- MODIFICATION END ---


    } catch (error) {
      console.error('Component docs plugin failed to initialize:', error);
    }
  }
};

export default componentDocsPlugin;
export { routesConfig as routes };
export { default as DocsSlider } from './components/DocsSlider.vue';
export { default as DocsColorPicker } from './components/DocsColorPicker.vue';
export { default as DocsMenu } from './components/DocsMenu.vue';
export { default as DocsChip } from './components/DocsChip.vue';
export { default as DocsTabs } from './components/DocsTabs.vue';
export { default as DocsColors } from './components/DocsColors.vue';
export { default as DocsMarkdown } from './components/DocsMarkdown.vue';
export { atomicDocsVitePlugin } from './vitePlugin';