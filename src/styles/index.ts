/**
 * Styles index file
 * 
 * This file exports all styles for the documentation plugin.
 * Import this file in the plugin's main entry point to apply the base styles.
 */

// Import base styles
import './docs-base.scss';

// Export a function to apply the atomic-docs class to the root element
export function applyAtomicDocsStyles(rootElement: HTMLElement): void {
  rootElement.classList.add('atomic-docs');
}

// Export a function to remove the atomic-docs class from the root element
export function removeAtomicDocsStyles(rootElement: HTMLElement): void {
  rootElement.classList.remove('atomic-docs');
}