
# Vue Atomic Docs

Vue Atomic Docs is a powerful documentation plugin for Vue.js applications that helps you create and maintain component documentation. It automatically generates documentation from your Vue components and allows you to showcase examples of how to use them.

## Installation

```bash
npm install vue-atomic-docs
```

or

```bash
yarn add vue-atomic-docs
```

## Basic Usage

1. Import and register the plugin in your main.js/ts file:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import componentDocs from 'vue-atomic-docs'

createApp(App)
  .use(router)
  .use(componentDocs, {
    // Configuration options
    componentModules: import.meta.glob('@/components/**/*.vue'),
    rawComponentSourceModules: import.meta.glob('@/components/**/*.vue', {query: '?raw', import: 'default'}),
    exampleModules: import.meta.glob('@/component-examples/**/*.vue'),
    componentsDirName: 'components',
    examplesDirName: 'component-examples',
    mainAppID: 'app',
    enableDocs: import.meta.env.VITE_ENABLE_ATOMIC_DOCS === 'true'
  })
  .mount('#app')
```

2. Create a directory structure for your components and examples:

```
src/
├── components/         # Your actual components
│   |── Buttons/
│   |   └── Button.vue
│   |   └── ButtonSecondary.vue
│   |── BoxDemo.vue
└── component-examples/ # Structure should match the components directory
│   |── Buttons/
│   |   └── Button.vue
│   |   └── ButtonSecondary.vue
│   |── BoxDemo.vue

```

3. Document your components in `component-examples` using the `<ExampleComponentUsage>` component provided by vue-atomic-docs. For example, in `BoxDemo.vue`:
```markup
<template>
  <ExampleComponentUsage
    :event-items="eventItems"
    :slot-items="slotItems"
    description="A simple with props that are automatically extracted from the component."
  >
    <SimpleTest
      :text="text"
      :message="message"
        @input-has-changed="(value) => console.log('Input has changed:', value)"
    />
    <template #[`item.actions`]="{item}">
      <!-- Slot for your prop actions. Use your own inputs otherwise vue-atomic-docs provides some basic input components if you'd like. -->
      <input
        v-if="item.name === 'text'"
        type="text" v-model="text"
      />
      <input
        v-if="item.name === 'message'"
        type="text" v-model="message"
      />
    </template>
  </ExampleComponentUsage>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import SimpleTest from "../components/SimpleTest.vue";
  const text = ref('Hello World');
  const message = ref('Yooooooo');

