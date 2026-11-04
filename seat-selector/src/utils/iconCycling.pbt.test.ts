import { describe, it } from 'vitest';
import fc from 'fast-check';
import {
  getCycledIndexRight,
  getCycledIndexLeft,
  cycleRightN,
  cycleLeftN,
} from './iconCycling';

/**
 * Property-Based Tests for Icon Cycling
 *
 * **Property 3: Icon Cycling Wraps Correctly**
 *
 * For any icon bank with N icons, pressing the right arrow key N times SHALL result
 * in returning to the originally selected icon. Pressing the left arrow key N times
 * SHALL also return to the original icon.
 *
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 */
describe('Icon Cycling - Property Tests', () => {
  /**
   * Property Test: Cycling Right N Times Returns to Original
   *
   * For any:
   * - icons array with 1-20 items
   * - starting index 0 to N-1
   *
   * When:
   * - Cycle right N times (press right arrow N times)
   *
   * Then:
   * - End up back at starting index
   * - Demonstrates cyclic behavior (0 → 1 → 2 → ... → N-1 → 0)
   */
  it('Property 3: Icon Cycling Wraps Correctly - Right Direction', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        (iconCount) => {
          return fc.pre(iconCount >= 1);
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        (iconCount) => {
          // For each starting index
          for (let startIndex = 0; startIndex < iconCount; startIndex++) {
            // Cycle right N times
            const finalIndex = cycleRightN(startIndex, iconCount, iconCount);

            // Should return to original index
            if (finalIndex !== startIndex) {
              throw new Error(
                `Cycling right ${iconCount} times from index ${startIndex} should return to ${startIndex}, but got ${finalIndex}`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Cycling Left N Times Returns to Original
   *
   * For any:
   * - icons array with 1-20 items
   * - starting index 0 to N-1
   *
   * When:
   * - Cycle left N times (press left arrow N times)
   *
   * Then:
   * - End up back at starting index
   * - Demonstrates cyclic behavior (N-1 → ... → 2 → 1 → 0 → N-1)
   */
  it('Property 3: Icon Cycling Wraps Correctly - Left Direction', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        (iconCount) => {
          // For each starting index
          for (let startIndex = 0; startIndex < iconCount; startIndex++) {
            // Cycle left N times
            const finalIndex = cycleLeftN(startIndex, iconCount, iconCount);

            // Should return to original index
            if (finalIndex !== startIndex) {
              throw new Error(
                `Cycling left ${iconCount} times from index ${startIndex} should return to ${startIndex}, but got ${finalIndex}`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Right Wrap at Last Icon Boundary
   *
   * For any:
   * - icons array with 1-20 items
   *
   * When:
   * - At last icon (index N-1), press right arrow
   *
   * Then:
   * - Select first icon (index 0)
   * - Wraps forward
   */
  it('Property 3: Icon Cycling Wraps Correctly - Right Wrap at Boundary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        (iconCount) => {
          const lastIndex = iconCount - 1;
          const nextIndex = getCycledIndexRight(lastIndex, iconCount);

          // Pressing right at last icon should wrap to first icon
          if (nextIndex !== 0) {
            throw new Error(
              `At last icon (${lastIndex}) in array of ${iconCount}, pressing right should wrap to 0, but got ${nextIndex}`
            );
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Left Wrap at First Icon Boundary
   *
   * For any:
   * - icons array with 1-20 items
   *
   * When:
   * - At first icon (index 0), press left arrow
   *
   * Then:
   * - Select last icon (index N-1)
   * - Wraps backward
   */
  it('Property 3: Icon Cycling Wraps Correctly - Left Wrap at Boundary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        (iconCount) => {
          const firstIndex = 0;
          const prevIndex = getCycledIndexLeft(firstIndex, iconCount);

          // Pressing left at first icon should wrap to last icon
          const expectedLastIndex = iconCount - 1;
          if (prevIndex !== expectedLastIndex) {
            throw new Error(
              `At first icon (${firstIndex}) in array of ${iconCount}, pressing left should wrap to ${expectedLastIndex}, but got ${prevIndex}`
            );
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Multiple Complete Cycles
   *
   * For any:
   * - icons array with 1-20 items
   * - starting index 0 to N-1
   * - k cycles (k: 1-5)
   *
   * When:
   * - Cycle right k*N times
   *
   * Then:
   * - End up back at starting index
   * - Cyclic property holds for any number of complete cycles
   */
  it('Property 3: Icon Cycling Wraps Correctly - Multiple Complete Cycles', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        fc.integer({ min: 1, max: 5 }), // Number of complete cycles
        (iconCount, cycles) => {
          // For each starting index
          for (let startIndex = 0; startIndex < iconCount; startIndex++) {
            // Cycle right k*N times (k complete cycles)
            const pressCount = cycles * iconCount;
            const finalIndex = cycleRightN(startIndex, iconCount, pressCount);

            // Should return to original index after complete cycles
            if (finalIndex !== startIndex) {
              throw new Error(
                `After ${cycles} complete cycles (${pressCount} presses) from index ${startIndex} in array of ${iconCount}, should return to ${startIndex}, but got ${finalIndex}`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Single Icon Stays Same
   *
   * Edge case: With only 1 icon, cycling should always return to the same index.
   */
  it('Property 3: Icon Cycling Wraps Correctly - Single Icon Edge Case', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (pressCount) => {
        const iconCount = 1;
        const startIndex = 0;

        // Cycle right any number of times
        const rightResult = cycleRightN(startIndex, iconCount, pressCount);
        if (rightResult !== 0) {
          throw new Error(
            `With 1 icon, cycling right ${pressCount} times should stay at 0, but got ${rightResult}`
          );
        }

        // Cycle left any number of times
        const leftResult = cycleLeftN(startIndex, iconCount, pressCount);
        if (leftResult !== 0) {
          throw new Error(
            `With 1 icon, cycling left ${pressCount} times should stay at 0, but got ${leftResult}`
          );
        }

        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property Test: Two Icons Alternate
   *
   * Edge case: With 2 icons, cycling should alternate between 0 and 1.
   */
  it('Property 3: Icon Cycling Wraps Correctly - Two Icons Edge Case', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1 }), // Start at 0 or 1
        fc.integer({ min: 1, max: 20 }), // Number of presses
        (startIndex, pressCount) => {
          const iconCount = 2;

          // Cycle right
          const rightResult = cycleRightN(startIndex, iconCount, pressCount);
          const expectedRight = (startIndex + pressCount) % 2;
          if (rightResult !== expectedRight) {
            throw new Error(
              `With 2 icons starting at ${startIndex}, cycling right ${pressCount} times should result in ${expectedRight}, but got ${rightResult}`
            );
          }

          // Cycle left
          const leftResult = cycleLeftN(startIndex, iconCount, pressCount);
          const expectedLeft = (startIndex - pressCount + 2 * Math.ceil(pressCount / 2)) % 2;
          if (leftResult !== expectedLeft) {
            throw new Error(
              `With 2 icons starting at ${startIndex}, cycling left ${pressCount} times should result in ${expectedLeft}, but got ${leftResult}`
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Monotonic Sequence
   *
   * Single step cycling should produce a sequence that visits each icon exactly once
   * before returning to the start (for right cycling from index 0).
   */
  it('Property 3: Icon Cycling Wraps Correctly - Monotonic Sequence', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of icons
        (iconCount) => {
          // Starting from index 0, cycle right one step at a time
          const sequence: number[] = [0];
          let currentIndex = 0;

          for (let i = 0; i < iconCount; i++) {
            currentIndex = getCycledIndexRight(currentIndex, iconCount);
            sequence.push(currentIndex);
          }

          // Last index should be back at 0
          if (sequence[sequence.length - 1] !== 0) {
            throw new Error(
              `Sequence should end at 0, but ended at ${sequence[sequence.length - 1]}`
            );
          }

          // Should have iconCount + 1 elements (including return to start)
          if (sequence.length !== iconCount + 1) {
            throw new Error(
              `Sequence should have ${iconCount + 1} elements, but has ${sequence.length}`
            );
          }

          // First iconCount elements should be all different (a complete cycle)
          const firstCycle = sequence.slice(0, iconCount);
          const uniqueIndices = new Set(firstCycle);
          if (uniqueIndices.size !== iconCount) {
            throw new Error(
              `First ${iconCount} elements should all be unique, but got ${uniqueIndices.size} unique values`
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
