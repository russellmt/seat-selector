/**
 * Property-based tests for rotation state cycling
 * Validates: Requirements 10.2, 10.3, 10.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { rotate, rotateN } from './rotation';
import type { Rotation } from '../types/Icon';

describe('Rotation Properties', () => {
  // Arbitrary for generating Rotation states
  const rotationArbitrary = fc.oneof(
    fc.constant('left' as Rotation),
    fc.constant('up' as Rotation),
    fc.constant('right' as Rotation),
    fc.constant('down' as Rotation)
  );

  describe('Property 4: Rotation State Cycles Through Cardinals', () => {
    it('**Validates: Requirements 10.2, 10.3, 10.4** - applying rotate 4 times returns to original state', () => {
      fc.assert(
        fc.property(rotationArbitrary, (initialRotation) => {
          // Apply rotate 4 times
          let result = initialRotation;
          for (let i = 0; i < 4; i++) {
            result = rotate(result);
          }
          // Should return to original
          expect(result).toBe(initialRotation);
        }),
        { numRuns: 100 }
      );
    });

    it('**Validates: Requirements 10.2, 10.3, 10.4** - rotation cycle is deterministic and follows left → up → right → down → left', () => {
      fc.assert(
        fc.property(rotationArbitrary, (initialRotation) => {
          const expectedCycles: Record<Rotation, Rotation[]> = {
            left: ['up', 'right', 'down', 'left'],
            up: ['right', 'down', 'left', 'up'],
            right: ['down', 'left', 'up', 'right'],
            down: ['left', 'up', 'right', 'down'],
          };

          const cycle = expectedCycles[initialRotation];
          let current = initialRotation;

          // Verify each step in the cycle
          for (let i = 0; i < 4; i++) {
            current = rotate(current);
            expect(current).toBe(cycle[i]);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('**Validates: Requirements 10.2, 10.3, 10.4** - each intermediate rotation step is correct', () => {
      fc.assert(
        fc.property(rotationArbitrary, (initialRotation) => {
          const steps: Record<Rotation, Rotation> = {
            left: 'up',
            up: 'right',
            right: 'down',
            down: 'left',
          };

          const nextRotation = rotate(initialRotation);
          expect(nextRotation).toBe(steps[initialRotation]);
        }),
        { numRuns: 100 }
      );
    });

    it('**Validates: Requirements 10.2, 10.3, 10.4** - rotateN with n=4 always returns to original', () => {
      fc.assert(
        fc.property(rotationArbitrary, (initialRotation) => {
          const result = rotateN(initialRotation, 4);
          expect(result).toBe(initialRotation);
        }),
        { numRuns: 100 }
      );
    });

    it('**Validates: Requirements 10.2, 10.3, 10.4** - rotateN with any multiple of 4 returns to original', () => {
      fc.assert(
        fc.property(rotationArbitrary, fc.integer({ min: 0, max: 100 }), (initialRotation, multiplier) => {
          const result = rotateN(initialRotation, multiplier * 4);
          expect(result).toBe(initialRotation);
        }),
        { numRuns: 100 }
      );
    });

    it('**Validates: Requirements 10.2, 10.3, 10.4** - rotateN cycles correctly for any positive integer', () => {
      fc.assert(
        fc.property(rotationArbitrary, fc.integer({ min: 0, max: 1000 }), (initialRotation, times) => {
          const result = rotateN(initialRotation, times);
          const expectedSteps = times % 4;

          // Manually apply rotate expectedSteps times
          let expected = initialRotation;
          for (let i = 0; i < expectedSteps; i++) {
            expected = rotate(expected);
          }

          expect(result).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });
  });
});
