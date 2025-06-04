# Vue Component Docs Plugin

A Vue 3 plugin designed to automatically generate documentation for your components, making it easier to visualize and interact with them during development.

## Quick Start

```bash
# Install the plugin
npm install vue-component-docs-plugin

# In your main.ts or main.js
import componentDocsPlugin from 'vue-component-docs-plugin';

// Register the plugin
app.use(componentDocsPlugin, {
  componentModules: import.meta.glob('@/components/**/*.vue'),
  rawComponentSourceModules: import.meta.glob('@/components/**/*.vue', { query: '?raw', import: 'default' }),
  exampleModules: import.meta.glob('@/component-examples/**/*.vue'),
  componentsDirName: 'components',
  examplesDirName: 'component-examples',
  enableDocs: true,
});

// Access your component docs at /component-docs
```

## Features

* **Automatic Component Discovery:** Finds `.vue` components within your specified components directory.

* **Interactive Examples:** Allows you to create usage examples for each component.

* **Props, Events & Slots Display:** Parses and displays information about component props, events, and slots.

* **Dedicated Documentation UI:** Provides a view within your application (typically at `/component-docs`) to browse and interact with component documentation.

* **Source Code Display:** Shows the raw template and script source code of your components with syntax highlighting using Prism.js. This helps developers understand the component's structure, logic, and usage.

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

* `prismjs`: For syntax highlighting of component template and script source code

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
const rawComponentSourceModules = import.meta.glob('@/components/**/*.vue', { query: '?raw', import: 'default' });

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

```vue
<ExampleComponentUsage>
  <!-- Default slot: Render your component here -->
  <template #default>
    <MyButton :color="buttonColor" @click="clickCount++">
      {{ buttonLabel }}
    </MyButton>
  </template>

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
```

* **`#default` slot:** This is where you render an instance of the component you are documenting.

* **`#description` slot:** Provide a brief explanation of the component's purpose and functionality.

* **`#actions` slot:** This is crucial for interactivity. Add input fields, selects, or other controls that modify the props of your component example in real-time. This helps users understand how different props affect the component.

4. **Complete Example File:**

Here's a complete example file showing the entire component example, including the script section:

```vue
<script setup>
import { ref } from 'vue';
import ExampleComponentUsage from 'vue-component-docs-plugin';
import MyButton from '@/components/ui/MyButton.vue';

// Reactive properties for the example
const buttonLabel = ref('Click Me');
const buttonColor = ref('blue');
const clickCount = ref(0);
</script>

<template>
  <ExampleComponentUsage>
    <!-- Default slot: Render your component here -->
    <template #default>
      <MyButton :color="buttonColor" @click="clickCount++">
        {{ buttonLabel }}
      </MyButton>
    </template>

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
</template>
```

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

The plugin exports several helper UI components that you can use within your examples or anywhere in your application to create interactive controls:

### DocsSlider

A slider component for numeric values:

```vue
<DocsSlider 
  v-model="opacity" 
  :min="0" 
  :max="1" 
  :step="0.1" 
  label="Opacity" 
/>
```

Props:
- `v-model`: The bound value (required)
- `min`: Minimum value (default: 0)
- `max`: Maximum value (default: 100)
- `step`: Step increment (default: 1)
- `label`: Label text (default: '')

### DocsColorPicker

A simple color picker component:

```vue
<DocsColorPicker 
  v-model="backgroundColor" 
  label="Background Color" 
/>
```

Props:
- `v-model`: The bound color value (required)
- `label`: Label text (default: '')

### DocsMenu

A dropdown menu component:

```vue
<DocsMenu 
  v-model="selectedOption" 
  :options="['Option 1', 'Option 2', 'Option 3']" 
  label="Select an option" 
/>
```

Props:
- `v-model`: The selected value (required)
- `options`: Array of options (required)
- `label`: Label text (default: '')

### DocsChip

A chip/tag component:

```vue
<DocsChip 
  label="Feature" 
  color="blue" 
/>
```

Props:
- `label`: Chip text (required)
- `color`: Chip color (default: 'gray')

You can import these components directly from the plugin:

```typescript
import { DocsSlider, DocsColorPicker, DocsMenu, DocsChip } from 'vue-component-docs-plugin';
```

These components are designed to be simple and lightweight, focusing on functionality rather than styling, so they can easily fit into any design system.

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

## Troubleshooting

### Common Issues

#### Components Not Showing Up in Documentation

1. **Check Path Configuration:**
   - Ensure your `componentsDirName` and `examplesDirName` match your actual directory structure.
   - Verify that your path alias (e.g., `@`) is correctly configured in your build tool.

2. **Verify Glob Patterns:**
   - Make sure your `import.meta.glob` patterns are correctly targeting your component files.
   - Try logging the `componentModules` and `exampleModules` objects to see if they contain the expected files.

3. **Example File Naming:**
   - Ensure your example files follow the same path structure as your components.
   - Example: If your component is at `src/components/ui/Button.vue`, your example should be at `src/component-examples/ui/Button.vue`.

#### Raw Source Code Not Displaying

1. **Check Raw Source Configuration:**
   - Ensure you're using the correct syntax for importing raw sources: `{ query: '?raw', import: 'default' }`.
   - Verify that your build tool supports this syntax (works with Vite, may need adjustments for other bundlers).

2. **Bundler Configuration:**
   - If using Webpack, you may need a different approach to import raw sources. Consider using a raw-loader.

#### Route Integration Issues

1. **Check Router Configuration:**
   - Make sure you've correctly integrated the plugin's routes into your Vue Router configuration.
   - Verify that there are no route conflicts with existing routes in your application.

2. **404 Errors:**
   - If you're getting 404 errors when accessing `/component-docs`, check that the route is correctly registered and that your router is properly configured.

## Visual Documentation

Adding screenshots or GIFs of your component documentation UI can significantly enhance this README and help users understand the plugin's capabilities. Consider including visuals that demonstrate:

- The component documentation UI in action
- Example of a documented component with interactive controls
- The source code display feature
- The Vitest UI interface

## Version Information

Current version: 1.0.0

For a complete list of changes, please refer to the [CHANGELOG](https://github.com/nickberens360/atomic-docs-npm/blob/main/CHANGELOG.md) file.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on the [GitHub repository](https://github.com/nickberens360/atomic-docs-npm).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/nickberens360/atomic-docs-npm/blob/main/LICENSE) file for details.
