// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { rawSourcesPlugin } from './src/vite-raw-sources-plugin'; // Path to your new plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    rawSourcesPlugin({
      // This MUST be an absolute path to the directory containing the .vue components
      // whose raw source you want to make available.
      // Example: If your components are in 'vue-component-docs-plugin/src/components/'
      componentsDir: path.resolve(__dirname, 'src/components'),

      // This MUST be an absolute path to the base directory that should be stripped
      // from the component file paths to create the keys in rawSourcesMap.
      // The resulting keys (e.g., 'ui/MyButton.vue') must match the
      // 'props.relativePath' used in DocsExampleComponent.vue.
      // Example: If componentsDir is '.../src/components' and you want keys like 'ui/MyButton.vue',
      // then basePathToRemove should also be '.../src/components'.
      basePathToRemove: path.resolve(__dirname, 'src/components'),
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VueComponentDocsPlugin',
      fileName: (format) => `vue-component-docs-plugin.${format}.js`,
      formats: ['es', 'umd', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
        exports: 'named',
        assetFileNames: (assetInfo) => {
          return assetInfo.name ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});