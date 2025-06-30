// scripts/generate-docs-manifest.js
/**
 * @typedef {import('vue').Component} Component
 * @typedef {import('../types').ComponentItem} ComponentItem
 * @typedef {import('../types').ExampleItem} ExampleItem
 *
 * @type {Object}
 * @property {string} lib - ES2015 or later to support Promises
 */
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

// Function to parse command-line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
      args[key.substring(2)] = value || true; // Handle boolean flags or values
    }
  });
  return args;
}

// Function to load config from atomic-docs.config.js if it exists
function loadConfigFile() {
  const configPath = path.join(process.cwd(), 'atomic-docs.config.js');

  if (fs.existsSync(configPath)) {
    try {
      console.log(`Loading configuration from ${configPath}`);
      // Use require to load the JS config file
      const config = require(configPath);
      // Handle both CommonJS and ES module exports
      // If it's an ES module with a default export, use that
      return config.default || config;
    } catch (error) {
      console.error(`Error loading config file: ${error.message}`);
      return {};
    }
  }

  return {};
}

// Available arguments:
// --output: Path to output the atomic-docs-manifest.ts file (default: src/atomic-docs-manifest.ts in the current working directory)
// --componentsDir: Path to the components directory (default: src/components)
// --examplesDir: Path to the examples directory (default: src/component-examples)
// --pluginComponentsBaseName: Base name for components in the plugin (default: components)
// --pluginExamplesBaseName: Base name for examples in the plugin (default: component-examples)

// Parse command line arguments
const cliArgs = parseArgs();

// Load config from file
const fileConfig = loadConfigFile();

// Merge configurations, with CLI args taking precedence
const args = { ...fileConfig, ...cliArgs };

// Default values:
// 1. projectRoot: Defaults to the current working directory (where npm run is executed)
//    This is the most reliable way to find the actual project root when the script
//    is located deep in node_modules.
// Always use process.cwd() to ensure we're working with the consuming app's directory
const projectRoot = process.cwd();

// These are the *file system paths* to the directories, relative to projectRoot.
// These should match where your component and example files physically reside.
const filesystemComponentsDir = args.componentsDir || 'src/components';
const filesystemExamplesDir = args.examplesDir || 'src/component-examples';

// These are the *base names* expected by the `vue-atomic-docs` plugin for relative paths.
// They should match the `componentsDirName` and `examplesDirName` options passed to the plugin in `plugins/index.ts`.
const pluginComponentsBaseName = args.pluginComponentsBaseName || 'components';
const pluginExamplesBaseName = args.pluginExamplesBaseName || 'component-examples';


// manifestOutputPath: Defaults to 'src/atomic-docs-manifest.ts' within the projectRoot.
// When running from within the vue-atomic-docs package, we want to output to the consuming app's directory
// process.cwd() is the current working directory (where npm run is executed)
const manifestOutputPath = args.output ? path.resolve(process.cwd(), args.output) : path.resolve(process.cwd(), 'src', 'atomic-docs-manifest.ts');

// Ensure the output directory exists
const outputDir = path.dirname(manifestOutputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`--- Generating Docs Manifest for Vue App ---`);
console.log(`Project Root: ${projectRoot}`);
console.log(`Filesystem Components Directory: ${filesystemComponentsDir}`);
console.log(`Filesystem Examples Directory: ${filesystemExamplesDir}`);
console.log(`Plugin Expected Components Base Name: ${pluginComponentsBaseName}`);
console.log(`Plugin Expected Examples Base Name: ${pluginExamplesBaseName}`);
console.log(`Manifest Output Path: ${manifestOutputPath}`);
console.log(`------------------------------------------`);


