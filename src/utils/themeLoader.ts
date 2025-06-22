// src/plugins/component-documentation/src/utils/themeLoader.ts

/**
 * Utility for dynamically loading Prism.js themes based on the current app theme
 */

/**
 * Loads the appropriate Prism theme based on the current dark mode state
 * @param isDarkMode Boolean indicating if dark mode is active
 */
export function loadPrismTheme(isDarkMode: boolean): void {
  // Remove any previously loaded Prism themes
  const existingThemeLinks = document.querySelectorAll('link[data-prism-theme]');
  existingThemeLinks.forEach(link => link.remove());

  // Create and append the appropriate theme link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-prism-theme', 'true');

  if (isDarkMode) {
    // Use Prism's okaidia theme for dark mode
    link.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.min.css';
  } else {
    // For light mode, use the default theme
    link.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
  }

  document.head.appendChild(link);
}

/**
 * Initializes the Prism theme and sets up a watcher for theme changes
 * @param isDarkMode Ref<boolean> reactive reference to the dark mode state
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
        const element = mutation.target as HTMLElement;
        const isDark = element.classList.contains('docs-app-theme--dark');
        loadPrismTheme(isDark);
      }
    });
  });

  // Start observing the document body for theme class changes
  const rootElement = document.querySelector('.atomic-docs');
  if (rootElement) {
    observer.observe(rootElement, { attributes: true });
  } else {
    // If the root element isn't available yet, observe the body and look for it
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
