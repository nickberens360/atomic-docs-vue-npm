// src/plugins/component-documentation/src/utils/sourceCodeExtractors.ts
import { parse, compile } from '@vue/compiler-dom';

/**
 * Extracts template content from raw source
 * @param source - Raw source code
 * @returns Template content or null if not found
 */
export const extractTemplateContent = (source: string): string | null => {
  const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return templateMatch ? templateMatch[1] : null;
};

/**
 * Extracts script content from raw source
 * @param source - Raw source code
 * @returns Script content or null if not found
 */
export const extractScriptContent = (source: string): string | null => {
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return scriptMatch ? scriptMatch[1] : null;
};

/**
 * Extracts style content from raw source
 * @param source - Raw source code
 * @returns Style content or null if not found
 */
export const extractStyleContent = (source: string): string | null => {
  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return styleMatch ? styleMatch[1] : null;
};

/**
 * Generates compiled code from raw source
 * @param source - Raw source code
 * @returns Compiled code or null if compilation fails
 */
export const generateCompiledCode = (source: string): string | null => {
  try {
    // Extract template content
    const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateMatch || !templateMatch[1]) return null;

    const template = templateMatch[1];
    const ast = parse(template);
    const { code } = compile(ast);

    return `// Compiled Template Render Function\n${code}`;
  } catch (error) {
    console.error('Failed to compile component:', error);
    return `// Error compiling component: ${error}`;
  }
};
