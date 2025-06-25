/**
 * Utility for extracting CSS color variables from the DOM at runtime
 */

import { ref, onMounted } from 'vue';

/**
 * Validates an alpha value (0-1 or 0-100%)
 * @param alpha The alpha value string to validate
 * @returns Boolean indicating if the alpha value is valid
 */
function isValidAlphaValue(alpha: string): boolean {
  if (alpha.endsWith('%')) {
    const percent = parseFloat(alpha);
    return !isNaN(percent) && percent >= 0 && percent <= 100;
  } else {
    const num = parseFloat(alpha);
    return !isNaN(num) && num >= 0 && num <= 1;
  }
}

/**
 * Determines if a CSS value represents a color
 * @param value The CSS value to check
 * @param element Optional element to use for resolving CSS variables
 * @returns Boolean indicating if the value is a color
 */
function isColorValue(value: string, element?: Element): boolean {
  // If no value or empty string, it's not a color
  if (!value || value.trim() === '') {
    return false;
  }

  // Normalize the value by trimming and converting to lowercase
  const normalizedValue = value.trim().toLowerCase();

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

  // Special color keywords
  const specialColorKeywords = ['currentcolor', 'transparent', 'inherit', 'initial', 'unset'];

  // Check if value is a named color or special keyword
  if (namedColors.includes(normalizedValue) || specialColorKeywords.includes(normalizedValue)) {
    return true;
  }

  // Check for hex colors with more precise regex
  if (/^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.test(normalizedValue)) {
    return true;
  }

  // Improved RGB/RGBA validation
  if (/^rgba?\s*\(/i.test(normalizedValue)) {
    // Extract values inside parentheses
    const rgbMatch = normalizedValue.match(/^rgba?\s*\(\s*([^)]+)\s*\)$/i);
    if (rgbMatch && rgbMatch[1]) {
      const values = rgbMatch[1].split(',').map(v => v.trim());

      // RGB requires 3 values, RGBA requires 4
      if (values.length === 3 || values.length === 4) {
        // Check if RGB values are valid (0-255 or 0-100%)
        const validRGB = values.slice(0, 3).every(v => {
          if (v.endsWith('%')) {
            const percent = parseFloat(v);
            return !isNaN(percent) && percent >= 0 && percent <= 100;
          } else {
            const num = parseInt(v, 10);
            return !isNaN(num) && num >= 0 && num <= 255;
          }
        });

        // If RGBA, check alpha value
        let validAlpha = true;
        if (values.length === 4) {
          validAlpha = isValidAlphaValue(values[3]);
        }

        return validRGB && validAlpha;
      }
    }
  }

  // Improved HSL/HSLA validation
  if (/^hsla?\s*\(/i.test(normalizedValue)) {
    // Extract values inside parentheses
    const hslMatch = normalizedValue.match(/^hsla?\s*\(\s*([^)]+)\s*\)$/i);
    if (hslMatch && hslMatch[1]) {
      const values = hslMatch[1].split(',').map(v => v.trim());

      // HSL requires 3 values, HSLA requires 4
      if (values.length === 3 || values.length === 4) {
        // Check hue (0-360deg, or turn, rad, grad)
        const hue = values[0];
        const validHue = /^\d+(\.\d+)?(deg|turn|rad|grad)?$/.test(hue) ||
                         !isNaN(parseFloat(hue));

        // Check saturation and lightness (0-100%)
        const validSL = values.slice(1, 3).every(v => {
          if (v.endsWith('%')) {
            const percent = parseFloat(v);
            return !isNaN(percent) && percent >= 0 && percent <= 100;
          }
          return false; // S and L must be percentages
        });

        // If HSLA, check alpha value
        let validAlpha = true;
        if (values.length === 4) {
          validAlpha = isValidAlphaValue(values[3]);
        }

        return validHue && validSL && validAlpha;
      }
    }
  }

  // Modern color functions (color, lab, lch, hwb, oklch, oklab)
  if (/^(color|lab|lch|hwb|oklch|oklab)\s*\(/i.test(normalizedValue)) {
    // For simplicity, we'll just check if it has the right format
    // A more robust check would validate the specific parameters for each function
    return /^(color|lab|lch|hwb|oklch|oklab)\s*\([^)]+\)$/i.test(normalizedValue);
  }

  // CSS variable handling with fallback support
  if (/var\s*\(/.test(normalizedValue)) {
    // Extract the variable name and potential fallback
    const varMatch = normalizedValue.match(/var\s*\(\s*([^,)]+)(?:,\s*([^)]+))?\s*\)/);
    if (varMatch) {
      const varName = varMatch[1].trim();
      const fallback = varMatch[2]?.trim();

      // Try to resolve the variable if we have an element
      if (element) {
        const computedStyles = window.getComputedStyle(element);
        const resolvedValue = computedStyles.getPropertyValue(varName).trim();

        // If we got a value, check if it's a color
        if (resolvedValue && resolvedValue !== value) {
          return isColorValue(resolvedValue);
        }
      }

      // If we have a fallback and couldn't resolve the variable, check the fallback
      if (fallback) {
        return isColorValue(fallback);
      }
    }

    // If we couldn't resolve the variable or check a fallback, default to false
    return false;
  }

  // Enhanced comma-separated RGB detection
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
  const colors: { name: string; color: string }[] = [];
  const processedVars = new Set(); // To avoid duplicates

  // Function to extract variables from a computed style
  const extractFromComputedStyle = (element: Element) => {
    const styles = window.getComputedStyle(element);

    // Get all CSS variables from the element
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--') && !prop.startsWith('--atomic-docs-')) {
        if (processedVars.has(prop)) continue; // Skip if already processed

        processedVars.add(prop);
        const value = styles.getPropertyValue(prop).trim();
        if (isColorValue(value, element)) {
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
                // For style rules, we don't have a specific element to resolve against
                // We'll use document.documentElement as a fallback
                if (isColorValue(value, document.documentElement)) {
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
  const extractedColors = ref<{ name: string; color: string }[]>([]);
  let cleanup: (() => void) | undefined;

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

    // Store the cleanup function
    cleanup = () => {
      observer.disconnect();
    };
  });

  return {
    extractedColors,
    cleanup
  };
}
