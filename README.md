# Atomic Docs Vue Plugin

A Vue 3 plugin for building beautiful, interactive documentation sites for your component libraries – with zero config.

## Installation

```bash
npm install vue-atomic-docs
```

## Setup

### 1. Generate the Component Manifest

The plugin requires a manifest file that catalogs all your components and examples. You can generate this file using the included script:

```bash
npx generate-docs-manifest
```

#### Configuration Options

You can configure the manifest generation in two ways:

##### 1. Command Line Arguments

```bash
npx generate-docs-manifest --componentsDir=src/ui-components --examplesDir=src/ui-examples
```

Available arguments:
- `--output`: Path to output the atomic-docs-manifest.ts file (default: src/atomic-docs-manifest.ts)
- `--componentsDir`: Path to the components directory (default: src/components)
- `--examplesDir`: Path to the examples directory (default: src/component-examples)
- `--pluginComponentsBaseName`: Base name for components in the plugin (default: components)
- `--pluginExamplesBaseName`: Base name for examples in the plugin (default: component-examples)

##### 2. Configuration File

A default `atomic-docs.config.js` file is automatically created in your project root during installation. You can modify this file to customize your documentation setup:

```javascript
// atomic-docs.config.js
module.exports = {
  output: 'src/custom-path/atomic-docs-manifest.ts',
  componentsDir: 'src/ui-components',
  examplesDir: 'src/ui-examples',
  pluginComponentsBaseName: 'ui-components',
  pluginExamplesBaseName: 'ui-examples'
};
```

The script will automatically detect and use this configuration file. Command line arguments will override any settings in the config file.

### 2. Register the Plugin

In your main.ts/js file:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { AtomicDocs } from 'vue-atomic-docs'

// Import the generated manifest
import { 
  components, 
  exampleComponents, 
  componentModules, 
  rawComponentSourceModules, 
  exampleModules 
} from './atomic-docs-manifest'

const app = createApp(App)

app.use(AtomicDocs, {
  components,
  exampleComponents,
  componentModules,
  rawComponentSourceModules,
  exampleModules
})

app.mount('#app')
```

## Usage

Once set up, you can access the documentation site at the route configured in your application.