async function generateDocsManifest() {
  const allComponents = [];
  const allExampleComponents = [];

  // --- Process Components ---
  const componentGlobPattern = path.join(projectRoot, filesystemComponentsDir, '**', '*.vue').replace(/\\/g, '/');
  const componentFiles = await glob(componentGlobPattern);

  for (const filePath of componentFiles) {
    const relativePathInDir = path.relative(path.join(projectRoot, filesystemComponentsDir), filePath);
    const label = path.basename(filePath, '.vue');
    const importPathRelativeToManifest = `./${path.relative(path.dirname(manifestOutputPath), filePath).replace(/\\/g, '/')}`;

    // Store as an object with string values for properties that will be stringified,
    // and raw function strings for importer/rawImporter.
    allComponents.push({
      type: 'component',
      label: label,
      relativePath: path.join(pluginComponentsBaseName, relativePathInDir).replace(/\\/g, '/'),
      importer: `() => import('${importPathRelativeToManifest}')`,
      rawImporter: `() => import('${importPathRelativeToManifest}?raw')`,
    });
  }

  // --- Process Example Components ---
  const exampleGlobPattern = path.join(projectRoot, filesystemExamplesDir, '**', '*.vue').replace(/\\/g, '/');
  const exampleFiles = await glob(exampleGlobPattern);

  for (const filePath of exampleFiles) {
    const relativePathInDir = path.relative(path.join(projectRoot, filesystemExamplesDir), filePath);
    const label = path.basename(filePath, '.vue');
    const importPathRelativeToManifest = `./${path.relative(path.dirname(manifestOutputPath), filePath).replace(/\\/g, '/')}`;

    allExampleComponents.push({
      type: 'example',
      label: label,
      relativePath: path.join(pluginExamplesBaseName, relativePathInDir).replace(/\\/g, '/'),
      importer: `() => import('${importPathRelativeToManifest}')`,
    });
  }

  // Manually construct the manifest content to avoid double stringification
  let componentsContent = 'export const components: ComponentItem[] = [\n';
  allComponents.forEach((comp, index) => {
    componentsContent += `  {\n`;
    componentsContent += `    "type": "${comp.type}",\n`;
    componentsContent += `    "label": "${comp.label}",\n`;
    componentsContent += `    "relativePath": "${comp.relativePath}",\n`;
    componentsContent += `    "importer": ${comp.importer},\n`; // Directly embed function string
    componentsContent += `    "rawImporter": ${comp.rawImporter}\n`; // Directly embed function string
    componentsContent += `  }${index < allComponents.length - 1 ? ',' : ''}\n`;
  });
  componentsContent += `];\n\n`;

  let exampleComponentsContent = 'export const exampleComponents: ExampleItem[] = [\n';
  allExampleComponents.forEach((example, index) => {
    exampleComponentsContent += `  {\n`;
    exampleComponentsContent += `    "type": "${example.type}",\n`;
    exampleComponentsContent += `    "label": "${example.label}",\n`;
    exampleComponentsContent += `    "relativePath": "${example.relativePath}",\n`;
    exampleComponentsContent += `    "importer": ${example.importer}\n`; // Directly embed function string
    exampleComponentsContent += `  }${index < allExampleComponents.length - 1 ? ',' : ''}\n`;
  });
  exampleComponentsContent += `];\n`;

  const manifestContent = `
// This file is auto-generated by scripts/generate-atomic-docs-manifest.js
// Do not edit this file directly.

import type { ComponentItem, ExampleItem } from 'vue-atomic-docs/src/types'; // Reference types from the installed package

${componentsContent}
${exampleComponentsContent}

// Pre-computed module mappings for direct use with the plugin
export const componentModules: Record<string, () => Promise<any>> = components.reduce((acc, comp) => {
  acc[comp.relativePath] = comp.importer;
  return acc;
}, {});

export const rawComponentSourceModules: Record<string, () => Promise<string>> = components.reduce((acc, comp) => {
  if (comp.rawImporter) {
    acc[comp.relativePath] = comp.rawImporter;
  }
  return acc;
}, {});

export const exampleModules: Record<string, () => Promise<any>> = exampleComponents.reduce((acc, example) => {
  acc[example.relativePath] = example.importer;
  return acc;
}, {});`;

  fs.writeFileSync(manifestOutputPath, manifestContent);
  console.log(`✅ Docs manifest generated successfully at ${manifestOutputPath}`);
}

generateDocsManifest().catch(console.error);
