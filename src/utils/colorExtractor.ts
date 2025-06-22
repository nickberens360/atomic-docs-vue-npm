/**
 * Utility for extracting CSS color variables from the DOM at runtime
 */

import { ref, onMounted, watch } from 'vue';

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

  return false;
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
            name: prop.replace('--', ''),
            color: value
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
          if (rule.style) {
            // Look for CSS variables in the style declaration
            for (let j = 0; j < rule.style.length; j++) {
              const prop = rule.style[j];
              if (prop.startsWith('--') && !prop.startsWith('--atomic-docs-')) {
                if (processedVars.has(prop)) continue; // Skip if already processed

                processedVars.add(prop);
                const value = rule.style.getPropertyValue(prop).trim();
                if (isColorValue(value)) {
                  colors.push({
                    name: prop.replace('--', ''),
                    color: value
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
  let observer = null;

  const updateColors = () => {
    extractedColors.value = extractCssColorVariables();
  };

  onMounted(() => {
    updateColors();

    // Set up a MutationObserver to watch for style changes
    observer = new MutationObserver(updateColors);

    // Observe the document body for style changes, including added/removed style elements
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true, // Watch for added/removed nodes
      subtree: true, // Watch all descendants
      characterData: true // Watch for text changes in style elements
    });

    // Also observe the document head for added/removed style elements
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });

  // Clean up function that will be called when the component is unmounted
  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // Return both the extracted colors and the cleanup function
  return {
    extractedColors,
    cleanup
  };
}
