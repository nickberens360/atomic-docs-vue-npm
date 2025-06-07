import { App, Plugin, Component, createApp } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes'; // Import routes with a clear name
import { createRouter, createWebHistory } from 'vue-router';
import './styles';

/**
 * Converts path to example name - preserves original logic exactly
 */
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

// Create a separate mount point for the docs app
function createDocsAppMountPoint(): HTMLElement {
  const mountPoint = document.createElement('div');
  mountPoint.id = 'atomic-docs-app';
  document.body.appendChild(mountPoint);
  return mountPoint;
}

const componentDocsPlugin: Plugin<[ComponentDocOptions]> = {
  install(app: App, options: ComponentDocOptions = {
    componentModules: undefined,
    componentsDirName: "",
    exampleModules: undefined,
    examplesDirName: ""
  }) {
    try {
      const componentModules = options?.componentModules;
      const componentsDirName = options?.componentsDirName;
      const exampleModules = options?.exampleModules;
      const examplesDirName = options?.examplesDirName;
      const rawComponentSourceModules = options?.rawComponentSourceModules; // New option
      const enableDocs = options?.enableDocs ?? (process.env.NODE_ENV === 'development'); // Enable by default in dev

      // Add early return if docs are disabled
      if (!enableDocs) {
        console.log('Component documentation plugin is disabled.');
        return;
      }
      console.log('Component documentation plugin initializing...');
      if (!componentModules) {
        throw new Error('componentModules is required');
      }
      if (!exampleModules) {
        throw new Error('exampleModules is required');
      }
      if (!options.componentsDirName) {
        throw new Error('componentsDirName is required');
      }
      if (!options.examplesDirName) {
        throw new Error('examplesDirName is required');
      }

      const plugin: ComponentDocPlugin = {
        convertPathToExampleName,
        componentModules,
        componentsDirName,
        examplesDirName,
        exampleModules,
        rawComponentSourceModules, // Add the new property
        options
      };

      // Register components in the main app for potential reuse
      app.component('ExampleComponentUsage', ExampleComponent as Component);

      // Create a separate Vue app for documentation
      const docsApp = createApp(DocsComponentIndex);

      // Create a separate router for the docs app
      const docsRouter = createRouter({
        history: options.history || createWebHistory(), // Use the history from options
        routes: routesConfig
      });

      // Provide the plugin to the docs app
      docsApp.provide('componentDocPlugin', plugin);
      docsApp.use(docsRouter);
      docsApp.component('ExampleComponentUsage', ExampleComponent as Component);

      // Mount the docs app to a separate DOM element
      const mountPoint = createDocsAppMountPoint();
      docsApp.mount(mountPoint);

      // Add a method to toggle docs visibility
      const toggleDocs = (show: boolean) => {
        const docsElement = document.getElementById('atomic-docs-app');
        if (docsElement) {
          docsElement.style.display = show ? 'block' : 'none';
        }
      };

      // Listen for route changes in the main app
      app.config.globalProperties.$router.beforeEach((to, from, next) => {
        // Check if the route is a component docs route
        const isDocsRoute = to.path.startsWith('/component-docs');
        toggleDocs(isDocsRoute);

        // If it's a docs route, navigate in the docs router too
        if (isDocsRoute) {
          docsRouter.push(to.fullPath);
        }

        next();
      });

      // Initially hide the docs app
      toggleDocs(false);

      console.log('Component documentation plugin installed successfully.');

    } catch (error) {
      console.error('Component docs plugin failed to initialize:', error);
      // Don't throw - allow app to continue
    }
  }
};

export default componentDocsPlugin; // Default export for app.use()
export { routesConfig as routes }; // Named export for routes
export { default as DocsSlider } from './components/DocsSlider.vue';
export { default as DocsColorPicker } from './components/DocsColorPicker.vue';
export { default as DocsMenu } from './components/DocsMenu.vue';
export { default as DocsChip } from './components/DocsChip.vue';
export { default as DocsTabs } from './components/DocsTabs.vue';
export { default as DocsColors } from './components/DocsColors.vue';
