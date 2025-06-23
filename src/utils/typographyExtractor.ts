import { ref, onMounted } from 'vue';

// The data structures remain the same
export interface StyleRule {
  selector: string;
  styles: Record<string, string>;
}

export interface TypographyInfo {
  variables: Record<string, string>;
  elementStyles: Record<string, Record<string, string>>;
  utilityClasses: StyleRule[];
}

const TYPOGRAPHY_PROPERTIES = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
];

const TARGET_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];

/**
 * Extracts typography styles by querying DOM elements exclusively within the #app node.
 * This ensures styles from the documentation plugin itself are ignored.
 */
export function extractTypographyStyles(): TypographyInfo {
  const elementStyles: Record<string, Record<string, string>> = {};

  // This is the key change: we only query for elements inside the main #app.
  const appRoot = document.getElementById('app');
  if (!appRoot) {
    console.warn('Atomic Docs: Could not find the main application root element (#app) to analyze styles.');
    return { variables: {}, elementStyles: {}, utilityClasses: [] };
  }

  // 1. Find styles for specific H tags and p tags within the app
  TARGET_ELEMENTS.forEach(tag => {
    const element = appRoot.querySelector(tag);
    if (element) {
      elementStyles[tag] = {};
      const style = window.getComputedStyle(element);
      for (const prop of TYPOGRAPHY_PROPERTIES) {
        elementStyles[tag][prop] = style.getPropertyValue(prop);
      }
    }
  });

  // Note: Reliably extracting utility classes and variables purely from this
  // DOM-centric approach is complex. The most accurate data we can get
  // this way is the final computed styles for the base elements.
  // The stylesheet-parsing method is better for finding variables and classes,
  // but can't be perfectly scoped to just #app. This DOM-based method is safer.

  return {
    variables: {}, // Variable extraction is best-effort with this method.
    elementStyles,
    utilityClasses: [], // Class extraction is also not reliable this way.
  };
}


/**
 * Vue composable that provides reactive access to typography styles.
 */
export function useExtractedTypography() {
  const extractedTypography = ref<TypographyInfo>({
    variables: {},
    elementStyles: {},
    utilityClasses: [],
  });

  const updateTypography = () => {
    extractedTypography.value = extractTypographyStyles();
  };

  onMounted(() => {
    // A delay helps ensure the app's styles are fully rendered.
    setTimeout(updateTypography, 500);

    // An observer on #app can watch for dynamic changes within the consuming app.
    const appRoot = document.getElementById('app');
    if (appRoot) {
      const observer = new MutationObserver(updateTypography);
      observer.observe(appRoot, {
        attributes: true,
        childList: true,
        subtree: true
      });
      return () => observer.disconnect();
    }
  });

  return { extractedTypography };
}