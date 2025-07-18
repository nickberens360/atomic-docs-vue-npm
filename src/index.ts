// src/index.ts

import { App, Plugin, Component, createApp } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'; // Import RouteRecordRaw
import './styles';

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
  install(app: App, options: ComponentDocOptions = {
    componentModules: {},
    componentsDirName: "",
    exampleModules: {},
    examplesDirName: "",
  }) {
    try {
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
        customRoutes, // ✨ NEW: Destructure the new option
      } = options;

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
        options
      };

      // Provide plugin to main app intentionally
      app.provide('componentDocPlugin', plugin);

      // Initialize docs app
      const docsApp = createApp(DocsComponentIndex);
      const docsRouter = createRouter({
        history: customHistory || createWebHistory(),
        routes: routesConfig
      });

      // ✅ NEW: Internal logic to handle the customRoutes option
      if (customRoutes && Array.isArray(customRoutes)) {
        customRoutes.forEach((route: RouteRecordRaw) => {
          docsRouter.addRoute('componentDocs', route);
        });
      }

      if (plugins?.length) {
        plugins.forEach((p: Plugin) => docsApp.use(p));
      }


      if (globalComponents) {
        Object.entries(globalComponents).forEach(([name, component]) => {
          docsApp.component(name, component as Component);
        });
      }

      if (autoRegisterComponents) {
        const mainAppComponents = app._context?.components;
        Object.entries(mainAppComponents || {}).forEach(([name, component]) => {
          if (
            !['RouterLink', 'RouterView', 'ExampleComponentUsage'].includes(name) &&
            !docsApp._context.components[name]
          ) {
            docsApp.component(name, component as Component);
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
          if (mainAppID) {
            mainAppContainer = document.getElementById(mainAppID);
            if (!mainAppContainer) {
              console.error(
                `[ComponentDocsPlugin] mainAppID "${mainAppID}" was provided but no matching element was found in the DOM.`
              );
              return;
            }
          }
          else {
            const rootEl = app._container as HTMLElement;
            if (rootEl && rootEl.nodeType === Node.ELEMENT_NODE) {
              console.warn(
                '[ComponentDocsPlugin] mainAppID not provided; falling back to root component container. Consider specifying mainAppID in options for reliable behavior.'
              );
              mainAppContainer = rootEl;
            }
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
export { default as DocsDataTable } from './components/DocsDataTable.vue';
export { default as DocsMarkdown } from './components/DocsMarkdown.vue';
export { atomicDocsVitePlugin } from './vitePlugin';