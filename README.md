# Atomic Docs Plugin

A Vue 3 plugin for documenting and showcasing your component library.

## Features

- 📚 Component API documentation
- 🎨 Color system visualization
- 🧩 Interactive component examples
- 🔍 Component search and filtering
- 📱 Responsive layout

## Installation

```bash
npm install atomic-docs
```

## Usage

```javascript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { createRouter } from 'vue-router';
import componentDocsPlugin from 'atomic-docs';

const app = createApp(App);
const router = createRouter(/* your router options */);

// Configure the plugin
app.use(componentDocsPlugin, {
  componentModules: import.meta.glob('./components/**/*.vue'),
  componentsDirName: 'components',
  exampleModules: import.meta.glob('./examples/**/*.vue'),
  examplesDirName: 'examples',
  // Note: Source code is now fetched on-demand directly from the Vite dev server
  // for better HMR support, so rawComponentSourceModules is no longer needed
  colors: [
    { name: 'Primary', color: '#1976d2' },
    { name: 'Secondary', color: '#424242' },
    // Add your color system here
  ],
  enableDocs: true // Set to false in production if needed
});

app.use(router);
app.mount('#app');
```

## CSS Styling and Customization

The Atomic Docs plugin now uses a robust CSS isolation approach to prevent style conflicts with your application. All styles are contained within the `.atomic-docs` namespace and use CSS custom properties (variables) for theming.

### Customizing Styles

You can customize the appearance of the Atomic Docs plugin by overriding the CSS variables in your application's CSS:

```css
/* In your application's CSS */
.atomic-docs {
  /* Override color variables */
  --atomic-docs-primary-color: #ff5722;
  --atomic-docs-background-color: #f8f8f8;
  --atomic-docs-text-primary: #333333;

  /* Override spacing variables */
  --atomic-docs-spacing-md: 20px;

  /* Override font variables */
  --atomic-docs-font-family: 'Your Font', sans-serif;
  --atomic-docs-font-size-md: 18px;
}
```

### Theme Support

The plugin supports both light and dark themes:

- Light theme is the default
- Dark theme can be toggled using the theme switch in the app bar
- Both themes use the same CSS variables with different values

You can customize each theme separately:

```css
/* Customize the light theme */
.atomic-docs.docs-app-theme--light {
  --atomic-docs-primary-color: #ff5722;
  --atomic-docs-background-color: #f8f8f8;
}

/* Customize the dark theme */
.atomic-docs.docs-app-theme--dark {
  --atomic-docs-primary-color: #ff9800;
  --atomic-docs-background-color: #1a1a1a;
}
```

### Available CSS Variables

The plugin provides a comprehensive set of CSS variables for customization, including:

- Colors (primary, secondary, background, etc.)
- Spacing (xs, sm, md, lg, xl)
- Typography (font families, sizes)
- Borders and shadows
- Z-index values

For a complete list of available CSS variables and detailed documentation on the CSS isolation approach, see the [CSS Styling Guide](./src/styles/README.md).

## Troubleshooting Style Conflicts

If you're experiencing style conflicts between your application and the Atomic Docs plugin, check out the troubleshooting section in the [CSS Styling Guide](./src/styles/README.md#troubleshooting-style-conflicts).

## License

MIT
