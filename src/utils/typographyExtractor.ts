import { ref, onMounted } from 'vue';

// Target typography properties to extract
const TYPOGRAPHY_PROPERTIES = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
];

/**
 * Extracts typography CSS styles from the DOM.
 * @returns An object containing arrays of unique values for each typography property.
 */
export function extractTypographyStyles() {
  const typography: Record<string, Set<string>> = {};
  TYPOGRAPHY_PROPERTIES.forEach(prop => {
    typography[prop] = new Set();
  });

  // Query all elements in the body
  const allElements = document.querySelectorAll('body, body *');

  allElements.forEach(element => {
    // Prevent reading styles from the docs UI itself to avoid feedback loops
    if (element.closest('.atomic-docs')) {
      return;
    }

    const style = window.getComputedStyle(element);
    TYPOGRAPHY_PROPERTIES.forEach(prop => {
      const value = style.getPropertyValue(prop);
      // Add the value if it's not the default/initial value and is not already present
      if (value) {
        typography[prop].add(value);
      }
    });
  });

  // Convert Sets to sorted arrays for consistent display
  const result: Record<string, string[]> = {};
  for (const prop in typography) {
    result[prop] = Array.from(typography[prop]).sort();
  }

  return result;
}


/**
 * Vue composable that provides reactive access to typography styles.
 * @returns An object containing the reactive extracted typography styles.
 */
export function useExtractedTypography() {
  const extractedTypography = ref<Record<string, string[]>>({});

  const updateTypography = () => {
    extractedTypography.value = extractTypographyStyles();
  };

  onMounted(() => {
    // Initial extraction after a short delay to ensure all application styles are loaded
    setTimeout(() => {
      updateTypography();
    }, 100);


    // Set up a MutationObserver to watch for style changes
    const observer = new MutationObserver(updateTypography);

    // Observe the document for attribute changes and DOM mutations that might affect styles
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });

    // Clean up the observer when the component is unmounted
    return () => {
      observer.disconnect();
    };
  });

  return {
    extractedTypography
  };
}