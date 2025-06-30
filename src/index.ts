// src/index.ts

import { App, Plugin, Component, createApp } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes';
import { createRouter, createWebHistory } from 'vue-router';
import './styles';

// Import the manifest data
import {
  components,
  exampleComponents,
  componentModules as importedComponentModules,
  rawComponentSourceModules as importedRawComponentSourceModules,
  exampleModules as importedExampleModules
} from './atomic-docs-manifest';

// Import the config file
let configOptions = {};
try {
  // First try to import as ES module
  import('../atomic-docs.config.js')
    .then(config => {
      configOptions = config.default || config;
    })
    .catch(() => {
      // If ES module import fails, try CommonJS require
      try {
        configOptions = require('../atomic-docs.config.js');
      } catch (e) {
        console.warn('Could not load atomic-docs.config.js', e);
      }
    });
} catch (e) {
  console.warn('Could not load atomic-docs.config.js', e);
}

// Centralized constants
const DOCS_MOUNT_ID = 'atomic-docs-app';
const DOCS_ROUTE_PREFIX = '/atomic-docs';

export function convertPathToExampleName(path: string): string {
  if (!path) return '';
  try {
    return 'Example' + path.replace(/ /g, '-')
      .replace(/\.vue/g, '')
      .split('/')
      .map((part) => part
        .split('-')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join('')
        .trim()
      ).join('')
      .trim();
  } catch {
    return 'ExampleComponent';
  }
}

function createDocsAppMountPoint(): HTMLElement {
  let existing = document.getElementById(DOCS_MOUNT_ID);
  if (existing) return existing;
  const mountPoint = document.createElement('div');
  mountPoint.id = DOCS_MOUNT_ID;
  document.body.appendChild(mountPoint);
  return mountPoint;
}

function toggleElementDisplay(el: HTMLElement | null, show: boolean) {
  if (el) {
    el.style.display = show ? '' : 'none';
  }
}

const componentDocsPlugin: Plugin<[ComponentDocOptions]> = {
  install(app: App, options: Partial<ComponentDocOptions> = {}) {
    try {
      // Merge provided options with config file options
      const mergedOptions: ComponentDocOptions = {
        // Default values
        componentsDirName: "components",
        examplesDirName: "component-examples",
        componentModules: {},
        exampleModules: {},
        rawComponentSourceModules: {},

        // Values from config file
        ...configOptions,

        // User-provided options (highest priority)
        ...options
      };

      // Use the imported values from the manifest
      const finalOptions = {
        ...mergedOptions,
        componentModules: importedComponentModules,
        exampleModules: importedExampleModules,
        rawComponentSourceModules: importedRawComponentSourceModules
      };

      const {
        componentModules,
        componentsDirName,
        exampleModules,
        examplesDirName,
        rawComponentSourceModules,
        plugins,
        enableDocs,
        mainAppID,
        globalComponents,
        autoRegisterComponents,
        history: customHistory,
      } = finalOptions;

      if (!enableDocs) return;

      // Validate required options
      if (!componentModules || !exampleModules || !componentsDirName || !examplesDirName) {
        console.error('Component docs plugin initialization failed: Missing required options.');
        return;
      }

      const plugin: ComponentDocPlugin = {
        convertPathToExampleName,
        componentModules,
        componentsDirName,
        examplesDirName,
        exampleModules,
        rawComponentSourceModules,
        options: finalOptions as ComponentDocOptions
      };

      // Provide plugin to main app intentionally
      app.provide('componentDocPlugin', plugin);

      // Initialize docs app
      const docsApp = createApp(DocsComponentIndex);
      const docsRouter = createRouter({
        history: customHistory || createWebHistory(),
        routes: routesConfig
      });

      if (plugins?.length) {
        plugins.forEach(p => docsApp.use(p));
      }

      if (globalComponents) {
        Object.entries(globalComponents).forEach(([name, component]) => {
          docsApp.component(name, component);
        });
      }

      if (autoRegisterComponents) {
        const mainAppComponents = app._context?.components;
        Object.entries(mainAppComponents || {}).forEach(([name, component]) => {
          if (
            !['RouterLink', 'RouterView', 'ExampleComponentUsage'].includes(name) &&
            !docsApp._context.components[name]
          ) {
            docsApp.component(name, component);
          }
        });
      }

      docsApp.provide('componentDocPlugin', plugin);
      docsApp.use(docsRouter);
      docsApp.component('ExampleComponentUsage', ExampleComponent as Component);

      const mountPoint = createDocsAppMountPoint();
      docsApp.mount(mountPoint);

      let mainAppContainer: HTMLElement | null = null;

      const toggleDocs = (show: boolean) => {
        const docsElement = document.getElementById(DOCS_MOUNT_ID);

        if (!mainAppContainer) {
          // 1️⃣ If mainAppID is provided, try to find it
          if (mainAppID) {
            mainAppContainer = document.getElementById(mainAppID);
            if (!mainAppContainer) {
              console.error(
                `[ComponentDocsPlugin] mainAppID "${mainAppID}" was provided but no matching element was found in the DOM.`
              );
              return; // Exit early if explicit mainAppID fails
            }
          }
          // 2️⃣ If mainAppID is NOT provided, try multiple fallback strategies
          else {
            // Strategy 1: Try app._container
            const rootEl = app._container as HTMLElement;
            if (rootEl && rootEl.nodeType === Node.ELEMENT_NODE) {
              console.warn(
                '[ComponentDocsPlugin] mainAppID not provided; falling back to root component container. Consider specifying mainAppID in options for reliable behavior.'
              );
              mainAppContainer = rootEl;
            }
            // Strategy 2: Try common Vue app container IDs
            else {
              const commonIds = ['app', '#app', 'main', 'root'];
              for (const id of commonIds) {
                const element = document.getElementById(id.replace('#', ''));
                if (element) {
                  console.warn(
                    `[ComponentDocsPlugin] mainAppID not provided and app._container unavailable; falling back to element with id "${id}". Consider specifying mainAppID in options for reliable behavior.`
                  );
                  mainAppContainer = element;
                  break;
                }
              }
            }

            // If all strategies failed
            if (!mainAppContainer) {
              console.error(
                '[ComponentDocsPlugin] Could not determine main app container. app._container is:',
                app._container,
                'Available elements with common IDs:',
                ['app', 'main', 'root'].map(id => document.getElementById(id)).filter(Boolean),
                'Please provide mainAppID in plugin options to enable toggling visibility.'
              );
              return;
            }
          }
        }

        toggleElementDisplay(docsElement, show);
        toggleElementDisplay(mainAppContainer, !show);
      };

      const router = app.config.globalProperties?.$router;

      if (router?.beforeEach) {
        router.beforeEach((to, _from, next) => {
          const isDocsRoute = to.path.startsWith(DOCS_ROUTE_PREFIX);
          toggleDocs(isDocsRoute);
          if (isDocsRoute && docsRouter.currentRoute.value.fullPath !== to.fullPath) {
            docsRouter.push(to.fullPath).catch(() => {});
          }
          next();
        });
      } else {
        console.warn('Component docs plugin: Vue Router not found in main app. Skipping route sync.');
      }

      toggleDocs(false);

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
