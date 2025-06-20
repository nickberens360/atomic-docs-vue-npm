import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin()
  ],
  build: {
    sourcemap: true, // Optional: include source maps for easier debugging
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VueComponentDocsPlugin', // Global variable name for UMD build
      // the proper extensions will be added
      fileName: (format) => `vue-atomic-docs.${format}.js`,
      formats: ['es', 'umd', 'cjs'] // Generate ESM, UMD, and CJS formats
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'vue-router'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
        // This ensures the default export is the main export for UMD/CJS
        exports: 'named', // Keeping this as 'named' per your provided file
        // assetFileNames is less relevant for CSS when cssCodeSplit is false,
        // but can still be used for other assets like images or fonts if any.
        assetFileNames: (assetInfo) => {
          // This condition for 'style.css' will no longer be met if CSS is inlined.
          // if (assetInfo.name === 'style.css') return 'vue-atomic-docs.css';
          return assetInfo.name ?? 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: false, // <--- This line inlines CSS into the JS bundles
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
