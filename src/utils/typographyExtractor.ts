import { ref, onMounted } from 'vue';

// Interface for the extracted typography data
export interface TypographyInfo {
  scales: Record<string, Set<string>>;
  elementStyles: Record<string, Record<string, string>>;
}

// Target typography properties to extract
const TYPOGRAPHY_PROPERTIES = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
];

// Target elements to analyze
const TARGET_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];

/**
 * Extracts typography CSS variables and element styles from the DOM.
 * @returns An object containing typography scales and specific element styles.
 */
export function extractTypographyStyles(): TypographyInfo {
  const scales: Record<string, Set<string>> = {};
  TYPOGRAPHY_PROPERTIES.forEach(prop => {
    scales[prop] = new Set();
  });

  const elementStyles: Record<string, Record<string, string>> = {};

  // 1. Extract raw typography scales from all elements
  const allElements = document.querySelectorAll('body, body *');
  allElements.forEach(element => {
    if (element.closest('.atomic-docs')) return; // Exclude docs UI

    const style = window.getComputedStyle(element);
    TYPOGRAPHY_PROPERTIES.forEach(prop => {
      scales[prop].add(style.getPropertyValue(prop));
    });
  });

  // 2. Extract styles for specific target elements (h1, h2, etc.)
  TARGET_ELEMENTS.forEach(tag => {
    const element = document.querySelector(tag);
    if (element && !element.closest('.atomic-docs')) {
      elementStyles[tag] = {};
      const style = window.getComputedStyle(element);
      TYPOGRAPHY_PROPERTIES.forEach(prop => {
        elementStyles[tag][prop] = style.getPropertyValue(prop);
      });
    }
  });

  return { scales, elementStyles };
}


/**
 * Vue composable that provides reactive access to typography styles.
 * @returns An object containing the reactive extracted typography styles.
 */
export function useExtractedTypography() {
  const extractedTypography = ref<TypographyInfo>({
    scales: {},
    elementStyles: {}
  });

  const updateTypography = () => {
    extractedTypography.value = extractTypographyStyles();
  };

  onMounted(() => {
    setTimeout(updateTypography, 100);

    const observer = new MutationObserver(updateTypography);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  });

  return { extractedTypography };
}