# Atomic Docs Vue Plugin

A Vue 3 plugin for building beautiful, interactive documentation sites for your component libraries – with zero config.

---

## Features

- ⚡ **Automatic Prop & Type Tables**
- 🛠️ **Interactive Component Playground**
- 🗂️ **Source Code Viewer** (`<template>`, `<script>`, `<style>`)
- 🎨 **Design System Color Palette**
- 🔍 **Component Search**
- 🌙 **Light/Dark Mode**
- 🧩 **Style Isolation**
- 🚦 **Zero-Config Routing**
- 🛡️ **Vite Build Helper Plugin**

---

## Quick Start

### 1. Install

```bash
npm install vue-atomic-docs
```

### 2. Setup in your entry file (e.g. main.ts)

```typescript
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import yourAppRoutes from './router';
import componentDocsPlugin from 'vue-atomic-docs';

const app = createApp(App);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: yourAppRoutes,
});
app.use(router);

app.use(componentDocsPlugin, {
  enableDocs: import.meta.env.DEV,
  componentModules: import.meta.glob('./components/**/*.vue'),
  componentsDirName: 'components',
  exampleModules: import.meta.glob('./component-examples/**/*.vue'),
  examplesDirName: 'component-examples',
  // ...more options below
});

app.mount('#app');
```

### 3. (Optional) Add the Vite Plugin

To avoid double-bundling Vue, add the helper plugin:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { atomicDocsVitePlugin } from 'vue-atomic-docs';

export default defineConfig({
  plugins: [
    vue(),
    atomicDocsVitePlugin(),
  ],
});
```

If you encounter import issues in Vite config (CommonJS/ESM), use:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from 'vue-atomic-docs';
const { atomicDocsVitePlugin } = pkg;

export default defineConfig({
  plugins: [
    vue(),
    atomicDocsVitePlugin(),
  ],
});
```

## Documenting Components

For each component (`/components/MyButton.vue`), create an example file (`/component-examples/MyButton.vue`):

```vue
<template>
  <ExampleComponentUsage :component="MyButton" description="Standard button">
    <template #default>
      <MyButton @click="onClick">Click Me!</MyButton>
    </template>
    <!-- Optionally: override generated docs tables -->
    <template #props>
      <p>This will replace the props table.</p>
    </template>
  </ExampleComponentUsage>
</template>

<script setup lang="ts">
import MyButton from '../components/MyButton.vue';
function onClick() { alert('Button clicked!'); }
</script>
```

## Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `enableDocs` | boolean | No | `process.env.NODE_ENV === 'development'` | Enable or disable docs UI |
| `componentModules` | object | Yes | – | Vite glob import for your components |
| `componentsDirName` | string | Yes | – | Name of your components directory |
| `exampleModules` | object | Yes | – | Vite glob import for example files |
| `examplesDirName` | string | Yes | – | Name of your examples directory |
| `rawComponentSourceModules` | object | No | – | Vite glob import for raw source code |
| `colors` | array | No | `[]` | Design system color objects |
| `autoRegisterComponents` | boolean | No | `false` | Register all app global components |
| `history` | object | No | `createWebHistory()` | Provide your own Vue Router history |
| `plugins` | array | No | `[]` | Plugins (Vuetify, Pinia, etc) |
| `globalComponents` | object | No | `{}` | Register specific globals in docs app |
| `componentFont` | string | No | `system-ui` | Font family in isolation wrapper |

## Routing

Atomic Docs handles its own routes and will display the docs UI at `/component-docs`. When you navigate away, your main app resumes as normal.

## Styling & Customization

All docs UI styles are namespaced under `.atomic-docs`. Easily theme the docs by overriding CSS variables:

```css
.atomic-docs {
  --atomic-docs-primary-color: #ff5722;
  --atomic-docs-background-color: #f8f8f8;
  --atomic-docs-font-family: 'Your Custom Font', sans-serif;
}
```

See the [CSS Styling Guide](#) for a complete list of variables and advanced theming tips.

## Troubleshooting

- **Vite Build Issues**: Use the Vite helper plugin to avoid double-bundling Vue.
- **Style Conflicts**: All styles are namespaced, but you can increase specificity or override CSS variables as needed.
- **Examples Not Showing**: Ensure your example file names and paths match your configuration.

## Contributing

Pull requests and issues are welcome. Please open an issue for bugs or feature requests before submitting a PR.

## License

MIT

## Links

- [CSS Styling Guide](#)
- [npm package](#)