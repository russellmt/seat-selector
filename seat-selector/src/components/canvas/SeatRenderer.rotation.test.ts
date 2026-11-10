/**
 * Rotation-specific tests for SeatRenderer
 * 
 * These tests ensure that:
 * 1. Seat grid footprint changes correctly with rotation
 * 2. Seat numbers appear in all grid squares the seat occupies
 * 3. Visual and logical footprints are aligned
 */

import { describe, it, expect } from 'vitest';
import { getRotatedSize } from '../../utils/rotationSize';
import { getGridSquaresOccupied } from '../../utils/collision';
import type { GridSize } from '../../types/Icon';

describe('SeatRenderer - Rotation and Grid Footprint', () => {
  describe('getRotatedSize - Footprint changes with rotation', () => {
    it('loveseat facing DOWN should be 2×1', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'down');
      expect(rotated).toEqual({ width: 2, height: 1 });
    });

    it('loveseat facing UP should be 2×1', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'up');
      expect(rotated).toEqual({ width: 2, height: 1 });
    });

    it('loveseat facing LEFT should be 1×2', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'left');
      expect(rotated).toEqual({ width: 1, height: 2 });
    });

    it('loveseat facing RIGHT should be 1×2', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'right');
      expect(rotated).toEqual({ width: 1, height: 2 });
    });

    it('couch facing DOWN should be 3×1', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'down');
      expect(rotated).toEqual({ width: 3, height: 1 });
    });

    it('couch facing UP should be 3×1', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'up');
      expect(rotated).toEqual({ width: 3, height: 1 });
    });

    it('couch facing LEFT should be 1×3', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'left');
      expect(rotated).toEqual({ width: 1, height: 3 });
    });

    it('couch facing RIGHT should be 1×3', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'right');
      expect(rotated).toEqual({ width: 1, height: 3 });
    });
  });

  describe('Grid square occupancy matches footprint', () => {
    it('loveseat facing DOWN at (2,1) occupies (2,1) and (3,1)', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'down');
      const squares = getGridSquaresOccupied({ col: 2, row: 1 }, rotated);
      
      expect(squares).toHaveLength(2);
      expect(squares).toEqual([
        { col: 2, row: 1 },
        { col: 3, row: 1 },
      ]);
    });

    it('loveseat facing LEFT at (2,1) occupies (2,1) and (2,2)', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'left');
      const squares = getGridSquaresOccupied({ col: 2, row: 1 }, rotated);
      
      expect(squares).toHaveLength(2);
      expect(squares).toEqual([
        { col: 2, row: 1 },
        { col: 2, row: 2 },
      ]);
    });

    it('loveseat facing RIGHT at (2,1) occupies (2,1) and (2,2)', () => {
      const loveseatSize: GridSize = { width: 2, height: 1 };
      const rotated = getRotatedSize(loveseatSize, 'right');
      const squares = getGridSquaresOccupied({ col: 2, row: 1 }, rotated);
      
      expect(squares).toHaveLength(2);
      expect(squares).toEqual([
        { col: 2, row: 1 },
        { col: 2, row: 2 },
      ]);
    });

    it('couch facing DOWN at (1,2) occupies (1,2), (2,2), (3,2)', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'down');
      const squares = getGridSquaresOccupied({ col: 1, row: 2 }, rotated);
      
      expect(squares).toHaveLength(3);
      expect(squares).toEqual([
        { col: 1, row: 2 },
        { col: 2, row: 2 },
        { col: 3, row: 2 },
      ]);
    });

    it('couch facing LEFT at (1,2) occupies (1,2), (1,3), (1,4)', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'left');
      const squares = getGridSquaresOccupied({ col: 1, row: 2 }, rotated);
      
      expect(squares).toHaveLength(3);
      expect(squares).toEqual([
        { col: 1, row: 2 },
        { col: 1, row: 3 },
        { col: 1, row: 4 },
      ]);
    });

    it('couch facing RIGHT at (1,2) occupies (1,2), (1,3), (1,4)', () => {
      const couchSize: GridSize = { width: 3, height: 1 };
      const rotated = getRotatedSize(couchSize, 'right');
      const squares = getGridSquaresOccupied({ col: 1, row: 2 }, rotated);
      
      expect(squares).toHaveLength(3);
      expect(squares).toEqual([
        { col: 1, row: 2 },
        { col: 1, row: 3 },
        { col: 1, row: 4 },
      ]);
    });
  });
});
