import { describe, it, expect } from 'vitest';
import { SeatNumberingService } from './SeatNumberingService';
import { createSeat, createGridPosition } from '../types/Seat';
import type { Seat } from '../types/Seat';
import type { IconConfig } from '../types/Icon';

// Mock icon configurations for testing
const mockIconConfigs = new Map<string, IconConfig>([
  [
    'chair-1',
    {
      id: 'chair-1',
      capacity: 1,
      size: { width: 1, height: 1 },
      name: 'Chair',
      color: '#8B4513',
      visual: { type: 'svg', content: '<rect />' },
    },
  ],
  [
    'loveseat-2',
    {
      id: 'loveseat-2',
      capacity: 2,
      size: { width: 2, height: 1 },
      name: 'Loveseat',
      color: '#D2691E',
      visual: { type: 'svg', content: '<rect />' },
    },
  ],
  [
    'couch-3',
    {
      id: 'couch-3',
      capacity: 3,
      size: { width: 3, height: 1 },
      name: 'Couch',
      color: '#A0522D',
      visual: { type: 'svg', content: '<rect />' },
    },
  ],
  [
    'table-round-4',
    {
      id: 'table-round-4',
      capacity: 0,
      size: { width: 2, height: 2 },
      name: 'Round Table',
      color: '#E8B4A2',
      visual: { type: 'svg', content: '<circle />' },
    },
  ],
]);

describe('SeatNumberingService', () => {
  describe('calculateSeatNumbers', () => {
    it('should handle empty seat array', () => {
      const seats: Seat[] = [];
      const result = SeatNumberingService.calculateSeatNumbers(seats);
      expect(result).toEqual([]);
    });

    it('should return seats unchanged (no number field)', () => {
      const seats = [createSeat('chair-1', createGridPosition(0, 0))];
      const result = SeatNumberingService.calculateSeatNumbers(seats);

      expect(result).toHaveLength(1);
      // Since seats no longer have numbers, verify structure is preserved
      expect(result[0].id).toBe(seats[0].id);
      expect(result[0].position).toEqual(seats[0].position);
    });
  });

  describe('getNumberForGridSquare', () => {
    it('should return 1 for single chair at [0,0]', () => {
      const seats = [createSeat('chair-1', createGridPosition(0, 0))];

      const number = SeatNumberingService.getNumberForGridSquare(
        createGridPosition(0, 0),
        seats,
        mockIconConfigs,
      );

      expect(number).toBe(1);
    });

    it('should return undefined for all table grid squares (capacity 0)', () => {
      const seats = [createSeat('table-round-4', createGridPosition(0, 0))];

      // Table has capacity 0, so all grid squares should return undefined
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(0, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBeUndefined();
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(1, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBeUndefined();
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(0, 1),
          seats,
          mockIconConfigs,
        ),
      ).toBeUndefined();
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(1, 1),
          seats,
          mockIconConfigs,
        ),
      ).toBeUndefined();
    });

    it('should return different numbers for loveseat grid squares', () => {
      const seats = [createSeat('loveseat-2', createGridPosition(0, 0))];

      // Loveseat is 2x1 (two grid squares horizontally)
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(0, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBe(1);
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(1, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBe(2);
    });

    it('should return different numbers for couch grid squares', () => {
      const seats = [createSeat('couch-3', createGridPosition(0, 0))];

      // Couch is 3x1 (three grid squares horizontally)
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(0, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBe(1);
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(1, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBe(2);
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(2, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBe(3);
    });

    it('should return undefined for unoccupied grid square', () => {
      const seats = [createSeat('chair-1', createGridPosition(0, 0))];

      const number = SeatNumberingService.getNumberForGridSquare(
        createGridPosition(5, 5),
        seats,
        mockIconConfigs,
      );

      expect(number).toBeUndefined();
    });

    it('should skip table when finding number for grid square', () => {
      const seats = [
        createSeat('table-round-4', createGridPosition(0, 0)), // capacity 0
        createSeat('chair-1', createGridPosition(2, 0)), // capacity 1
      ];

      // Table squares should return undefined
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(0, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBeUndefined();

      // Chair square should return 1
      expect(
        SeatNumberingService.getNumberForGridSquare(
          createGridPosition(2, 0),
          seats,
          mockIconConfigs,
        ),
      ).toBe(1);
    });
  });

  describe('createPositionToNumberMap', () => {
    it('should create map with single chair', () => {
      const seats = [createSeat('chair-1', createGridPosition(0, 0))];

      const map = SeatNumberingService.createPositionToNumberMap(seats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1);
      expect(map.size).toBe(1);
    });

    it('should create map with loveseat showing different numbers', () => {
      const seats = [createSeat('loveseat-2', createGridPosition(0, 0))];

      const map = SeatNumberingService.createPositionToNumberMap(seats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1);
      expect(map.get('1,0')).toBe(2);
      expect(map.size).toBe(2);
    });

    it('should create map with couch showing different numbers', () => {
      const seats = [createSeat('couch-3', createGridPosition(0, 0))];

      const map = SeatNumberingService.createPositionToNumberMap(seats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1);
      expect(map.get('1,0')).toBe(2);
      expect(map.get('2,0')).toBe(3);
      expect(map.size).toBe(3);
    });

    it('should exclude table from map', () => {
      const seats = [createSeat('table-round-4', createGridPosition(0, 0))];

      const map = SeatNumberingService.createPositionToNumberMap(seats, mockIconConfigs);

      expect(map.size).toBe(0); // Table has capacity 0, so no numbers
    });

    it('should create map with multiple seats', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('loveseat-2', createGridPosition(1, 0)),
      ];

      const map = SeatNumberingService.createPositionToNumberMap(seats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1); // Chair = 1
      expect(map.get('1,0')).toBe(2); // Loveseat first position = 2 (global numbering)
      expect(map.get('2,0')).toBe(3); // Loveseat second position = 3 (global numbering)
      expect(map.size).toBe(3);
    });

    it('should create map excluding tables', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('table-round-4', createGridPosition(2, 0)),
        createSeat('loveseat-2', createGridPosition(4, 0)),
      ];

      const map = SeatNumberingService.createPositionToNumberMap(seats, mockIconConfigs);

      // Chair at [0,0] = 1
      // Table at [2,0] and [3,0] = not in map (capacity 0)
      // Loveseat at [4,0] and [5,0] = 2 and 3 (global numbering continues from chair)
      expect(map.get('0,0')).toBe(1);
      expect(map.get('2,0')).toBeUndefined();
      expect(map.get('3,0')).toBeUndefined();
      expect(map.get('4,0')).toBe(2);
      expect(map.get('5,0')).toBe(3);
      expect(map.size).toBe(3); // 1 chair + 2 loveseat = 3 total
    });
  });

  describe('renumberSeat', () => {
    it('should return seat unchanged', () => {
      const seat = createSeat('chair-1', createGridPosition(0, 0));

      const updated = SeatNumberingService.renumberSeat(seat);

      expect(updated).toBe(seat);
    });
  });
});
