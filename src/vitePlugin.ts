// src/plugins/component-documentation/src/vitePlugin.ts
import type { Plugin } from 'vite';

export function atomicDocsVitePlugin(options = { forceConfig: false }): Plugin {
  return {
    name: 'atomic-docs-vite-plugin',
    config(config) {
      // Ensure optimizeDeps exists
      config.optimizeDeps = config.optimizeDeps || {};
      
      // If optimizeDeps is disabled and we're not forcing configuration
      if (config.optimizeDeps.disabled === true && !options.forceConfig) {
        // Respect user's choice, but log a warning
        console.warn(
          '[atomic-docs] Warning: optimizeDeps.disabled is set to true in your Vite config. ' +
          'This may cause issues with Vue components. ' +
          'Consider using optimizeDeps.exclude: ["vue"] instead, or pass ' +
          '{ forceConfig: true } to atomicDocsVitePlugin to override.'
        );
        return config;
      }
      
      // Set exclude to include 'vue' if it doesn't already
      config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
      if (Array.isArray(config.optimizeDeps.exclude) && !config.optimizeDeps.exclude.includes('vue')) {
        config.optimizeDeps.exclude.push('vue');
      }
      
      // Only remove disabled if we're forcing config or it wasn't explicitly set
      if (options.forceConfig && config.optimizeDeps.disabled === true) {
        config.optimizeDeps.disabled = false;
      }
      
      return config;
    }
  };
}