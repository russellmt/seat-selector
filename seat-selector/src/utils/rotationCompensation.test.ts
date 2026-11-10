/**
 * Rotation Compensation Tests
 * 
 * Ensures that rotation compensation calculations are correct
 * and remain stable across changes.
 * 
 * These tests verify the mathematical calculations that prevent
 * icon/number misalignment during 90° rotations.
 */

import { describe, it, expect } from 'vitest';
import { getRotationCompensation } from './rotationCompensation';

describe('getRotationCompensation', () => {
  describe('DOWN rotation (0°)', () => {
    it('should return no offset for DOWN rotation', () => {
      const compensation = getRotationCompensation(2, 1, 'down');
      expect(compensation).toEqual({ offsetX: 0, offsetY: 0 });
    });

    it('should return no offset regardless of dimensions for DOWN', () => {
      expect(getRotationCompensation(3, 1, 'down')).toEqual({ offsetX: 0, offsetY: 0 });
      expect(getRotationCompensation(1, 1, 'down')).toEqual({ offsetX: 0, offsetY: 0 });
    });
  });

  describe('UP rotation (180°)', () => {
    it('should return no offset for UP rotation', () => {
      const compensation = getRotationCompensation(2, 1, 'up');
      expect(compensation).toEqual({ offsetX: 0, offsetY: 0 });
    });
  });

  describe('LEFT rotation (270°)', () => {
    it('loveseat (2x1): should offset LEFT by 0.5 and DOWN by 0.5', () => {
      const compensation = getRotationCompensation(2, 1, 'left');
      expect(compensation.offsetX).toBe(-0.5);
      expect(compensation.offsetY).toBe(0.5);
    });

    it('couch (3x1): should offset LEFT by 1.0 and DOWN by 1.0', () => {
      const compensation = getRotationCompensation(3, 1, 'left');
      expect(compensation.offsetX).toBe(-1.0);
      expect(compensation.offsetY).toBe(1.0);
    });

    it('should apply symmetric compensation for all LEFT rotations', () => {
      // offsetX = -(width - height) / 2
      // offsetY = (width - height) / 2
      const comp = getRotationCompensation(4, 1, 'left');
      expect(comp.offsetX).toBe(-1.5);
      expect(comp.offsetY).toBe(1.5);
      expect(Math.abs(comp.offsetX) + Math.abs(comp.offsetY)).toBe(3.0);
    });
  });

  describe('RIGHT rotation (90°)', () => {
    it('loveseat (2x1): should offset LEFT by 0.5 and DOWN by 0.5 (same as LEFT)', () => {
      const compensation = getRotationCompensation(2, 1, 'right');
      expect(compensation.offsetX).toBe(-0.5);
      expect(compensation.offsetY).toBe(0.5);
    });

    it('couch (3x1): should offset LEFT by 1.0 and DOWN by 1.0 (same as LEFT)', () => {
      const compensation = getRotationCompensation(3, 1, 'right');
      expect(compensation.offsetX).toBe(-1.0);
      expect(compensation.offsetY).toBe(1.0);
    });

    it('should apply identical compensation to LEFT and RIGHT rotations', () => {
      const leftComp = getRotationCompensation(2, 1, 'left');
      const rightComp = getRotationCompensation(2, 1, 'right');
      
      expect(leftComp).toEqual(rightComp);
    });
  });

  describe('Mathematical consistency', () => {
    it('compensation formula: offsetX = -(width - height) / 2', () => {
      // Test various dimensions
      const testCases = [
        { width: 2, height: 1, expectedX: -0.5 },
        { width: 3, height: 1, expectedX: -1.0 },
        { width: 4, height: 1, expectedX: -1.5 },
        { width: 3, height: 2, expectedX: -0.5 },
      ];

      testCases.forEach(({ width, height, expectedX }) => {
        const comp = getRotationCompensation(width, height, 'left');
        expect(comp.offsetX).toBe(expectedX);
      });
    });

    it('compensation formula: offsetY = (width - height) / 2', () => {
      // offsetY should be negative of offsetX (symmetric)
      const testCases = [
        { width: 2, height: 1, expectedY: 0.5 },
        { width: 3, height: 1, expectedY: 1.0 },
        { width: 4, height: 1, expectedY: 1.5 },
        { width: 3, height: 2, expectedY: 0.5 },
      ];

      testCases.forEach(({ width, height, expectedY }) => {
        const comp = getRotationCompensation(width, height, 'left');
        expect(comp.offsetY).toBe(expectedY);
      });
    });

    it('offsetX and offsetY should be negatives of each other', () => {
      const testRotations: Array<'left' | 'right'> = ['left', 'right'];
      const testDimensions = [
        { width: 2, height: 1 },
        { width: 3, height: 1 },
        { width: 4, height: 2 },
      ];

      testRotations.forEach(rotation => {
        testDimensions.forEach(({ width, height }) => {
          const comp = getRotationCompensation(width, height, rotation);
          expect(comp.offsetX).toBe(-comp.offsetY);
        });
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle square icons (width = height)', () => {
      const compensation = getRotationCompensation(1, 1, 'left');
      expect(compensation).toEqual({ offsetX: 0, offsetY: 0 });
    });

    it('should handle 1x1 icon rotation consistently', () => {
      const leftComp = getRotationCompensation(1, 1, 'left');
      const rightComp = getRotationCompensation(1, 1, 'right');
      const downComp = getRotationCompensation(1, 1, 'down');

      expect(leftComp).toEqual({ offsetX: 0, offsetY: 0 });
      expect(rightComp).toEqual({ offsetX: 0, offsetY: 0 });
      expect(downComp).toEqual({ offsetX: 0, offsetY: 0 });
    });
  });
});
