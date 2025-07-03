// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts'; // Import the dts plugin

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    dts({ // Configure vite-plugin-dts
      outDir: 'dist', // Output directory for d.ts files
      insertTypesEntry: true, // Will insert `types` field into package.json automatically (optional, but good)
      tsconfigPath: './tsconfig.build.json', // Point to your build tsconfig
      staticImport: true, // Ensures imports are not dynamic
      rollupTypes: true, // Crucial: bundles all types into a single .d.ts file
    })
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VueComponentDocsPlugin',
      fileName: (format) => `vue-atomic-docs.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
        exports: 'named',
        assetFileNames: 'assets/[name]-[hash][extname]',
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