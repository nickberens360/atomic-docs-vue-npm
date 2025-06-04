import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'; // Import the commonjs plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteCommonjs(), // Add the commonjs plugin HERE
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
      fileName: (format) => `vue-component-docs-plugin.${format}.js`,
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
          // if (assetInfo.name === 'style.css') return 'vue-component-docs-plugin.css';
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
    // Add conditions to help resolve packages like esm-resolve
    // 'node' condition might be helpful for CJS packages.
    // Vite's default conditions usually include 'import', 'module'.
    // Adding 'node' or ensuring 'require' can be handled (often via the commonjs plugin) is key.
    conditions: ['node', 'import', 'module'],
  },
  // Explicitly include problematic CJS dependencies in optimizeDeps
  // This can help Vite's pre-bundling process handle them correctly.
  optimizeDeps: {
    include: ['esm-resolve', 'vue-docgen-api'],
  },
});
