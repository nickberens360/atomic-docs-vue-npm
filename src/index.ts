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
      const enableDocs = options?.enableDocs ?? (process.env.NODE_ENV === 'development');

      if (!enableDocs) {
        console.log('Component documentation plugin is disabled.');
        return;
      }
      console.log('Component documentation plugin initializing...');
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

      app.component('ExampleComponentUsage', ExampleComponent as Component);

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

      docsApp.provide('componentDocPlugin', plugin);
      docsApp.use(docsRouter);
      docsApp.component('ExampleComponentUsage', ExampleComponent as Component);

      const mountPoint = createDocsAppMountPoint();
      docsApp.mount(mountPoint);

      const toggleDocs = (show: boolean) => {
        const docsElement = document.getElementById('atomic-docs-app');
        if (docsElement) {
          docsElement.style.display = show ? 'block' : 'none';
        }
      };

      app.config.globalProperties.$router.beforeEach((to, from, next) => {
        const isDocsRoute = to.path.startsWith('/component-docs');
        toggleDocs(isDocsRoute);
        if (isDocsRoute) {
          docsRouter.push(to.fullPath);
        }
        next();
      });

      toggleDocs(false);

      console.log('Component documentation plugin installed successfully.');

    } catch (error) {
      console.error('Component docs plugin failed to initialize:', error);
      // Don't throw - allow app to continue
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
