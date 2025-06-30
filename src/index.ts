// src/index.ts

import { App, Plugin, Component, createApp } from 'vue';
import ExampleComponent from './components/DocsExampleComponent.vue';
import DocsComponentIndex from './views/DocsComponentIndex.vue';
import { ComponentDocPlugin, ComponentDocOptions } from './types';
import routesConfig from './routes';
import { createRouter, createWebHistory } from 'vue-router';
import './styles';
// Check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

// Conditionally import Node.js modules
let fs: any = null;
let path: any = null;
if (isNode) {
  // Only import in Node environment
  // Using dynamic imports to prevent Vite from processing these during build
  try {
    fs = require('fs');
    path = require('path');
  } catch (e) {
    console.warn('[ComponentDocsPlugin] Node.js modules not available:', e);
  }
}

// Centralized constants
const DOCS_MOUNT_ID = 'atomic-docs-app';
const DOCS_ROUTE_PREFIX = '/atomic-docs';

// Function to load config from atomic-docs.config.js if it exists
async function loadConfigFile() {
  console.log('[ComponentDocsPlugin] DEBUG: Starting loadConfigFile function');

  // If we're in a browser environment, try to fetch config from the API
  if (!isNode || !fs || !path) {
    console.log('[ComponentDocsPlugin] Attempting to load config from API in browser environment');
    try {
      const response = await fetch('http://localhost:3000/api/atomic-docs/config');
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const config = await response.json();
      console.log('[ComponentDocsPlugin] Successfully loaded config from API:', config);
      return config;
    } catch (error) {
      console.warn(`[ComponentDocsPlugin] Error loading config from API: ${error.message}`);
      console.log('[ComponentDocsPlugin] Config file loading skipped in browser environment');
      return {};
    }
  }

  try {
    // Use dynamic import to load the config file from the consuming app's directory
    const configPath = path.join(process.cwd(), 'atomic-docs.config.js');
    console.log(`[ComponentDocsPlugin] DEBUG: Looking for config at ${configPath}`);

    if (fs.existsSync(configPath)) {
      console.log(`[ComponentDocsPlugin] Loading configuration from ${configPath}`);
      const config = require(configPath);
      console.log(`[ComponentDocsPlugin] DEBUG: Raw config loaded:`, config);

      const rawConfig = config.default || config;
      console.log(`[ComponentDocsPlugin] DEBUG: Processed rawConfig:`, rawConfig);

      // Map manifest generator options to plugin options
      const mappedConfig = { ...rawConfig };
      console.log(`[ComponentDocsPlugin] DEBUG: Initial mappedConfig:`, mappedConfig);

      // Map componentsDir to componentsDirName if not already set
      if (rawConfig.componentsDir && !rawConfig.componentsDirName) {
        console.log(`[ComponentDocsPlugin] DEBUG: Mapping componentsDir to componentsDirName using pluginComponentsBaseName:`, rawConfig.pluginComponentsBaseName);
        mappedConfig.componentsDirName = rawConfig.pluginComponentsBaseName || 'components';
      }

      // Map examplesDir to examplesDirName if not already set
      if (rawConfig.examplesDir && !rawConfig.examplesDirName) {
        console.log(`[ComponentDocsPlugin] DEBUG: Mapping examplesDir to examplesDirName using pluginExamplesBaseName:`, rawConfig.pluginExamplesBaseName);
        mappedConfig.examplesDirName = rawConfig.pluginExamplesBaseName || 'component-examples';
      }

      console.log(`[ComponentDocsPlugin] DEBUG: Final mappedConfig:`, mappedConfig);
      return mappedConfig;
    }
  } catch (error) {
    console.warn(`[ComponentDocsPlugin] Error loading config file: ${error.message}`);
  }
  return {};
}

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
  async install(app: App, userOptions: ComponentDocOptions = {
    componentModules: {},
    exampleModules: {},
    componentsDirName: "",
    examplesDirName: ""
  }) {
    console.log('[ComponentDocsPlugin] DEBUG: Starting plugin installation');
    console.log('[ComponentDocsPlugin] DEBUG: User options provided:', userOptions);

    try {
      // Load options from config file
      console.log('[ComponentDocsPlugin] DEBUG: Loading options from config file');
      const fileOptions = await loadConfigFile();
      console.log('[ComponentDocsPlugin] DEBUG: File options loaded:', fileOptions);

      // Check for conflicting options and warn if found
      if (Object.keys(fileOptions).length > 0 && Object.keys(userOptions).length > 0) {
        const conflictingKeys = Object.keys(fileOptions).filter(key =>
          key in userOptions && JSON.stringify(fileOptions[key]) !== JSON.stringify(userOptions[key])
        );

        if (conflictingKeys.length > 0) {
          console.warn(
            `[ComponentDocsPlugin] Warning: The following options are defined both in atomic-docs.config.js and plugin options: ${conflictingKeys.join(', ')}. ` +
            `The explicitly provided options will take precedence.`
          );
        }
      }

      // Try to load component and example modules from the manifest if not provided
      console.log('[ComponentDocsPlugin] DEBUG: Attempting to load modules from manifest');
      let manifestModules = {};
      try {
        // Determine the manifest path from fileOptions or use default
        const manifestPath = fileOptions.output || 'src/atomic-docs-manifest.ts';
        console.log(`[ComponentDocsPlugin] DEBUG: Manifest path from config: ${manifestPath}`);

        if (isNode && fs && path) {
          const manifestFullPath = path.join(process.cwd(), manifestPath);
          console.log(`[ComponentDocsPlugin] DEBUG: Full manifest path: ${manifestFullPath}`);

          console.log(`[ComponentDocsPlugin] DEBUG: Checking if manifest exists at: ${manifestFullPath}`);
          if (fs.existsSync(manifestFullPath)) {
            console.log(`[ComponentDocsPlugin] Attempting to load modules from manifest: ${manifestFullPath}`);
            // Dynamic import would be ideal, but require is more reliable in this context
            try {
              console.log(`[ComponentDocsPlugin] DEBUG: Requiring manifest file`);
              const manifest = require(manifestFullPath);
              console.log(`[ComponentDocsPlugin] DEBUG: Manifest loaded:`, manifest);

              if (manifest) {
                console.log(`[ComponentDocsPlugin] DEBUG: Extracting modules from manifest`);
                console.log(`[ComponentDocsPlugin] DEBUG: Component modules in manifest:`, Object.keys(manifest.componentModules || {}).length);
                console.log(`[ComponentDocsPlugin] DEBUG: Example modules in manifest:`, Object.keys(manifest.exampleModules || {}).length);

                manifestModules = {
                  componentModules: manifest.componentModules || {},
                  exampleModules: manifest.exampleModules || {},
                  rawComponentSourceModules: manifest.rawComponentSourceModules || {}
                };
                console.log(`[ComponentDocsPlugin] Successfully loaded modules from manifest`);
              } else {
                console.warn(`[ComponentDocsPlugin] DEBUG: Manifest file exists but content is invalid or empty`);
              }
            } catch (requireError) {
              console.error(`[ComponentDocsPlugin] DEBUG: Error requiring manifest file: ${requireError.message}`);
              throw requireError;
            }
          } else {
            console.warn(`[ComponentDocsPlugin] DEBUG: Manifest file does not exist at ${manifestFullPath}`);
          }
        } else {
          // In browser environment, try to fetch manifest modules from API
          console.log('[ComponentDocsPlugin] Attempting to load manifest modules from API in browser environment');
          try {
            const response = await fetch('http://localhost:3000/api/atomic-docs/manifest-modules');
            if (!response.ok) {
              throw new Error(`API responded with status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.modules) {
              console.log('[ComponentDocsPlugin] Successfully loaded manifest modules from API');

              // Convert the module strings to actual functions
              const convertModulesToFunctions = (modules: Record<string, string>) => {
                const result: Record<string, () => Promise<any>> = {};
                for (const [key, value] of Object.entries(modules)) {
                  // Create a function from the string representation
                  // This is a simplified approach - in a real implementation, you might want to
                  // use a more secure method to evaluate the code
                  try {
                    // Use Function constructor to create a function from the string
                    result[key] = new Function(`return ${value}`)() as () => Promise<any>;
                  } catch (error) {
                    console.warn(`[ComponentDocsPlugin] Error converting module to function: ${error.message}`);
                  }
                }
                return result;
              };

              manifestModules = {
                componentModules: convertModulesToFunctions(data.modules.componentModules),
                exampleModules: convertModulesToFunctions(data.modules.exampleModules),
                rawComponentSourceModules: convertModulesToFunctions(data.modules.rawComponentSourceModules)
              };

              console.log('[ComponentDocsPlugin] Successfully converted manifest modules to functions');
            } else {
              console.warn('[ComponentDocsPlugin] API returned unsuccessful response or missing modules');
            }
          } catch (fetchError) {
            console.warn(`[ComponentDocsPlugin] Error fetching manifest modules from API: ${fetchError.message}`);
          }
        }
      } catch (error) {
        console.warn(`[ComponentDocsPlugin] Could not load modules from manifest: ${error.message}`);
        console.error(`[ComponentDocsPlugin] DEBUG: Full error:`, error);
      }

      // Merge options, with precedence: defaults < manifest < fileOptions < userOptions
      console.log('[ComponentDocsPlugin] DEBUG: Merging options from different sources');
      console.log('[ComponentDocsPlugin] DEBUG: Default options:', {
        componentModules: {},
        componentsDirName: "",
        exampleModules: {},
        examplesDirName: ""
      });
      console.log('[ComponentDocsPlugin] DEBUG: Manifest modules:', manifestModules);
      console.log('[ComponentDocsPlugin] DEBUG: File options:', fileOptions);
      console.log('[ComponentDocsPlugin] DEBUG: User options:', userOptions);

      const options = {
        componentModules: {},
        componentsDirName: "",
        exampleModules: {},
        examplesDirName: "",
        ...manifestModules,
        ...fileOptions,
        ...userOptions
      };

      console.log('[ComponentDocsPlugin] DEBUG: Final merged options:', options);

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
      } = options;

      console.log('[ComponentDocsPlugin] DEBUG: Destructured options:');
      console.log('[ComponentDocsPlugin] DEBUG: componentModules:', componentModules ? Object.keys(componentModules).length : 'undefined');
      console.log('[ComponentDocsPlugin] DEBUG: componentsDirName:', componentsDirName);
      console.log('[ComponentDocsPlugin] DEBUG: exampleModules:', exampleModules ? Object.keys(exampleModules).length : 'undefined');
      console.log('[ComponentDocsPlugin] DEBUG: examplesDirName:', examplesDirName);
      console.log('[ComponentDocsPlugin] DEBUG: enableDocs:', enableDocs);

      if (!enableDocs) {
        console.log('[ComponentDocsPlugin] DEBUG: enableDocs is false, exiting installation');
        return;
      }

      // Validate required options with detailed feedback
      console.log('[ComponentDocsPlugin] DEBUG: Validating required options');
      const missingOptions = [];

      if (!componentModules || Object.keys(componentModules).length === 0) {
        console.log('[ComponentDocsPlugin] DEBUG: Missing componentModules');
        missingOptions.push('componentModules');
      }

      if (!exampleModules || Object.keys(exampleModules).length === 0) {
        console.log('[ComponentDocsPlugin] DEBUG: Missing exampleModules');
        missingOptions.push('exampleModules');
      }

      if (!componentsDirName) {
        console.log('[ComponentDocsPlugin] DEBUG: Missing componentsDirName');
        missingOptions.push('componentsDirName');
      }

      if (!examplesDirName) {
        console.log('[ComponentDocsPlugin] DEBUG: Missing examplesDirName');
        missingOptions.push('examplesDirName');
      }

      if (missingOptions.length > 0) {
        console.log(`[ComponentDocsPlugin] DEBUG: Missing options detected: ${missingOptions.join(', ')}`);
        console.error(`[ComponentDocsPlugin] Initialization failed: Missing required options: ${missingOptions.join(', ')}.`);
        console.error(`[ComponentDocsPlugin] To fix this issue:
  1. Make sure atomic-docs.config.js exists in your project root
  2. Run the manifest generator script to create the manifest file
  3. Or provide these options explicitly when installing the plugin

  Example atomic-docs.config.js:
  module.exports = {
    output: 'src/atomic-docs-manifest.ts',
    componentsDir: 'src/components',
    examplesDir: 'src/component-examples',
    componentsDirName: 'components',
    examplesDirName: 'component-examples'
  }`);
        return;
      }

      console.log('[ComponentDocsPlugin] DEBUG: All required options are present, continuing initialization');

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
      console.error('[ComponentDocsPlugin] ERROR: Plugin failed to initialize:', error);
      console.error('[ComponentDocsPlugin] DEBUG: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      console.error('[ComponentDocsPlugin] DEBUG: If the error is related to missing options, make sure your atomic-docs.config.js has the correct property names:');
      console.error('[ComponentDocsPlugin] DEBUG: - componentsDirName (not pluginComponentsBaseName)');
      console.error('[ComponentDocsPlugin] DEBUG: - examplesDirName (not pluginExamplesBaseName)');
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
