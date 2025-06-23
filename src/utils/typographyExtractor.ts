import { ref, onMounted } from 'vue';

// Define the data structures for our findings
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

const TARGET_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'body'];

/**
 * Extracts typography styles by parsing CSS stylesheets.
 * This version identifies variables, element styles, and utility classes.
 * @returns An object containing all extracted typography information.
 */
export function extractTypographyStyles(): TypographyInfo {
  const variables: Record<string, string> = {};
  const elementStyles: Record<string, Record<string, string>> = {};
  const utilityClasses: StyleRule[] = [];

  Array.from(document.styleSheets).forEach(sheet => {
    if (sheet.href && (sheet.href.includes('atomic-docs') || sheet.href.includes('fonts.googleapis'))) {
      return;
    }

    try {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          const style = rule.style;
          const selector = rule.selectorText;
          const lowerSelector = selector.toLowerCase();

          // 1. Find CSS variables in :root
          if (lowerSelector === ':root') {
            for (const prop of style) {
              if (prop.startsWith('--')) {
                const lowerProp = prop.toLowerCase();
                if (lowerProp.includes('font') || lowerProp.includes('line-height') || lowerProp.includes('letter-spacing')) {
                  variables[prop] = style.getPropertyValue(prop).trim();
                }
              }
            }
          }

          // 2. Find styles for specific H tags and p tags
          if (TARGET_ELEMENTS.includes(lowerSelector)) {
            elementStyles[lowerSelector] = {};
            for (const prop of TYPOGRAPHY_PROPERTIES) {
              const value = style.getPropertyValue(prop);
              if (value) elementStyles[lowerSelector][prop] = value;
            }
          }

          // 3. Find utility classes (starts with a '.', no complex selectors)
          if (selector.startsWith('.') && !selector.includes(' ') && !selector.includes('>')) {
            const appliedStyles: Record<string, string> = {};
            for (const prop of TYPOGRAPHY_PROPERTIES) {
              const value = style.getPropertyValue(prop);
              if (value) {
                appliedStyles[prop] = value;
              }
            }
            if (Object.keys(appliedStyles).length > 0) {
              utilityClasses.push({ selector, styles: appliedStyles });
            }
          }
        }
      });
    } catch (e) {
      console.warn(`Could not read CSS rules from stylesheet: ${sheet.href}`, e);
    }
  });

  return { variables, elementStyles, utilityClasses };
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
    setTimeout(updateTypography, 200);
    const observer = new MutationObserver(updateTypography);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  return { extractedTypography };
}