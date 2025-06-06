# Atomic Docs CSS Styling Guide

This document explains how to customize the styling of the Atomic Docs plugin and how to prevent style conflicts with your application.

## CSS Isolation Approach

The Atomic Docs plugin uses several techniques to isolate its styles from the consuming application:

1. **Namespaced Classes**: All styles are contained within the `.atomic-docs` namespace
2. **CSS Custom Properties (Variables)**: Theme values are defined as CSS variables
3. **Scoped Styles**: Vue's scoped styles are used for component-specific styling
4. **Fallback Values**: All CSS variables have fallback values for backward compatibility

## Customizing Styles

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

## Available CSS Variables

### Colors
- `--atomic-docs-primary-color`: Primary color for buttons, links, etc.
- `--atomic-docs-secondary-color`: Secondary color for accents
- `--atomic-docs-background-color`: Background color for the documentation
- `--atomic-docs-surface-color`: Background color for cards and surfaces
- `--atomic-docs-error-color`: Color for error states
- `--atomic-docs-text-primary`: Primary text color
- `--atomic-docs-text-secondary`: Secondary text color
- `--atomic-docs-border-color`: Color for borders

### Spacing
- `--atomic-docs-spacing-xs`: Extra small spacing (4px)
- `--atomic-docs-spacing-sm`: Small spacing (8px)
- `--atomic-docs-spacing-md`: Medium spacing (16px)
- `--atomic-docs-spacing-lg`: Large spacing (24px)
- `--atomic-docs-spacing-xl`: Extra large spacing (32px)

### Typography
- `--atomic-docs-font-family`: Font family for text
- `--atomic-docs-font-family-mono`: Font family for code
- `--atomic-docs-font-size-xs`: Extra small font size (12px)
- `--atomic-docs-font-size-sm`: Small font size (14px)
- `--atomic-docs-font-size-md`: Medium font size (16px)
- `--atomic-docs-font-size-lg`: Large font size (20px)
- `--atomic-docs-font-size-xl`: Extra large font size (24px)

### Borders and Shadows
- `--atomic-docs-border-radius-sm`: Small border radius (4px)
- `--atomic-docs-border-radius-md`: Medium border radius (8px)
- `--atomic-docs-border-radius-lg`: Large border radius (16px)
- `--atomic-docs-shadow-sm`: Small shadow
- `--atomic-docs-shadow-md`: Medium shadow
- `--atomic-docs-shadow-lg`: Large shadow

### Z-index
- `--atomic-docs-z-index-drawer`: Z-index for the navigation drawer
- `--atomic-docs-z-index-appbar`: Z-index for the app bar
- `--atomic-docs-z-index-modal`: Z-index for modals

## Utility Classes

The plugin provides utility classes for common styling needs:

- Margin top: `.atomic-docs-mt-xs`, `.atomic-docs-mt-sm`, `.atomic-docs-mt-md`, `.atomic-docs-mt-lg`, `.atomic-docs-mt-xl`
- Margin bottom: `.atomic-docs-mb-xs`, `.atomic-docs-mb-sm`, `.atomic-docs-mb-md`, `.atomic-docs-mb-lg`, `.atomic-docs-mb-xl`
- Padding: `.atomic-docs-p-xs`, `.atomic-docs-p-sm`, `.atomic-docs-p-md`, `.atomic-docs-p-lg`, `.atomic-docs-p-xl`

## Troubleshooting Style Conflicts

If you're still experiencing style conflicts between your application and the Atomic Docs plugin:

1. **Check for global styles**: Ensure your application doesn't have global styles that target generic elements without proper scoping
2. **Increase specificity**: You can increase the specificity of the Atomic Docs styles by adding more specific selectors
3. **Use !important sparingly**: For critical styles that must not be overridden, you can use !important, but use it sparingly

Example of increasing specificity:

```css
/* In your application's CSS */
html body .atomic-docs .docs-navigation-drawer {
  background-color: #f0f0f0;
}
```