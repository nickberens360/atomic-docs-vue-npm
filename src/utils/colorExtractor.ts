/**
 * Utility for extracting CSS color variables from the DOM at runtime
 */

import { ref, onMounted } from 'vue';

/**
 * Determines if a CSS value represents a color
 * @param value The CSS value to check
 * @returns Boolean indicating if the value is a color
 */
function isColorValue(value: string): boolean {
  // Named CSS colors
  const namedColors = [
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
    'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
    'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
    'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
    'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
    'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
    'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
    'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred',
    'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
    'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
    'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
    'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
    'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy',
    'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
    'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue',
    'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown',
    'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey',
    'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'transparent', 'turquoise',
    'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
  ];

  // Check if value is a named color
  if (namedColors.includes(value.toLowerCase())) {
    return true;
  }

  // Check for hex colors, rgb/rgba, hsl/hsla
  if (/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(value) ||
      /^rgb\(|rgba\(|hsl\(|hsla\(/.test(value)) {
    return true;
  }

  // Improved CSS variable detection - matches var(--*) anywhere in the value
  if (/var\(--[^)]+\)/.test(value)) {
    return true;
  }

  // Enhanced Vuetify RGB detection - more flexible pattern
  // This checks for 2-3 comma-separated numbers that could be RGB or RGBA values
  if (/^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*([01](\.\d+)?|\.\d+))?\s*$/.test(value)) {
    // Validate that the values are in the valid RGB range (0-255)
    const parts = value.split(',').map(part => parseInt(part.trim(), 10));
    if (parts.length >= 3 &&
        parts[0] >= 0 && parts[0] <= 255 &&
        parts[1] >= 0 && parts[1] <= 255 &&
        parts[2] >= 0 && parts[2] <= 255) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a value is in comma-separated RGB/RGBA format (like "96,125,139" or "96,125,139,0.5")
 * @param value The value to check
 * @returns Boolean indicating if the value is in comma-separated RGB/RGBA format
 */
function isCommaSeparatedRgbFormat(value: string): boolean {
  return /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*([01](\.\d+)?|\.\d+))?\s*$/.test(value);
}

/**
 * Formats a color value to ensure it's a valid CSS color
 * @param value The color value to format
 * @returns A valid CSS color value
 */
function formatColorValue(value: string): string {
  // If it's a comma-separated RGB/RGBA value, convert it to a valid CSS rgb()/rgba() format
  if (isCommaSeparatedRgbFormat(value)) {
    const parts = value.split(',').map(part => part.trim());

    // Check if it has an alpha component (RGBA)
    if (parts.length >= 4) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]})`;
    }

    // RGB format
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }

  // Return other color values as-is
  return value;
}

/**
 * Extracts CSS variables that represent colors from the DOM
 * @returns Array of color objects with name and color properties
 */
export function extractCssColorVariables() {
  const colors = [];
  const processedVars = new Set(); // To avoid duplicates

  // Function to extract variables from a computed style
  const extractFromComputedStyle = (element) => {
    const styles = window.getComputedStyle(element);

    // Get all CSS variables from the element
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--') && !prop.startsWith('--atomic-docs-')) {
        if (processedVars.has(prop)) continue; // Skip if already processed

        processedVars.add(prop);
        const value = styles.getPropertyValue(prop).trim();
        if (isColorValue(value)) {
          colors.push({
            name: prop,
            color: formatColorValue(value)
          });
        }
      }
    }
  };

  // Extract from document root (as before)
  extractFromComputedStyle(document.documentElement);

  // Extract from all elements with inline styles
  document.querySelectorAll('[style]').forEach(element => {
    extractFromComputedStyle(element);
  });

  // Extract from all style elements
  document.querySelectorAll('style').forEach(styleEl => {
    try {
      // Try to access the CSS rules
      const styleSheet = styleEl.sheet;
      if (styleSheet) {
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
          const rule = styleSheet.cssRules[i];
          // Check if the rule is a CSSStyleRule before accessing style
          if (rule instanceof CSSStyleRule) {
            // Look for CSS variables in the style declaration
            for (let j = 0; j < rule.style.length; j++) {
              const prop = rule.style[j];
              if (prop.startsWith('--') && !prop.startsWith('--atomic-docs-')) {
                if (processedVars.has(prop)) continue; // Skip if already processed

                processedVars.add(prop);
                const value = rule.style.getPropertyValue(prop).trim();
                if (isColorValue(value)) {
                  colors.push({
                    name: prop,
                    color: formatColorValue(value)
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // Silently fail for cross-origin stylesheets
      console.warn('Could not access rules in stylesheet', e);
    }
  });

  return colors;
}

/**
 * Vue composable that provides reactive access to CSS color variables
 * @returns Object containing the extracted colors
 */
export function useExtractedColors() {
  const extractedColors = ref([]);

  const updateColors = () => {
    extractedColors.value = extractCssColorVariables();
  };

  onMounted(() => {
    updateColors();

    // Set up a MutationObserver to watch for style changes
    const observer = new MutationObserver(updateColors);

    // Observe the document for style changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Clean up the observer when the component is unmounted
    return () => {
      observer.disconnect();
    };
  });

  return {
    extractedColors
  };
}
