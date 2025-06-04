import { App, Plugin, Component } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes'; // Import routes with a clear name

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

      app.provide('componentDocPlugin', plugin);
      app.component('ExampleComponentUsage', ExampleComponent as Component)
        .component('DocsComponentIndex', DocsComponentIndex as Component);
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
