/**
 * Icon Cycling Utility Functions
 *
 * Pure functions for cycling through icon selections with wrapping behavior.
 * These functions provide deterministic, cyclic navigation through icon arrays.
 */

/**
 * Cycles to the next icon in the array, wrapping to the first icon when at the end.
 *
 * **Validates: Requirements 9.1, 9.4**
 *
 * @param currentIndex - The current index of the selected icon
 * @param iconCount - The total number of icons in the array
 * @returns The index of the next icon (wrapping if necessary)
 * @throws {Error} If iconCount is less than 1
 *
 * @example
 * ```typescript
 * // With 4 icons (indices 0-3):
 * getCycledIndexRight(0, 4) // Returns 1
 * getCycledIndexRight(2, 4) // Returns 3
 * getCycledIndexRight(3, 4) // Returns 0 (wraps)
 * ```
 */
export function getCycledIndexRight(currentIndex: number, iconCount: number): number {
  if (iconCount < 1) {
    throw new Error('Icon count must be at least 1');
  }
  return (currentIndex + 1) % iconCount;
}

/**
 * Cycles to the previous icon in the array, wrapping to the last icon when before the start.
 *
 * **Validates: Requirements 9.2, 9.3**
 *
 * @param currentIndex - The current index of the selected icon
 * @param iconCount - The total number of icons in the array
 * @returns The index of the previous icon (wrapping if necessary)
 * @throws {Error} If iconCount is less than 1
 *
 * @example
 * ```typescript
 * // With 4 icons (indices 0-3):
 * getCycledIndexLeft(3, 4)  // Returns 2
 * getCycledIndexLeft(1, 4)  // Returns 0
 * getCycledIndexLeft(0, 4)  // Returns 3 (wraps)
 * ```
 */
export function getCycledIndexLeft(currentIndex: number, iconCount: number): number {
  if (iconCount < 1) {
    throw new Error('Icon count must be at least 1');
  }
  return (currentIndex - 1 + iconCount) % iconCount;
}

/**
 * Simulates multiple right arrow key presses, cycling through icons.
 *
 * @param startIndex - The starting index
 * @param iconCount - The total number of icons
 * @param pressCount - How many times to press the right arrow
 * @returns The final index after all presses
 * @throws {Error} If iconCount is less than 1
 *
 * @example
 * ```typescript
 * // Starting at index 1 with 4 icons, pressing right 3 times:
 * cycleRightN(1, 4, 3) // Returns 0 (1 → 2 → 3 → 0)
 * ```
 */
export function cycleRightN(startIndex: number, iconCount: number, pressCount: number): number {
  if (iconCount < 1) {
    throw new Error('Icon count must be at least 1');
  }
  return (startIndex + pressCount) % iconCount;
}

/**
 * Simulates multiple left arrow key presses, cycling through icons.
 *
 * @param startIndex - The starting index
 * @param iconCount - The total number of icons
 * @param pressCount - How many times to press the left arrow
 * @returns The final index after all presses
 * @throws {Error} If iconCount is less than 1
 *
 * @example
 * ```typescript
 * // Starting at index 2 with 4 icons, pressing left 3 times:
 * cycleLeftN(2, 4, 3) // Returns 3 (2 → 1 → 0 → 3)
 * ```
 */
export function cycleLeftN(startIndex: number, iconCount: number, pressCount: number): number {
  if (iconCount < 1) {
    throw new Error('Icon count must be at least 1');
  }
  return (startIndex - pressCount + iconCount * Math.ceil(pressCount / iconCount)) % iconCount;
}
