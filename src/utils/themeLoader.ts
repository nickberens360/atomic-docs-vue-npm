// src/utils/themeLoader.ts

// Import the theme URLs using the '?url' suffix.
// This provides the path to the CSS file without bundling its content directly.
import solarizedLightUrl from 'prismjs/themes/prism-solarizedlight.css?url';
import okaidiaUrl from 'prismjs/themes/prism-okaidia.css?url';

/**
 * Utility for dynamically loading Prism.js themes based on the current app theme
 */

/**
 * Loads the appropriate Prism theme by injecting a <link> tag into the head.
 * @param isDarkMode Boolean indicating if dark mode is active
 */
export function loadPrismTheme(isDarkMode: boolean): void {
  // Find and remove any existing Prism theme stylesheet
  const existingThemeLink = document.querySelector('link[data-prism-theme]');
  if (existingThemeLink) {
    existingThemeLink.remove();
  }

  // Create a new <link> element for the new theme
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-prism-theme', 'true'); // Mark it for easy removal
  link.href = isDarkMode ? okaidiaUrl : solarizedLightUrl;

  // Append the new link to the document's head
  document.head.appendChild(link);
}

/**
 * Initializes the Prism theme and sets up a watcher for theme changes
 * @param isDarkMode Initial dark mode state
 */
export function initPrismTheme(isDarkMode: boolean): void {
  // Load the initial theme
  loadPrismTheme(isDarkMode);

  // Set up a MutationObserver to watch for theme class changes on the root element
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        mutation.target instanceof HTMLElement
      ) {
        const element = mutation.target;
        const isDark = element.classList.contains('atomic-docs-app-theme--dark');
        loadPrismTheme(isDark);
      }
    });
  });

  // Start observing the root element for theme class changes
  const rootElement = document.querySelector('.atomic-docs');
  if (rootElement) {
    observer.observe(rootElement, { attributes: true });
  } else {
    // Fallback to observe the body if the root element is not immediately available
    const bodyObserver = new MutationObserver(() => {
      const root = document.querySelector('.atomic-docs');
      if (root) {
        observer.observe(root, { attributes: true });
        bodyObserver.disconnect();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }
}