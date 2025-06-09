// src/plugins/component-documentation/src/utils/sourceCodeExtractors.ts
import { parse, compile } from '@vue/compiler-dom';

/**
 * Extracts template content from raw source
 * @param source - Raw source code or Vite-transformed code
 * @returns Template content or null if not found
 */
export const extractTemplateContent = (source: string): string | null => {
  // First try standard SFC format
  const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  if (templateMatch) {
    // Simply return the matched content without trying to process it with JSON.parse
    return templateMatch[0];
  }

  // For Vite-transformed code, look for the render function
  const renderFunctionMatch = source.match(/function _sfc_render\([^)]*\)[^{]*{([\s\S]*?)return /);
  if (renderFunctionMatch) {
    // Extract the JSX-like structure from the render function
    const renderContent = renderFunctionMatch[1];
    // Reconstruct a template-like representation
    return `<template>\n  <!-- Extracted from render function -->\n  ${renderContent}\n</template>`;
  }

  return null;
};

/**
 * Extracts script content from raw source
 * @param source - Raw source code or Vite-transformed code
 * @returns Script content or null if not found
 */
export const extractScriptContent = (source: string): string | null => {
  // First try standard SFC format
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    // Simply return the matched content without trying to process it with JSON.parse
    return scriptMatch[0];
  }

  // For Vite-transformed code, extract the component definition
  const componentDefMatch = source.match(/const _sfc_main = (defineComponent\({[\s\S]*?\})\);/);
  if (componentDefMatch) {
    return `<script lang="ts">\nimport { defineComponent } from 'vue';\n\nexport default ${componentDefMatch[1]};\n</script>`;
  }

  return null;
};

/**
 * Extracts style content from raw source
 * @param source - Raw source code or Vite-transformed code
 * @returns Style content or null if not found
 */
export const extractStyleContent = (source: string): string | null => {
  // First try standard SFC format
  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    // Simply return the matched content without trying to process it with JSON.parse
    return styleMatch[0];
  }

  // For Vite-transformed code, look for style imports
  const styleImportMatch = source.match(/import "([^"]*\.css)";/);
  if (styleImportMatch) {
    return `<style>\n  /* Style imported from: ${styleImportMatch[1]} */\n  /* Actual styles not available in transformed code */\n</style>`;
  }

  return null;
};

/**
 * Generates compiled code from raw source
 * @param source - Raw source code or Vite-transformed code
 * @returns Compiled code or null if compilation fails
 */
export const generateCompiledCode = (source: string): string | null => {
  try {
    // For Vite-transformed code, the render function is already available
    const renderFunctionMatch = source.match(/function _sfc_render\([^)]*\)[^{]*{[\s\S]*?}/);
    if (renderFunctionMatch) {
      // Simply return the matched content without trying to process it with JSON.parse
      return `// Compiled Template Render Function\n${renderFunctionMatch[0]}`;
    }

    // Fall back to standard extraction and compilation
    const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateMatch || !templateMatch[1]) return null;

    // Use the template content directly without JSON parsing
    let template = templateMatch[1];

    try {
      // Sanitize the template content to handle special characters
      // Replace all unquoted attribute values with quoted values
      // Exclude Vue directives and bindings (starting with :, v-, or @)
      template = template.replace(/(\s+(?!:|v-|@)[a-zA-Z0-9_-]+)=([^"'][^>\s]*)/g, '$1="$2"');

      const ast = parse(template);
      const { code } = compile(ast);

      return `// Compiled Template Render Function\n${code}`;
    } catch (parseError) {
      console.error('Error parsing template:', parseError);
      // Return a more informative error message
      return `// Error compiling component: ${parseError}\n// Template content might contain special characters that need to be properly quoted in attribute values.`;
    }
  } catch (error) {
    console.error('Failed to compile component:', error);
    return `// Error compiling component: ${error}`;
  }
};
