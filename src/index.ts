// src/index.ts
import { App, Plugin, Component } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes';

// Import the Vite plugin and its options type
import { rawSourcesPlugin, RawSourcesPluginOptions as RawSourcesVitePluginOptions } from './vite-raw-sources-plugin';

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

const componentDocsPlugin: Plugin<[ComponentDocOptions]> = {
  install(app: App, options: ComponentDocOptions = {
    // Default options...
    componentModules: undefined, // Marking as possibly undefined
    componentsDirName: "",
    exampleModules: undefined, // Marking as possibly undefined
    examplesDirName: ""
  }) {
    try {
      const componentModules = options?.componentModules;
      const componentsDirName = options?.componentsDirName;
      const exampleModules = options?.exampleModules;
      const examplesDirName = options?.examplesDirName;
      // rawComponentSourceModules is now effectively superseded by the vite-raw-sources-plugin for DocsExampleComponent
      // but we can keep it in options if it's used elsewhere or for other purposes.
      const rawComponentSourceModules = options?.rawComponentSourceModules;
      const enableDocs = options?.enableDocs ?? (process.env.NODE_ENV === 'development');

      if (!enableDocs) {
        console.log('Component documentation plugin is disabled.');
        return;
      }
      console.log('Component documentation plugin initializing...');
      if (!componentModules) {
        throw new Error('componentModules option is required for componentDocsPlugin.');
      }
      if (!exampleModules) {
        throw new Error('exampleModules option is required for componentDocsPlugin.');
      }
      if (!options.componentsDirName) {
        throw new Error('componentsDirName option is required for componentDocsPlugin.');
      }
      if (!options.examplesDirName) {
        throw new Error('examplesDirName option is required for componentDocsPlugin.');
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
      app.component('ExampleComponentUsage', ExampleComponent as Component)
        .component('DocsComponentIndex', DocsComponentIndex as Component);
      console.log('Component documentation plugin installed successfully.');

    } catch (error) {
      console.error('Component docs plugin failed to initialize:', error);
    }
  }
};

export default componentDocsPlugin; // Default export for Vue plugin
export { routesConfig as routes }; // Named export for routes

// Export the Vite plugin and its options type for consumers
export { rawSourcesPlugin, RawSourcesVitePluginOptions as RawSourcesPluginOptions };

// Export other components
export { default as DocsSlider } from './components/DocsSlider.vue';
export { default as DocsColorPicker } from './components/DocsColorPicker.vue';
export { default as DocsMenu } from './components/DocsMenu.vue';
export { default as DocsChip } from './components/DocsChip.vue';
export { default as DocsTabs } from './components/DocsTabs.vue';
export { default as DocsColors } from './components/DocsColors.vue';