// Define event items and slot items for the ExampleComponentUsage. The documentation tables will be generated automatically based on these items.
const eventItems = [
  {
    event: 'input-has-changed',
    payload: 'void',
    description: 'Emitted when the input text has changed.',
  },
];
const slotItems = [
  {
    name: 'default',
    content: 'null',
    description: 'Slot for custom content.',
  },
];
</script>
```

3. Access your component documentation at the `/atomic-docs` route in your application.

## Configuration Options

### Component Modules

The `componentModules` option specifies which Vue components should be included in your documentation. It uses Vite's `import.meta.glob` to dynamically import all component files matching the specified pattern.

```javascript
componentModules: import.meta.glob('@/components/**/*.vue')
```

### Raw Component Source Modules

The `rawComponentSourceModules` option allows you to access the raw source code of your components. This is useful for displaying the component source code in your documentation.

```javascript
rawComponentSourceModules: import.meta.glob('@/components/**/*.vue', {query: '?raw', import: 'default'})
```

### Example Modules

The `exampleModules` option specifies which Vue component examples should be included in your documentation. These examples demonstrate how your components can be used in different contexts and with various props.

```javascript
exampleModules: import.meta.glob('@/component-examples/**/*.vue')
```

### Components Directory Name

The `componentsDirName` option specifies the name of the directory where your Vue components are stored. This helps vue-atomic-docs locate and organize your components in the documentation.

```javascript
componentsDirName: 'components'
```

### Examples Directory Name

The `examplesDirName` option specifies the name of the directory where your component examples are stored. This helps vue-atomic-docs locate and organize your component examples in the documentation.

```javascript
examplesDirName: 'component-examples'
```

### Main App ID

The `mainAppID` option specifies the ID of your main application element. This helps vue-atomic-docs integrate properly with your application's DOM structure.

```javascript
mainAppID: 'app'
```

### Enable Docs

The `enableDocs` option allows you to conditionally enable or disable the documentation system. This is useful for toggling documentation in different environments (development vs. production).

```javascript
enableDocs: import.meta.env.VITE_ENABLE_ATOMIC_DOCS === 'true'
```

### Component Font

The `componentFont` option allows you to specify the default font family used for components in the documentation. This helps maintain consistent typography throughout your component documentation.

```javascript
componentFont: 'Times, serif'
```

### Auto Extract Colors

The `autoExtractColors` option enables automatic extraction of color variables from your components. When enabled, vue-atomic-docs will analyze your components and extract color information to display in the documentation.

```javascript
autoExtractColors: true
```

### Auto Extract Typography

The `autoExtractTypography` option enables automatic extraction of typography styles from your components. When enabled, vue-atomic-docs will analyze your components and extract typography information such as font families, sizes, and weights to display in the documentation.

```javascript
autoExtractTypography: true
```

### Colors

The `colors` option allows you to define your brand's colors for the documentation.

```javascript
colors: [
  {
    name: 'primary',
    color: '#1976d2',
  },
  {
    name: 'secondary',
    color: '#424242',
  },
  // Add more colors as needed
]
```

### Typography

The `typography` option allows you to define typography styles for your documentation. You can specify different text styles with properties like font family, size, weight, and line height.

```javascript
typography: [
  {
    name: 'Headline 1',
    fontFamily: '"Roboto", sans-serif',
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: '1.5',
  },
  {
    name: 'Body Text',
    fontFamily: '"Open Sans", sans-serif',
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  // Add more typography styles as needed
]
```

### Custom Routes

The `customRoutes` option allows you to create custom routes in your Vue Atomic Docs application. This enables you to add custom pages or components that are not part of the standard documentation.

```javascript
customRoutes: [
  {
    path: 'my-custom-page', // URL will be /atomic-docs/my-custom-page
    name: 'my-custom-page',
    component: () => import('@/views/MyCustomView.vue'),
    meta: {
      section: 'Custom Section',
      title: 'My Custom Page',
      icon: '🚀',
    }
  }
]
```

### Plugins

The `plugins` option allows you to pass your application's plugins and filters to be used in the component documentation.

```javascript
plugins: [
  vuetify,
  filters,
  store,
  fontawesome,
]
```

## Configuration File

Instead of passing all options directly to the plugin, you can use a configuration file to centralize your settings. This is especially useful when you want to share configuration between the Vue plugin and other tools like the component watcher.

### Creating a Configuration File

You can create an `atomic-docs.config.js` file in your project root:

```javascript
// atomic-docs.config.js
export default {
  componentsDirName: 'components',
  examplesDirName: 'component-examples',
  enableDocs: process.env.NODE_ENV === 'development',
  colors: [
    {
      name: 'primary',
      color: '#1976d2',
    },
    {
      name: 'secondary',
      color: '#424242',
    },
  ],
  typography: [
    {
      name: 'Headline 1',
      fontFamily: '"Roboto", sans-serif',
      fontSize: '2.5rem',
      fontWeight: '700',
      lineHeight: '1.5',
    },
  ],
  autoExtractColors: true,
  autoExtractTypography: true,
  componentFont: 'Times, serif',
  mainAppID: 'app',
}
```

Alternatively, you can use the `createConfigFile` helper to generate this file based on your plugin options:

```javascript
import { createConfigFile } from 'vue-atomic-docs';

// Same options you pass to the plugin
const options = {
  componentsDirName: 'components',
  examplesDirName: 'component-examples',
  // other options...
};

// Create the config file
createConfigFile(options);
```

### Configuration Priority

When using the plugin, configuration is loaded with the following priority:

1. Options passed directly to the plugin (highest priority)
2. Configuration from atomic-docs.config.js file
3. Configuration from package.json (atomicDocs section)

This allows you to override specific options when needed while keeping most configuration centralized.

## Component Watcher

Vue Atomic Docs includes a component watcher script that can monitor your component files for changes. This is useful for automatically regenerating documentation or triggering other actions when components are modified.

### Using the Component Watcher

You can add a script to your package.json:

```json
{
  "scripts": {
    "watch-components": "node node_modules/vue-atomic-docs/dist/watch-components.js"
  }
}
```

Then run it with:

```bash
npm run watch-components
```

The watcher uses the same configuration sources as the Vue plugin, with the following priority:

1. Command-line arguments (e.g., `npm run watch-components -- ./src/my-components`)
2. Configuration from atomic-docs.config.js file
3. Configuration from package.json (atomicDocs section)
4. Environment variables (e.g., `ATOMIC_DOCS_COMPONENTS_DIR=./src/components`)
5. Default values

### Watcher Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| componentsDir | Directory to watch for component changes | ./src/components |
| patterns | File patterns to watch | ['**/*.vue'] |
| watchForNew | Whether to watch for new files | true |
| watchForChanges | Whether to watch for file changes | true |
| watchForDeletions | Whether to watch for file deletions | true |
| ignoreInitial | Whether to ignore initial scan | false |

## Options Type Definitions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| componentModules | Record<string, () => Promise<any>> | Yes | An object mapping file paths to dynamic import functions that load Vue components. Typically created using import.meta.glob(). |
| rawComponentSourceModules | Record<string, () => Promise<string>> | No | An object mapping file paths to dynamic import functions that load the raw source code of components as strings. Typically created using import.meta.glob() with the ?raw query parameter. |
| exampleModules | Record<string, () => Promise<any>> | Yes | An object mapping file paths to dynamic import functions that load component examples. Typically created using import.meta.glob(). |
| componentsDirName | String | No | The name of the directory where your Vue components are stored (e.g., 'components') |
| examplesDirName | String | No | The name of the directory where your component examples are stored (e.g., 'component-examples') |
| mainAppID | String | No | The ID of the main app element in your HTML (e.g., 'app'). Helps integrate with your application's DOM structure. |
| enableDocs | Boolean | No | A flag that determines whether the documentation system is enabled or disabled. Useful for toggling documentation in different environments. |
| componentFont | String | No | The default font family used for components in the documentation (e.g., 'Times, serif') |
| autoExtractColors | Boolean | No | When set to true, automatically analyzes components and extracts color information to display in the documentation. |
| autoExtractTypography | Boolean | No | When set to true, automatically analyzes components and extracts typography information such as font families, sizes, and weights to display in the documentation. |
| colors | Array<{name: string, color: string}> | No | An array of color objects with name and color properties. |
| colors.name | String | Yes | The name of the color (e.g., 'primary', 'secondary') |
| colors.color | String | Yes | The color value in hex format (e.g., '#1976d2') |
| typography | Array<{name: string, fontFamily: string, fontSize: string, fontWeight: string, lineHeight: string}> | No | An array of typography style objects. |
| typography.name | String | Yes | The name of the typography style (e.g., 'Headline 1') |
| typography.fontFamily | String | Yes | The font family (e.g., '"Roboto", sans-serif') |
| typography.fontSize | String | Yes | The font size (e.g., '2.5rem') |
| typography.fontWeight | String | Yes | The font weight (e.g., '700') |
| typography.lineHeight | String | Yes | The line height (e.g., '1.5') |
| customRoutes | Array<{path: string, name: string, component: () => Promise<any>, meta: {section: string, title: string, icon: string}}> | No | An array of custom route objects. |
| customRoutes.path | String | Yes | The URL path for the route (e.g., 'my-custom-page') |
| customRoutes.name | String | Yes | The route name (e.g., 'my-custom-page') |
| customRoutes.component | Function | Yes | A function that returns a dynamic import of the component |
| customRoutes.meta.section | String | Yes | The section name in the navigation (e.g., 'Custom Section') |
| customRoutes.meta.title | String | Yes | The display title (e.g., 'My Custom Page') |
| customRoutes.meta.icon | String | No | An emoji or icon for the route (e.g., '🚀') |
| plugins | Array<Plugin> | No | An array of Vue plugins that will be registered with the documentation application, allowing components to access the same plugins as your main application. |
