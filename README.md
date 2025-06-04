# Vue Component Docs Plugin

A Vue 3 plugin designed to automatically generate documentation for your components, making it easier to visualize and interact with them during development.

## Features

* **Automatic Component Discovery:** Finds `.vue` components within your specified components directory.

* **Interactive Examples:** Allows you to create usage examples for each component.

* **Props, Events & Slots Display:** (Partially Implemented) Aims to parse and display information about component props. *Note: Event and slot parsing is currently under development.*

* **Dedicated Documentation UI:** Provides a view within your application (typically at `/component-docs`) to browse and interact with component documentation.

* **Template Source Display:** Shows the raw template source code of your components with syntax highlighting using Prism.js. This helps developers understand the component's structure and usage.

* **Helper Components:** Includes UI components like sliders and color pickers to facilitate interactive examples.

* **Configurable:** Offers options to customize directory names and enable/disable the documentation UI.

## Installation

```bash
npm install vue-component-docs-plugin
# or
yarn add vue-component-docs-plugin
# or
pnpm add vue-component-docs-plugin
```
## Dependencies

This plugin has the following `peerDependencies`, which you should already have in your Vue 3 project:

* `vue`: ^3.2.0
* `vue-router`: ^4.0.0

It also includes the following dependencies:

* `prismjs`: For syntax highlighting of component template source code

## Setup

1. **Register the Plugin in your Vue App:**

   In your main application file (e.g., `main.ts` or `main.js`):

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Your Vue router instance
import componentDocsPlugin, { routes as componentDocsRoutes } from 'vue-component-docs-plugin';

// Import your component and example modules
// Vite's import.meta.glob is a common way to do this:
const componentModules = import.meta.glob('@/components/**/*.vue');
const exampleModules = import.meta.glob('@/component-examples/**/*.vue'); // Or your example directory

// New import for raw component sources
const rawComponentSourceModules = import.meta.glob('@/components/**/*.vue', { as: 'raw' });

const app = createApp(App);
app.use(router);

// Register the component documentation plugin
app.use(componentDocsPlugin, {
  enableDocs: process.env.NODE_ENV === 'development', // Recommended: enable only in dev
  componentsDirName: 'components', // Name of your main components directory (relative to alias)
  componentModules: componentModules, // Pass the imported component modules
  examplesDirName: 'component-examples', // Name of your examples directory (relative to alias)
  exampleModules: exampleModules, // Pass the imported example modules
  rawComponentSourceModules: rawComponentSourceModules, // New option for displaying raw source code
});

app.mount('#app');
```
2. **Add Documentation Routes to Your Router:**

You need to integrate the plugin's routes into your Vue Router setup.

```typescript
// In your router/index.ts or router.js
import { createRouter, createWebHistory } from 'vue-router';
import { routes as componentDocsRoutes } from 'vue-component-docs-plugin';

const routes = [
  // ... your existing application routes...
  componentDocsRoutes, // Add the plugin's routes
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
```
The documentation will typically be available at the `/component-docs` path in your application.

3. **Project Structure (Assumptions & Configuration):**

By default, the plugin assumes:

* Your components are located in a directory specified by `componentsDirName` (e.g., `src/components`).

* Your component examples are in a directory specified by `examplesDirName` (e.g., `src/component-examples`).

* You are using a path alias (like `@`) that points to your `src` directory.

You **must** provide the `componentModules` and `exampleModules` options, which are typically generated using `import.meta.glob` as shown in the setup example. These allow the plugin to dynamically load your components and their examples.

## Documenting a Component

1. **Create Your Component:**
   Place your component in the directory specified by `componentsDirName` (e.g., `src/components/MyButton.vue`).

2. **Create an Example File:**
   Create a corresponding example file in the directory specified by `examplesDirName`. The path within this directory should mirror the path of the component.

* For `src/components/ui/MyButton.vue`, the example would be `src/component-examples/ui/MyButton.vue`.

3. **Write the Example using `<ExampleComponentUsage>`:**
   The plugin provides a global component `ExampleComponentUsage` to structure your examples.

   <!-- Description slot: Explain what the component does -->
   <template #description>
     <p>This is a versatile button component that supports various colors and emits a click event.</p>
   </template>

   <!-- Actions slot: Add controls to interact with your component's props -->
   <template #actions>
     <div>
       <label for="labelInput">Button Label:</label>
       <input type="text" id="labelInput" v-model="buttonLabel" />
     </div>
     <div>
       <label for="colorSelect">Button Color:</label>
       <select id="colorSelect" v-model="buttonColor">
         <option value="blue">Blue</option>
         <option value="green">Green</option>
         <option value="red">Red</option>
       </select>
     </div>
     <p>Last clicked: {{ clickCount }} times</p>
   </template>
 </ExampleComponentUsage>

* **`#default` slot:** This is where you render an instance of the component you are documenting.

* **`#description` slot:** Provide a brief explanation of the component's purpose and functionality.

* **`#actions` slot:** This is crucial for interactivity. Add input fields, selects, or other controls that modify the props of your component example in real-time. This helps users understand how different props affect the component.

## Plugin Configuration Options

When calling `app.use(componentDocsPlugin, options)`, you can pass the following options:

| Option | Type | Required | Default | Description | 
| ----- | ----- | ----- | ----- | ----- | 
| `enableDocs` | `boolean` | No | `process.env.NODE_ENV === 'development'` | Toggles the documentation UI. Recommended to be enabled only during development. | 
| `componentModules` | `Record<string, () => Promise<any>>` | Yes | `undefined` | An object of component modules, typically generated using `import.meta.glob('@/your-components-dir/**/*.vue')`. | 
| `componentsDirName` | `string` | Yes | `""` | The name of your main components directory (e.g., "components") relative to your source alias (e.g., `@`). | 
| `exampleModules` | `Record<string, () => Promise<any>>` | Yes | `undefined` | An object of example modules, typically generated using `import.meta.glob('@/your-examples-dir/**/*.vue')`. | 
| `examplesDirName` | `string` | Yes | `""` | The name of your examples directory (e.g., "component-examples") relative to your source alias. | 
| `rawComponentSourceModules` | `Record<string, () => Promise<string>>` | No | `undefined` | An object of raw component source modules, typically generated using `import.meta.glob('@/your-components-dir/**/*.vue', { as: 'raw' })`. Used to display the template source code. |

## Provided UI Components

The plugin also exports a few UI components that you can use within your application or for creating more complex examples:

* `DocsSlider`

* `DocsColorPicker`

* `DocsMenu`

* `DocsChip`

You can import them directly from the plugin:

```typescript
import { DocsSlider, DocsColorPicker, DocsMenu, DocsChip } from 'vue-component-docs-plugin';
```

These components can be used in your examples or anywhere in your application.

## Testing

This plugin uses Vitest for testing. The following test commands are available (run from the plugin's root directory if you are developing the plugin itself):

* `npm test` or `pnpm test`: Run all tests once.

* `npm run test:watch` or `pnpm test:watch`: Run tests in watch mode.

* `npm run test:coverage` or `pnpm test:coverage`: Run tests with a coverage report.

* `npm run test:ui` or `pnpm test:ui`: Run tests with the Vitest UI interface.

### Vitest UI

Vitest UI provides a graphical interface for running and debugging tests.

1. Run `npm run test:ui` (or `pnpm test:ui`).

2. A browser window will open with the Vitest UI.

3. Use the interface to run specific tests, view results, and debug.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on the [GitHub repository](https://github.com/nickberens360/atomic-docs-vue-npm).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/nickberens360/atomic-docs-vue-npm/blob/main/LICENSE) file for details.
