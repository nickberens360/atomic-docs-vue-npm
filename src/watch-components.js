#!/usr/bin/env node

import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get configuration from various sources with priority:
 * 1. Command-line arguments (highest priority)
 * 2. atomic-docs.config.js file
 * 3. Package.json atomicDocs section
 * 4. Environment variables
 * 5. Default values (lowest priority)
 */
async function getConfig() {
  // Default configuration
  const defaultConfig = {
    componentsDir: './src/components',
    patterns: ['**/*.vue'],
    watchForNew: true,
    watchForChanges: true,
    watchForDeletions: true,
    ignoreInitial: false,
  };

  // 1. Try loading from atomic-docs.config.js file
  let fileConfig = {};
  const configPath = path.resolve(process.cwd(), 'atomic-docs.config.js');

  try {
    if (fs.existsSync(configPath)) {
      // Use dynamic import for ESM compatibility
      const configModule = await import(configPath);
      fileConfig = configModule.default || configModule;

      // Map componentsDirName to componentsDir if provided
      if (fileConfig.componentsDirName && !fileConfig.componentsDir) {
        fileConfig.componentsDir = `./src/${fileConfig.componentsDirName}`;
      }
    }
  } catch (error) {
    console.warn(`[atomic-docs] Could not load config file: ${error.message}`);
  }

  // 2. Try loading from package.json
  let packageConfig = {};
  try {
    const packagePath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      packageConfig = packageJson.atomicDocs || {};

      // Map componentsDirName to componentsDir if provided
      if (packageConfig.componentsDirName && !packageConfig.componentsDir) {
        packageConfig.componentsDir = `./src/${packageConfig.componentsDirName}`;
      }
    }
  } catch (error) {
    console.warn(`[atomic-docs] Could not load package.json: ${error.message}`);
  }

  // 3. Get environment variables
  const envConfig = {
    ...(process.env.ATOMIC_DOCS_COMPONENTS_DIR ? { componentsDir: process.env.ATOMIC_DOCS_COMPONENTS_DIR } : {}),
    ...(process.env.ATOMIC_DOCS_PATTERNS ? { patterns: process.env.ATOMIC_DOCS_PATTERNS.split(',') } : {}),
  };

  // 4. Parse command line arguments
  const args = process.argv.slice(2);
  const cmdConfig = {};

  // Simple argument parsing (could be enhanced with a proper CLI parser)
  if (args[0] && !args[0].startsWith('--')) {
    cmdConfig.componentsDir = args[0];
  }

  // Combine all configs with priority order
  return {
    ...defaultConfig,
    ...fileConfig,
    ...packageConfig,
    ...envConfig,
    ...cmdConfig,
  };
}

/**
 * Watch for changes in the components directory
 * @param {Object} userConfig - User provided configuration
 * @returns {Object} - Watcher instance
 */
async function watchComponents(userConfig = {}) {
  // Get config from various sources and merge with user config
  const config = {
    ...await getConfig(),
    ...userConfig,
  };

  // Resolve the components directory path
  const componentsPath = path.resolve(process.cwd(), config.componentsDir);

  console.log(`[atomic-docs] Watching for changes in: ${componentsPath}`);
  console.log(`[atomic-docs] File patterns: ${config.patterns.join(', ')}`);

  // Create patterns to watch
  const watchPatterns = config.patterns.map(pattern =>
    path.join(componentsPath, pattern)
  );

  // Initialize watcher
  const watcher = chokidar.watch(watchPatterns, {
    ignoreInitial: config.ignoreInitial,
    persistent: true,
  });

  // Set up event handlers
  if (config.watchForNew) {
    watcher.on('add', path => config.onChange?.(path, 'add') || console.log(`[ADD] ${path}`));
  }

  if (config.watchForChanges) {
    watcher.on('change', path => config.onChange?.(path, 'change') || console.log(`[CHANGE] ${path}`));
  }

  if (config.watchForDeletions) {
    watcher.on('unlink', path => config.onChange?.(path, 'delete') || console.log(`[DELETE] ${path}`));
  }

  // Handle errors
  watcher.on('error', error => console.error(`[atomic-docs] Watcher error: ${error}`));

  return watcher;
}

// If this script is run directly
if (import.meta.url === `file://${__filename}`) {
  watchComponents({
    onChange: (path, event) => {
      const relativePath = path.replace(process.cwd(), '');
      console.log(`[${event.toUpperCase()}] ${relativePath}`);

      // Here you could trigger documentation regeneration
      // regenerateDocumentation(path, event);
    }
  });
}

export default watchComponents;