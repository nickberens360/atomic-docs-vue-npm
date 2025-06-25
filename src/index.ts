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
      const rawComponentSourceModules = options?.rawComponentSourceModules;
      const plugins = options?.plugins;
      const enableDocs = options?.enableDocs;

      if (!enableDocs) {
        return;
      }
      if (!componentModules) throw new Error('componentModules is required');
      if (!exampleModules) throw new Error('exampleModules is required');
      if (!componentsDirName) throw new Error('componentsDirName is required');
      if (!examplesDirName) throw new Error('examplesDirName is required');

      const plugin: ComponentDocPlugin = {
        convertPathToExampleName,
        componentModules,
        componentsDirName,
        examplesDirName,
        exampleModules,
        rawComponentSourceModules,
        options
      };

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
            if (
              !['RouterLink', 'RouterView', 'ExampleComponentUsage'].includes(name) &&
              (!docsApp._context.components || !docsApp._context.components[name])
            ) {
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

      const toggleDocs = (show: boolean) => {
        const docsElement = document.getElementById('atomic-docs-app');

        if (!mainAppContainer) {
          mainAppContainer = app._container as HTMLElement;
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


      app.config.globalProperties.$router.beforeEach((to, from, next) => {
        const isDocsRoute = to.path.startsWith('/atomic-docs');
        toggleDocs(isDocsRoute);
        if (isDocsRoute && docsRouter.currentRoute.value.fullPath !== to.fullPath) {
          docsRouter.push(to.fullPath);
        }
        next();
      });

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
export { default as DocsMarkdownMDX } from './components/DocsMarkdownMDX.vue';
export { atomicDocsVitePlugin } from './vitePlugin';
