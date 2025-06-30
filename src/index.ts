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
function loadConfigFile() {
  if (!isNode || !fs || !path) {
    console.log('[ComponentDocsPlugin] Config file loading skipped in browser environment');
    return {};
  }

  try {
    // Use dynamic import to load the config file from the consuming app's directory
    const configPath = path.join(process.cwd(), 'atomic-docs.config.js');
    if (fs.existsSync(configPath)) {
      console.log(`[ComponentDocsPlugin] Loading configuration from ${configPath}`);
      const config = require(configPath);
      const rawConfig = config.default || config;

      // Map manifest generator options to plugin options
      const mappedConfig = { ...rawConfig };

      // Map componentsDir to componentsDirName if not already set
      if (rawConfig.componentsDir && !rawConfig.componentsDirName) {
        mappedConfig.componentsDirName = rawConfig.pluginComponentsBaseName || 'components';
      }

      // Map examplesDir to examplesDirName if not already set
      if (rawConfig.examplesDir && !rawConfig.examplesDirName) {
        mappedConfig.examplesDirName = rawConfig.pluginExamplesBaseName || 'component-examples';
      }

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
  install(app: App, userOptions: ComponentDocOptions = {
    componentModules: {},
    exampleModules: {},
    componentsDirName: "",
    examplesDirName: ""
  }) {
    try {
      // Load options from config file
      const fileOptions = loadConfigFile();

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
      let manifestModules = {};
      try {
        // Determine the manifest path from fileOptions or use default
        const manifestPath = fileOptions.output || 'src/atomic-docs-manifest.ts';

        if (isNode && fs && path) {
          const manifestFullPath = path.join(process.cwd(), manifestPath);

          if (fs.existsSync(manifestFullPath)) {
            console.log(`[ComponentDocsPlugin] Attempting to load modules from manifest: ${manifestFullPath}`);
            // Dynamic import would be ideal, but require is more reliable in this context
            const manifest = require(manifestFullPath);

            if (manifest) {
              manifestModules = {
                componentModules: manifest.componentModules || {},
                exampleModules: manifest.exampleModules || {},
                rawComponentSourceModules: manifest.rawComponentSourceModules || {}
              };
              console.log(`[ComponentDocsPlugin] Successfully loaded modules from manifest`);
            }
          }
        } else {
          console.log('[ComponentDocsPlugin] Manifest loading skipped in browser environment');
        }
      } catch (error) {
        console.warn(`[ComponentDocsPlugin] Could not load modules from manifest: ${error.message}`);
      }

      // Merge options, with precedence: defaults < manifest < fileOptions < userOptions
      const options = {
        componentModules: {},
        componentsDirName: "",
        exampleModules: {},
        examplesDirName: "",
        ...manifestModules,
        ...fileOptions,
        ...userOptions
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
      } = options;

      if (!enableDocs) return;

      // Validate required options with detailed feedback
      const missingOptions = [];
      if (!componentModules || Object.keys(componentModules).length === 0) missingOptions.push('componentModules');
      if (!exampleModules || Object.keys(exampleModules).length === 0) missingOptions.push('exampleModules');
      if (!componentsDirName) missingOptions.push('componentsDirName');
      if (!examplesDirName) missingOptions.push('examplesDirName');

      if (missingOptions.length > 0) {
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
