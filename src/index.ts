import { App, Plugin, Component } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue'; // Adjust path if needed
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes'; // Import routes with a clear name

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
  install(app: App, options: ComponentDocOptions = {}) {
    try {
      // Get modules with fallbacks (preserve original logic)
      // Note: import.meta.glob is Vite-specific. If consumers don't use Vite,
      // this part might need adjustment or clear documentation.
      // For a library, it's often better if the consumer provides these modules.
      const componentModules = options?.componentModules || import.meta.glob('@/components/**/*.vue');
      const exampleModules = options?.exampleModules || import.meta.glob('@/component-examples/**/*.vue');
      const enableDocs = options?.enableDocs ?? (process.env.NODE_ENV === 'development'); // Enable by default in dev

      // Add early return if docs are disabled
      if (!enableDocs) {
        console.log('Component documentation plugin is disabled.');
        return;
      }
      console.log('Component documentation plugin initializing...');


      // Extract paths safely but preserve original logic
      const componentFirstPath = getFirstModulePath(componentModules);
      const exampleFirstPath = getFirstModulePath(exampleModules);

      // Replicate original path parsing logic exactly
      let componentPath: string | undefined;
      let componentsDirName: string;

      if (componentFirstPath) {
        // Example path: /src/components/MyComponent.vue or projects/my-lib/src/components/Comp.vue
        // We want to find the 'components' part.
        const segments = componentFirstPath.split('/');
        const componentsIndex = segments.lastIndexOf('components');
        if (componentsIndex > -1 && componentsIndex > 0) {
          componentsDirName = segments[componentsIndex];
          componentPath = segments.slice(segments.indexOf(componentsDirName) -1, componentsIndex +1).join('/');
        } else {
          componentsDirName = 'components'; // Fallback
        }
      } else {
        componentsDirName = 'components';
      }

      let examplePath: string | undefined;
      let examplesDirName: string;

      if (exampleFirstPath) {
        const segments = exampleFirstPath.split('/');
        const examplesIndex = segments.lastIndexOf('component-examples');
        if (examplesIndex > -1 && examplesIndex > 0) {
          examplesDirName = segments[examplesIndex];
          examplePath = segments.slice(segments.indexOf(examplesDirName) -1, examplesIndex +1).join('/');
        } else {
          examplesDirName = 'component-examples'; // Fallback
        }
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
      // Ensure DocsExampleComponent.vue is correctly imported and registered
      // If it's a .vue file, Vue will handle it as a component object.
      app.component('ExampleComponentUsage', ExampleComponent as Component);
      console.log('Component documentation plugin installed successfully.');

    } catch (error) {
      console.error('Component docs plugin failed to initialize:', error);
      // Don't throw - allow app to continue
    }
  }
};

export default componentDocsPlugin; // Default export for app.use()
export { routesConfig as routes }; // Named export for routes
// convertPathToExampleName is already exported above
