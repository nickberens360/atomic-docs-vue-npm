import { App, Plugin, Component } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';

/**
 * Safely gets first key from modules object
 */
function getFirstModulePath(modules: Record<string, unknown>): string | null {
  const keys = Object.keys(modules);
  return keys.length > 0 ? keys[0] : null;
}

/**
 * Converts path to example name - preserves original logic exactly
 */
function convertPathToExampleName(path: string): string {
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

const componentDocs: Plugin<[ComponentDocOptions]> = {
  install(app: App, options: ComponentDocOptions = {}) {
    try {
      // Get modules with fallbacks (preserve original logic)
      const componentModules = options?.componentModules || import.meta.glob('@/components/**/*.vue');
      const exampleModules = options?.exampleModules || import.meta.glob('@/component-examples/**/*.vue');
      const enableDocs = options?.enableDocs ?? true;
      console.log('enableDocs', enableDocs);
      // Add early return if docs are disabled
      if (!enableDocs) return;

      // Extract paths safely but preserve original logic
      const componentFirstPath = getFirstModulePath(componentModules);
      const exampleFirstPath = getFirstModulePath(exampleModules);

      // Replicate original path parsing logic exactly
      let componentPath: string | undefined;
      let componentsDirName: string;

      if (componentFirstPath) {
        componentPath = componentFirstPath.split('/').slice(1, -1).join('/');
        console.log('componentPath', componentPath);
        componentsDirName = componentPath.split('/')[1] || 'components';
      } else {
        componentsDirName = 'components';
      }

      let examplePath: string | undefined;
      let examplesDirName: string;

      if (exampleFirstPath) {
        examplePath = exampleFirstPath.split('/').slice(1, -1).join('/');
        examplesDirName = examplePath.split('/')[1] || 'component-examples';
      } else {
        examplesDirName = 'component-examples';
      }
      const plugin: ComponentDocPlugin = {
        convertPathToExampleName,
        componentModules,
        componentsDirName,
        examplesDirName,
        exampleModules,
        options
      };

      app.provide('componentDocPlugin', plugin);
      app.component('ExampleComponentUsage', ExampleComponent as unknown as Component);

    } catch (error) {
      console.error('Component docs plugin failed to initialize:', error);
      // Don't throw - allow app to continue
    }
  }
};

export default componentDocs;
export { convertPathToExampleName };