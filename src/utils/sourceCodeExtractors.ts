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
    // Process the template to handle escape sequences
    try {
      // If the template contains escape sequences like \n, process them
      if (templateMatch[0].includes('\\n') || templateMatch[0].includes('\\\"')) {
        // Use JSON.parse to properly handle escape sequences
        // Wrap in quotes and escape any existing quotes to make it valid JSON
        const jsonString = `"${templateMatch[0].replace(/"/g, '\\"')}"`;
        const processed = JSON.parse(jsonString);
        return processed;
      }
      return templateMatch[0];
    } catch (error) {
      console.error('Error processing template:', error);
      return templateMatch[0]; // Return original if processing fails
    }
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
    // Process the script to handle escape sequences
    try {
      // If the script contains escape sequences like \n, process them
      if (scriptMatch[0].includes('\\n') || scriptMatch[0].includes('\\\"')) {
        // Use JSON.parse to properly handle escape sequences
        // Wrap in quotes and escape any existing quotes to make it valid JSON
        const jsonString = `"${scriptMatch[0].replace(/"/g, '\\"')}"`;
        const processed = JSON.parse(jsonString);
        return processed;
      }
      return scriptMatch[0];
    } catch (error) {
      console.error('Error processing script:', error);
      return scriptMatch[0]; // Return original if processing fails
    }
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
    // Process the style to handle escape sequences
    try {
      // If the style contains escape sequences like \n, process them
      if (styleMatch[0].includes('\\n') || styleMatch[0].includes('\\\"')) {
        // Use JSON.parse to properly handle escape sequences
        // Wrap in quotes and escape any existing quotes to make it valid JSON
        const jsonString = `"${styleMatch[0].replace(/"/g, '\\"')}"`;
        const processed = JSON.parse(jsonString);
        return processed;
      }
      return styleMatch[0];
    } catch (error) {
      console.error('Error processing style:', error);
      return styleMatch[0]; // Return original if processing fails
    }
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
      // Process the render function to handle escape sequences
      if (renderFunctionMatch[0].includes('\\n') || renderFunctionMatch[0].includes('\\\"')) {
        try {
          const jsonString = `"${renderFunctionMatch[0].replace(/"/g, '\\"')}"`;
          const processed = JSON.parse(jsonString);
          return `// Compiled Template Render Function\n${processed}`;
        } catch (parseError) {
          console.error('Error processing render function:', parseError);
          return `// Compiled Template Render Function\n${renderFunctionMatch[0]}`;
        }
      }
      return `// Compiled Template Render Function\n${renderFunctionMatch[0]}`;
    }

    // Fall back to standard extraction and compilation
    const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateMatch || !templateMatch[1]) return null;

    // Process the template to handle escape sequences
    let template = templateMatch[1];
    if (template.includes('\\n') || template.includes('\\\"')) {
      try {
        const jsonString = `"${template.replace(/"/g, '\\"')}"`;
        template = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error processing template for compilation:', parseError);
        // Continue with the original template
      }
    }

    const ast = parse(template);
    const { code } = compile(ast);

    return `// Compiled Template Render Function\n${code}`;
  } catch (error) {
    console.error('Failed to compile component:', error);
    return `// Error compiling component: ${error}`;
  }
};
