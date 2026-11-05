/**
 * Unit Tests for Collision Detection and Path Calculation
 * Tests collision detection, Bresenham's line algorithm, and path calculations
 */

import { describe, it, expect } from 'vitest';
import {
  hasCollision,
  calculateDragPath,
  findSeatsInPath,
  getGridSquaresOccupied,
  positionOverlapsSeat,
} from './collision';
import type { Seat } from '../types/Seat';
import type { GridSize } from '../types/Icon';
import { createSeat, createGridPosition } from '../types/Seat';
import type { IconConfig } from '../types/Icon';
import type { GridDimensions } from './gridCoordinates';

describe('Collision Detection and Path Calculation', () => {
  const defaultGridDimensions: GridDimensions = {
    squareSize: 50,
    offsetX: 0,
    offsetY: 0,
    cols: 20,
    rows: 20,
  };

  const chair1x1: GridSize = { width: 1, height: 1 };
  const table2x2: GridSize = { width: 2, height: 2 };
  const loveseat2x1: GridSize = { width: 2, height: 1 };

  describe('getGridSquaresOccupied', () => {
    it('should return single square for 1x1 seat', () => {
      const position = createGridPosition(5, 5);
      const occupied = getGridSquaresOccupied(position, chair1x1);

      expect(occupied).toEqual([{ col: 5, row: 5 }]);
    });

    it('should return 4 squares for 2x2 seat', () => {
      const position = createGridPosition(5, 5);
      const occupied = getGridSquaresOccupied(position, table2x2);

      expect(occupied).toHaveLength(4);
      expect(occupied).toEqual([
        { col: 5, row: 5 },
        { col: 6, row: 5 },
        { col: 5, row: 6 },
        { col: 6, row: 6 },
      ]);
    });

    it('should return 2 squares for 2x1 seat (loveseat)', () => {
      const position = createGridPosition(3, 7);
      const occupied = getGridSquaresOccupied(position, loveseat2x1);

      expect(occupied).toHaveLength(2);
      expect(occupied).toEqual([
        { col: 3, row: 7 },
        { col: 4, row: 7 },
      ]);
    });

    it('should handle seat at origin (0,0)', () => {
      const position = createGridPosition(0, 0);
      const occupied = getGridSquaresOccupied(position, table2x2);

      expect(occupied).toEqual([
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 1 },
        { col: 1, row: 1 },
      ]);
    });
  });

  describe('calculateDragPath', () => {
    it('should return single point when start equals end', () => {
      const start = createGridPosition(5, 5);
      const end = createGridPosition(5, 5);
      const path = calculateDragPath(start, end);

      expect(path).toEqual([{ col: 5, row: 5 }]);
    });

    it('should draw horizontal line to the right', () => {
      const start = createGridPosition(0, 0);
      const end = createGridPosition(4, 0);
      const path = calculateDragPath(start, end);

      expect(path).toEqual([
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
        { col: 3, row: 0 },
        { col: 4, row: 0 },
      ]);
    });

    it('should draw horizontal line to the left', () => {
      const start = createGridPosition(4, 0);
      const end = createGridPosition(0, 0);
      const path = calculateDragPath(start, end);

      expect(path).toEqual([
        { col: 4, row: 0 },
        { col: 3, row: 0 },
        { col: 2, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 0 },
      ]);
    });

    it('should draw vertical line downward', () => {
      const start = createGridPosition(0, 0);
      const end = createGridPosition(0, 4);
      const path = calculateDragPath(start, end);

      expect(path).toEqual([
        { col: 0, row: 0 },
        { col: 0, row: 1 },
        { col: 0, row: 2 },
        { col: 0, row: 3 },
        { col: 0, row: 4 },
      ]);
    });

    it('should draw vertical line upward', () => {
      const start = createGridPosition(0, 4);
      const end = createGridPosition(0, 0);
      const path = calculateDragPath(start, end);

      expect(path).toEqual([
        { col: 0, row: 4 },
        { col: 0, row: 3 },
        { col: 0, row: 2 },
        { col: 0, row: 1 },
        { col: 0, row: 0 },
      ]);
    });

    it('should draw diagonal line (45 degrees)', () => {
      const start = createGridPosition(0, 0);
      const end = createGridPosition(4, 4);
      const path = calculateDragPath(start, end);

      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual({ col: 0, row: 0 });
      expect(path[path.length - 1]).toEqual({ col: 4, row: 4 });
    });

    it('should draw diagonal line (shallow slope)', () => {
      const start = createGridPosition(0, 0);
      const end = createGridPosition(10, 3);
      const path = calculateDragPath(start, end);

      expect(path[0]).toEqual({ col: 0, row: 0 });
      expect(path[path.length - 1]).toEqual({ col: 10, row: 3 });
      // Path should be monotonic in both directions
      for (let i = 0; i < path.length - 1; i++) {
        expect(path[i + 1].col).toBeGreaterThanOrEqual(path[i].col);
        expect(path[i + 1].row).toBeGreaterThanOrEqual(path[i].row);
      }
    });

    it('should draw diagonal line (steep slope)', () => {
      const start = createGridPosition(0, 0);
      const end = createGridPosition(3, 10);
      const path = calculateDragPath(start, end);

      expect(path[0]).toEqual({ col: 0, row: 0 });
      expect(path[path.length - 1]).toEqual({ col: 3, row: 10 });
    });
  });

  describe('findSeatsInPath', () => {
    it('should find no seats in empty path', () => {
      const path = [createGridPosition(5, 5)];
      const existingSeats: Seat[] = [];
      const iconConfigs = new Map<string, IconConfig>();

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toEqual([]);
    });

    it('should find single seat at path position', () => {
      const path = [createGridPosition(5, 5)];
      const seat = createSeat('chair', createGridPosition(5, 5), 'down', 1);
      const existingSeats = [seat];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'chair',
          {
            id: 'chair',
            capacity: 1,
            size: chair1x1,
            name: 'Chair',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toHaveLength(1);
      expect(seats[0].id).toBe(seat.id);
    });

    it('should find multi-grid seat when path touches it', () => {
      const path = [
        createGridPosition(5, 5),
        createGridPosition(6, 5),
        createGridPosition(7, 5),
      ];
      const seat = createSeat('table', createGridPosition(5, 5), 'down', 1);
      const existingSeats = [seat];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'table',
          {
            id: 'table',
            capacity: 0,
            size: table2x2,
            name: 'Table',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toHaveLength(1);
      expect(seats[0].id).toBe(seat.id);
    });

    it('should deduplicate seats in path', () => {
      // Path touches same seat at multiple positions
      const path = [
        createGridPosition(5, 5),
        createGridPosition(6, 5),
        createGridPosition(5, 6),
        createGridPosition(6, 6),
      ];
      const seat = createSeat('table', createGridPosition(5, 5), 'down', 1);
      const existingSeats = [seat];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'table',
          {
            id: 'table',
            capacity: 0,
            size: table2x2,
            name: 'Table',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toHaveLength(1); // Should have exactly one seat, deduplicated
      expect(seats[0].id).toBe(seat.id);
    });

    it('should find multiple seats in path', () => {
      const path = [
        createGridPosition(0, 0),
        createGridPosition(5, 5),
        createGridPosition(10, 10),
      ];
      const seat1 = createSeat('chair', createGridPosition(0, 0), 'down', 1);
      const seat2 = createSeat('chair', createGridPosition(5, 5), 'down', 2);
      const seat3 = createSeat('chair', createGridPosition(10, 10), 'down', 3);
      const existingSeats = [seat1, seat2, seat3];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'chair',
          {
            id: 'chair',
            capacity: 1,
            size: chair1x1,
            name: 'Chair',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toHaveLength(3);
      expect(seats.map((s) => s.id)).toContain(seat1.id);
      expect(seats.map((s) => s.id)).toContain(seat2.id);
      expect(seats.map((s) => s.id)).toContain(seat3.id);
    });
  });

  describe('positionOverlapsSeat', () => {
    it('should detect overlap with 1x1 seat', () => {
      const position = createGridPosition(5, 5);
      const seat = createSeat('chair', createGridPosition(5, 5), 'down', 1);

      const overlaps = positionOverlapsSeat(position, seat, chair1x1);

      expect(overlaps).toBe(true);
    });

    it('should not detect overlap outside 1x1 seat', () => {
      const position = createGridPosition(5, 5);
      const seat = createSeat('chair', createGridPosition(6, 6), 'down', 1);

      const overlaps = positionOverlapsSeat(position, seat, chair1x1);

      expect(overlaps).toBe(false);
    });

    it('should detect overlap with 2x2 table at corner', () => {
      const position = createGridPosition(6, 6);
      const seat = createSeat('table', createGridPosition(5, 5), 'down', 1);

      const overlaps = positionOverlapsSeat(position, seat, table2x2);

      expect(overlaps).toBe(true);
    });

    it('should not detect overlap outside 2x2 table', () => {
      const position = createGridPosition(7, 7);
      const seat = createSeat('table', createGridPosition(5, 5), 'down', 1);

      const overlaps = positionOverlapsSeat(position, seat, table2x2);

      expect(overlaps).toBe(false);
    });

    it('should detect overlap with loveseat at any occupied square', () => {
      const seat = createSeat('loveseat', createGridPosition(5, 5), 'down', 1);

      const overlap1 = positionOverlapsSeat(
        createGridPosition(5, 5),
        seat,
        loveseat2x1,
      );
      const overlap2 = positionOverlapsSeat(
        createGridPosition(6, 5),
        seat,
        loveseat2x1,
      );
      const overlap3 = positionOverlapsSeat(
        createGridPosition(7, 5),
        seat,
        loveseat2x1,
      );

      expect(overlap1).toBe(true);
      expect(overlap2).toBe(true);
      expect(overlap3).toBe(false);
    });
  });

  describe('hasCollision', () => {
    it('should return false for empty canvas', () => {
      const position = createGridPosition(5, 5);
      const existingSeats: Seat[] = [];

      const collision = hasCollision(
        position,
        chair1x1,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(false);
    });

    it('should detect collision with existing 1x1 seat', () => {
      const position = createGridPosition(5, 5);
      const existingSeat = createSeat(
        'chair',
        createGridPosition(5, 5),
        'down',
        1,
      );
      const existingSeats = [existingSeat];

      const collision = hasCollision(
        position,
        chair1x1,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(true);
    });

    it('should not detect collision with non-overlapping seat', () => {
      const position = createGridPosition(5, 5);
      const existingSeat = createSeat(
        'chair',
        createGridPosition(10, 10),
        'down',
        1,
      );
      const existingSeats = [existingSeat];

      const collision = hasCollision(
        position,
        chair1x1,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(false);
    });

    it('should detect collision with 2x2 table partially overlapping', () => {
      const position = createGridPosition(5, 5);
      const existingSeat = createSeat('table', createGridPosition(4, 4), 'down', 1);
      const existingSeats = [existingSeat];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'table',
          {
            id: 'table',
            capacity: 0,
            size: table2x2,
            name: 'Table',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const collision = hasCollision(
        position,
        table2x2,
        existingSeats,
        defaultGridDimensions,
        iconConfigs,
      );

      expect(collision).toBe(true);
    });

    it('should detect out-of-bounds collision (top-left)', () => {
      const position = createGridPosition(-1, -1);
      const existingSeats: Seat[] = [];

      const collision = hasCollision(
        position,
        chair1x1,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(true);
    });

    it('should detect out-of-bounds collision (bottom-right)', () => {
      const position = createGridPosition(19, 19);
      const existingSeats: Seat[] = [];

      const collision = hasCollision(
        position,
        table2x2,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(true); // 2x2 table at (19,19) extends outside bounds
    });

    it('should allow placement at valid boundary', () => {
      const position = createGridPosition(18, 18);
      const existingSeats: Seat[] = [];

      const collision = hasCollision(
        position,
        chair1x1,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(false);
    });

    it('should detect collision with multiple existing seats', () => {
      const position = createGridPosition(5, 5);
      const seat1 = createSeat('chair', createGridPosition(0, 0), 'down', 1);
      const seat2 = createSeat('chair', createGridPosition(5, 5), 'down', 2);
      const seat3 = createSeat('chair', createGridPosition(15, 15), 'down', 3);
      const existingSeats = [seat1, seat2, seat3];

      const collision = hasCollision(
        position,
        chair1x1,
        existingSeats,
        defaultGridDimensions,
      );

      expect(collision).toBe(true);
    });
  });

  describe('Integration Tests: Path Calculation and Seat Finding', () => {
    it('should find all seats in horizontal drag path', () => {
      const start = createGridPosition(0, 5);
      const end = createGridPosition(5, 5);
      const path = calculateDragPath(start, end);

      const seat1 = createSeat('chair', createGridPosition(1, 5), 'down', 1);
      const seat2 = createSeat('chair', createGridPosition(3, 5), 'down', 2);
      const seat3 = createSeat('chair', createGridPosition(10, 5), 'down', 3);
      const existingSeats = [seat1, seat2, seat3];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'chair',
          {
            id: 'chair',
            capacity: 1,
            size: chair1x1,
            name: 'Chair',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toHaveLength(2);
      expect(seats.map((s) => s.id)).toContain(seat1.id);
      expect(seats.map((s) => s.id)).toContain(seat2.id);
    });

    it('should find multi-grid seats along diagonal path', () => {
      const start = createGridPosition(0, 0);
      const end = createGridPosition(4, 4);
      const path = calculateDragPath(start, end);

      const table = createSeat('table', createGridPosition(2, 2), 'down', 1);
      const existingSeats = [table];
      const iconConfigs = new Map<string, IconConfig>([
        [
          'table',
          {
            id: 'table',
            capacity: 0,
            size: table2x2,
            name: 'Table',
            visual: { type: 'svg', content: '' },
            color: '#000',
          },
        ],
      ]);

      const seats = findSeatsInPath(path, existingSeats, iconConfigs);

      expect(seats).toHaveLength(1);
      expect(seats[0].id).toBe(table.id);
    });
  });
});
