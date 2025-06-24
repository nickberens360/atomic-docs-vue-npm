/**
 * Performs a fuzzy search on text with the given pattern
 * @param text - The text to search in
 * @param pattern - The pattern to search for
 * @returns boolean indicating if the pattern matches the text
 */
export const fuzzyMatch = (text: string, pattern: string): boolean => {
  if (!pattern) return true;

  const lowerText = String(text).toLowerCase(); // Ensure text is a string
  const lowerPattern = pattern.toLowerCase();

  // For short search terms (1-2 chars), require word boundary matches
  if (lowerPattern.length <= 2) {
    // Check if pattern is at the start of the text
    if (lowerText.startsWith(lowerPattern)) {
      return true;
    }

    // Check if pattern appears after a delimiter
    const escapedPattern = lowerPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const delimiterPattern = new RegExp(`[-_\\s]${escapedPattern}`, 'i');
    return delimiterPattern.test(lowerText);
  }

  // For longer terms, prioritize word boundaries
  const words = lowerText.split(/[-_\s]/);

  // Check if pattern starts at the beginning of any word
  for (const word of words) {
    if (word.startsWith(lowerPattern)) {
      return true;
    }
  }

  // Fall back to standard fuzzy search with consecutive character bonus
  let patternIdx = 0;
  let textIdx = 0;
  let consecutiveMatches = 0;
  let maxConsecutive = 0;

  while (patternIdx < lowerPattern.length && textIdx < lowerText.length) {
    if (lowerPattern[patternIdx] === lowerText[textIdx]) {
      patternIdx++;
      consecutiveMatches++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
    } else {
      consecutiveMatches = 0;
    }
    textIdx++;
  }

  // Require at least 2 consecutive matches for longer patterns
  return patternIdx === lowerPattern.length && maxConsecutive >= 2;
};

/**
 * Creates a debounced version of a function
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};