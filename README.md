# Atomic Docs Vue Plugin

A Vue 3 plugin for automatically generating a live, interactive documentation site for your component library.

## Features

- **Automatic Prop-Type Documentation**: Generates a props table for your components automatically.
- **Interactive Component Playground**: Provides an isolated area to render and interact with your components.
- **Source Code Viewer**: Includes tabs to view the `<template>`, `<script>`, and `<style>` blocks of your components.
- **Live Color Palette**: Displays a grid of your design system's colors.
- **Component Search**: Quickly filter and find components.
- **Light & Dark Mode**: Switch between themes on the fly.
- **Style Isolation**: Renders your components in a wrapper to prevent style conflicts with the documentation UI itself.
- **Vite Build-Optimization Plugin**: An optional helper plugin to prevent common Vite build issues.
- **Zero-Config Routing**: Automatically handles all documentation routes without needing changes to your app's router.

## Installation

```bash
npm install vue-atomic-docs
```

## Usage

### 1. Configure the Plugin

In your application's entry file (e.g., `main.ts`), import and use the plugin. It's crucial to `app.use(router)` **before** you use the documentation plugin.

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import yourAppRoutes from './router'; // Your app's routes

import componentDocsPlugin from 'vue-atomic-docs';

const app = createApp(App);

// 1. Create and use your application's router first
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: yourAppRoutes,
});
app.use(router);

// 2. Configure and use the documentation plugin
app.use(componentDocsPlugin, {
  // Recommended: only enable docs in development
  enableDocs: import.meta.env.DEV,

  // --- Required Options ---
  // Vite glob import for your source components
  componentModules: import.meta.glob('./components/**/*.vue'),
  // The directory name for your components
  componentsDirName: 'components',
  // Vite glob import for your component example files
  exampleModules: import.meta.glob('./component-examples/**/*.vue'),
  // The directory name for your examples
  examplesDirName: 'component-examples',

  // --- Optional Options ---
  // Vite glob import to get raw source code for the code viewer
  rawComponentSourceModules: import.meta.glob('./components/**/*.vue', { as: 'raw' }),
  // Provide your design system colors for the color palette viewer
  colors: [
    { name: 'Primary', color: '#1976d2' },
    { name: 'Secondary', color: '#424242' },
  ],
  // Automatically register all of your app's global components in the docs
  autoRegisterComponents: true,
  // See all options in the table below
});

app.mount('#app');
```

### 2. (Optional) Add the Vite Plugin

To prevent issues where Vue can be bundled twice, it's recommended to add our helper plugin to your Vite configuration.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { atomicDocsVitePlugin } from 'vue-atomic-docs';

export default defineConfig({
  plugins: [
    vue(),
    atomicDocsVitePlugin(), // Add the plugin here
  ],
});
```

#### A Note on Imports in vite.config.ts

Your `vite.config.ts` file is run by Node.js. Depending on your project's module type, you might encounter an error with the direct named import shown above. If you do, use the following syntax for better compatibility:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// Use default import and destructure from the resulting object
import pkg from 'vue-atomic-docs';
const { atomicDocsVitePlugin } = pkg;

export default defineConfig({
  plugins: [
    vue(),
    atomicDocsVitePlugin(),
  ],
});
```

This method works reliably with both CommonJS and ESM module formats.

### 3. Create Component Examples

For each component you want to document, create a corresponding `.vue` file in your examples directory.

For a component at `src/components/MyButton.vue`, create its example at `src/examples/MyButton.vue`.

Inside the example file, use the globally available `<ExampleComponentUsage>` component to display your component and its documentation.

```vue
<!-- src/examples/MyButton.vue -->
<template>
  <ExampleComponentUsage
    :component="MyButton"
    description="This is a standard button used for primary actions."
  >
    <!-- The default slot is the interactive playground -->
    <template #default>
      <MyButton @click="onClick">Click Me!</MyButton>
    </template>

    <!-- You can optionally override the generated docs tables -->
    <template #props>
      <p>This will replace the props table.</p>
    </template>
  </ExampleComponentUsage>
</template>

<script setup lang="ts">
// Import the component you are documenting
import MyButton from '../components/MyButton.vue';

function onClick() {
  alert('Button clicked!');
}
</script>
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `enableDocs` | `boolean` | No | `process.env.NODE_ENV === 'development'` | Toggles the entire plugin on or off. |
| `componentModules` | `Record<string, () => Promise<any>>` | Yes | `undefined` | A Vite glob import of your source components. |
| `componentsDirName` | `string` | Yes | `''` | The name of your components directory (e.g., 'components'). |
| `exampleModules` | `Record<string, () => Promise<any>>` | Yes | `undefined` | A Vite glob import of your documentation example files. |
| `examplesDirName` | `string` | Yes | `''` | The name of your examples directory (e.g., 'examples'). |
| `rawComponentSourceModules` | `Record<string, () => Promise<string>>` | No | `undefined` | A Vite glob import for raw source code ({ as: 'raw' }). Required for the source code viewer. |
| `colors` | `Array<{ name: string, color: string }>` | No | `[]` | An array of color objects for the color palette. |
| `history` | `RouterHistory` | No | `createWebHistory()` | An optional vue-router history instance if you need to share history state. |
| `plugins` | `Plugin[]` | No | `[]` | An array of other Vue plugins (like Vuetify, Pinia) to install into the documentation app instance. |
| `globalComponents` | `Record<string, Component>` | No | `{}` | A map of components to register globally within the documentation app. |
| `autoRegisterComponents` | `boolean` | No | `false` | If true, the plugin will attempt to register all of your main app's global components automatically. |
| `componentFont` | `string` | No | `system-ui` | A CSS font-family string to apply to the component isolation wrapper. |

## Routing

The plugin handles its own routing automatically. When you navigate to `/component-docs`, the plugin will show its UI and hide your main app's content to prevent overlap. When you navigate away, your app will reappear. You do not need to add any routes to your main application's router.

## CSS Styling and Customization

The plugin uses a robust CSS isolation approach to prevent style conflicts. All documentation styles are contained within the `.atomic-docs` namespace and use CSS custom properties (variables) for theming.

You can easily customize the appearance by overriding these variables in your own CSS.

```css
/* In your application's main CSS file */
.atomic-docs {
  /* Override color variables */
  --atomic-docs-primary-color: #ff5722;
  --atomic-docs-background-color: #f8f8f8;

  /* Override font variables */
  --atomic-docs-font-family: 'Your Custom Font', sans-serif;
}
```

For a complete list of variables and a more detailed guide, see the [CSS Styling Guide](http://docs.google.com/src/styles/README.md).

## License

MIT