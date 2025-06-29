// src/types.ts

import type { RouterHistory } from 'vue-router';
import type { Plugin, Component } from 'vue';

export interface ComponentItem {
  type: 'component';
  label: string;
  relativePath: string;
  exampleComponent?: string;
  isDocumented?: boolean;
  importer?: () => Promise<any>;
  rawImporter?: () => Promise<any>;
}

export interface DirectoryItem {
  type: 'directory';
  label: string;
  relativePath: string;
  children: Record<string, NavigationItem>;
}

export type NavigationItem = ComponentItem | DirectoryItem;

export interface ComponentNavItem {
  type: 'component';
  label: string;
  relativePath?: string;
  exampleComponent?: string;
  isDocumented?: boolean;
}

export interface DirectoryNavItem {
  type: 'directory';
  label: string;
  relativePath?: string;
  children: Record<string, NavItem>;
}

export type NavItem = ComponentNavItem | DirectoryNavItem;

export interface ExampleItem {
  type: 'example';
  label: string;
  relativePath: string;
  importer: () => Promise<any>;
}

/**
 * Defines a named color option for use in the component documentation system.
 */
export interface DocColor {
  name: string;
  color: string;
}

/**
 * Configuration options for the component docs plugin.
 */
export interface ComponentDocOptions {
  enableDocs?: boolean;
  componentModules: Record<string, () => Promise<any>>;
  exampleModules: Record<string, () => Promise<any>>;
  componentsDirName: string;
  examplesDirName: string;
  rawComponentSourceModules?: Record<string, () => Promise<string>>;
  colors?: DocColor[];
  autoExtractColors?: boolean;
  componentFont?: string;
  history?: RouterHistory;
  plugins?: Plugin[];
  globalComponents?: Record<string, Component>;
  autoRegisterComponents?: boolean;
  /**
   * ID of the main application's root HTML element.
   * Used by the plugin to hide/show the main app when toggling docs.
   */
  mainAppID?: string;
}

/**
 * Plugin interface that provides utilities and configuration for docs integration.
 */
export interface ComponentDocPlugin {
  convertPathToExampleName: (path: string) => string;
  componentModules: Record<string, () => Promise<any>>;
  exampleModules: Record<string, () => Promise<any>>;
  componentsDirName: string;
  examplesDirName: string;
  rawComponentSourceModules?: Record<string, () => Promise<string>>;
  options: ComponentDocOptions;
}
