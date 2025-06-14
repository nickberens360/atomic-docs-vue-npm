// src/types.ts

// Add this import at the top of the file
import type { RouterHistory } from 'vue-router';
import type { Plugin, Component } from 'vue';

export interface ComponentItem {
  type: 'component';
  label: string;
  relativePath: string;
  exampleComponent: string;
  isDocumented?: boolean; // <-- ADDED
}

export interface DirectoryItem {
  type: 'directory';
  label: string;
  relativePath: string;
  children: Record<string, NavigationItem>;
}

export type NavigationItem = ComponentItem | DirectoryItem;

// Nav item interfaces used in recursive components
export interface ComponentNavItem {
  type: 'component';
  label: string;
  relativePath?: string;
  exampleComponent?: string;
  isDocumented?: boolean; // <-- ADDED
}

export interface DirectoryNavItem {
  type: 'directory';
  label: string;
  relativePath?: string;
  children: Record<string, NavItem>;
}

export type NavItem = ComponentNavItem | DirectoryNavItem;

// Configuration options interface
export interface ComponentDocOptions {
  enableDocs?: boolean;
  componentModules: Record<string, () => Promise<any>>;
  exampleModules: Record<string, () => Promise<any>>;
  componentsDirName: string;
  examplesDirName: string;
  rawComponentSourceModules?: Record<string, () => Promise<string>>;
  colors?: Array<{
    name: string;
    color: string;
  }>;
  componentFont?: string;
  history?: RouterHistory;
  plugins?: Plugin[]; // <-- MODIFIED: Changed from 'vuetify' to a generic 'plugins' array
  globalComponents?: Record<string, Component>; // Components to register globally in the docs app
  autoRegisterComponents?: boolean; // Auto-register all components from the main app
}

// Plugin interface
export interface ComponentDocPlugin {
  convertPathToExampleName: (path: string) => string;
  componentModules: Record<string, () => Promise<any>>;
  exampleModules: Record<string, () => Promise<any>>;
  componentsDirName: string;
  examplesDirName: string;
  rawComponentSourceModules?: Record<string, () => Promise<string>>;
  options?: ComponentDocOptions;
}
