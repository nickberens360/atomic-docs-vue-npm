import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true, // Optional: include source maps for easier debugging
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VueComponentDocsPlugin', // Global variable name for UMD build
      // the proper extensions will be added
      fileName: (format) => `vue-component-docs-plugin.${format}.js`,
      formats: ['es', 'umd', 'cjs'] // Generate ESM, UMD, and CJS formats
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'vue-router', 'vuetify'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          vuetify: 'Vuetify',
        },
        // Asset file names for CSS, images etc. if your components have them
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'vue-component-docs-plugin.css';
          return assetInfo.name ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
