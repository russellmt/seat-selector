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

// Helper to get icon config for testing getSeatNumberAt and createPositionToNumberMap

describe('SeatNumberingService', () => {
  describe('calculateSeatNumbers', () => {
    it('should number empty seat array as empty', () => {
      const seats: Seat[] = [];
      const result = SeatNumberingService.calculateSeatNumbers(seats);
      expect(result).toEqual([]);
    });

    it('should number single seat as 1', () => {
      const seats = [createSeat('chair-1', createGridPosition(0, 0))];
      const result = SeatNumberingService.calculateSeatNumbers(seats);

      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
    });

    it('should number left-to-right on same row', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(2, 0)),
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('chair-1', createGridPosition(1, 0)),
      ];

      const result = SeatNumberingService.calculateSeatNumbers(seats);
      const sortedByPosition = result.sort((a, b) => a.position.col - b.position.col);

      expect(sortedByPosition[0].number).toBe(1); // col 0
      expect(sortedByPosition[1].number).toBe(2); // col 1
      expect(sortedByPosition[2].number).toBe(3); // col 2
    });

    it('should number top-to-bottom on different rows', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 2)),
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('chair-1', createGridPosition(0, 1)),
      ];

      const result = SeatNumberingService.calculateSeatNumbers(seats);
      const sortedByPosition = result.sort((a, b) => a.position.row - b.position.row);

      expect(sortedByPosition[0].number).toBe(1); // row 0
      expect(sortedByPosition[1].number).toBe(2); // row 1
      expect(sortedByPosition[2].number).toBe(3); // row 2
    });

    it('should number left-to-right then top-to-bottom (row priority)', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(1, 0)), // row 0, col 1
        createSeat('chair-1', createGridPosition(0, 1)), // row 1, col 0
        createSeat('chair-1', createGridPosition(0, 0)), // row 0, col 0
      ];

      const result = SeatNumberingService.calculateSeatNumbers(seats);

      // Find seats by position to check their numbers
      const seat00 = result.find(s => s.position.col === 0 && s.position.row === 0);
      const seat10 = result.find(s => s.position.col === 1 && s.position.row === 0);
      const seat01 = result.find(s => s.position.col === 0 && s.position.row === 1);

      expect(seat00!.number).toBe(1); // First (row 0, col 0)
      expect(seat10!.number).toBe(2); // Second (row 0, col 1)
      expect(seat01!.number).toBe(3); // Third (row 1, col 0)
    });

    it('should handle multi-grid seats (2x1 loveseat)', () => {
      const seats = [
        createSeat('loveseat-2', createGridPosition(0, 0)), // Occupies (0,0) and (1,0)
        createSeat('chair-1', createGridPosition(2, 0)),
      ];

      const result = SeatNumberingService.calculateSeatNumbers(seats);

      const loveseat = result.find(s => s.iconId === 'loveseat-2');
      const chair = result.find(s => s.iconId === 'chair-1');

      expect(loveseat!.number).toBe(1); // First (position row 0, col 0)
      expect(chair!.number).toBe(2); // Second (position row 0, col 2)
    });

    it('should handle multi-grid seats (2x2 table)', () => {
      const seats = [
        createSeat('table-round-4', createGridPosition(0, 0)), // Occupies 4 grid squares
        createSeat('chair-1', createGridPosition(3, 0)),
      ];

      const result = SeatNumberingService.calculateSeatNumbers(seats);

      const table = result.find(s => s.iconId === 'table-round-4');
      const chair = result.find(s => s.iconId === 'chair-1');

      expect(table!.number).toBe(1); // First (position row 0, col 0)
      expect(chair!.number).toBe(2); // Second (position row 0, col 3)
    });

    it('should renumber when seats change positions', () => {
      let seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('chair-1', createGridPosition(1, 0)),
      ];

      let result = SeatNumberingService.calculateSeatNumbers(seats);
      const firstSeatId = result[0].id;
      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(2);

      // Simulate moving first seat to position (2, 0)
      seats = [
        { ...seats[0], position: createGridPosition(2, 0) },
        seats[1],
      ];

      result = SeatNumberingService.calculateSeatNumbers(seats);

      // After renumbering, the original first seat should now be number 2
      const movedSeat = result.find(s => s.id === firstSeatId);
      expect(movedSeat!.number).toBe(2);
    });

    it('should handle complex grid with mixed sizes', () => {
      const seats = [
        createSeat('loveseat-2', createGridPosition(0, 0)), // 2x1 at (0,0)
        createSeat('chair-1', createGridPosition(2, 0)),    // 1x1 at (2,0)
        createSeat('chair-1', createGridPosition(0, 1)),    // 1x1 at (0,1)
        createSeat('table-round-4', createGridPosition(2, 1)), // 2x2 at (2,1)
      ];

      const result = SeatNumberingService.calculateSeatNumbers(seats);

      expect(result).toHaveLength(4);
      expect(result.map(s => s.number)).toEqual([1, 2, 3, 4]);

      // Verify positioning is correct
      const seat1 = result.find(s => s.number === 1);
      const seat2 = result.find(s => s.number === 2);
      const seat3 = result.find(s => s.number === 3);
      const seat4 = result.find(s => s.number === 4);

      expect(seat1!.position).toEqual(createGridPosition(0, 0));
      expect(seat2!.position).toEqual(createGridPosition(2, 0));
      expect(seat3!.position).toEqual(createGridPosition(0, 1));
      expect(seat4!.position).toEqual(createGridPosition(2, 1));
    });

    it('should preserve seat IDs and other properties during numbering', () => {
      const originalSeat = createSeat('chair-1', createGridPosition(0, 0), 'left');
      const seats = [originalSeat];

      const result = SeatNumberingService.calculateSeatNumbers(seats);

      expect(result[0].id).toBe(originalSeat.id);
      expect(result[0].iconId).toBe(originalSeat.iconId);
      expect(result[0].position).toEqual(originalSeat.position);
      expect(result[0].rotation).toBe('left');
    });
  });

  describe('getSeatNumberAt', () => {
    it('should return seat number for grid square occupied by 1x1 seat', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
      ];
      const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

      const seatNumber = SeatNumberingService.getSeatNumberAt(
        createGridPosition(0, 0),
        numberedSeats,
        mockIconConfigs,
      );

      expect(seatNumber).toBe(1);
    });

    it('should return same seat number for all grid squares in multi-grid seat', () => {
      const seats = [
        createSeat('table-round-4', createGridPosition(0, 0)), // 2x2 table
      ];
      const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

      // Test all 4 grid squares
      expect(SeatNumberingService.getSeatNumberAt(createGridPosition(0, 0), numberedSeats, mockIconConfigs)).toBe(1);
      expect(SeatNumberingService.getSeatNumberAt(createGridPosition(1, 0), numberedSeats, mockIconConfigs)).toBe(1);
      expect(SeatNumberingService.getSeatNumberAt(createGridPosition(0, 1), numberedSeats, mockIconConfigs)).toBe(1);
      expect(SeatNumberingService.getSeatNumberAt(createGridPosition(1, 1), numberedSeats, mockIconConfigs)).toBe(1);
    });

    it('should return undefined for unoccupied grid square', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
      ];
      const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

      const seatNumber = SeatNumberingService.getSeatNumberAt(
        createGridPosition(5, 5),
        numberedSeats,
        mockIconConfigs,
      );

      expect(seatNumber).toBeUndefined();
    });
  });

  describe('createPositionToNumberMap', () => {
    it('should create map with single seat', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
      ];
      const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

      const map = SeatNumberingService.createPositionToNumberMap(numberedSeats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1);
      expect(map.size).toBe(1);
    });

    it('should create map with multi-grid seat covering all squares', () => {
      const seats = [
        createSeat('table-round-4', createGridPosition(0, 0)),
      ];
      const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

      const map = SeatNumberingService.createPositionToNumberMap(numberedSeats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1);
      expect(map.get('1,0')).toBe(1);
      expect(map.get('0,1')).toBe(1);
      expect(map.get('1,1')).toBe(1);
      expect(map.size).toBe(4);
    });

    it('should create map with multiple seats', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('loveseat-2', createGridPosition(1, 0)),
      ];
      const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

      const map = SeatNumberingService.createPositionToNumberMap(numberedSeats, mockIconConfigs);

      expect(map.get('0,0')).toBe(1);
      expect(map.get('1,0')).toBe(2);
      expect(map.get('2,0')).toBe(2);
      expect(map.size).toBe(3); // 1 square + 2 squares
    });
  });

  describe('renumberSeat', () => {
    it('should renumber a specific seat in context of all seats', () => {
      const seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('chair-1', createGridPosition(1, 0)),
      ];

      const seatToUpdate = seats[0];
      const updated = SeatNumberingService.renumberSeat(seatToUpdate, seats);

      expect(updated.number).toBe(1);
    });

    it('should return the seat with new number when position changes', () => {
      let seats = [
        createSeat('chair-1', createGridPosition(0, 0)),
        createSeat('chair-1', createGridPosition(1, 0)),
      ];

      const seatToUpdate = { ...seats[0], position: createGridPosition(2, 0) };
      seats = [seatToUpdate, seats[1]];

      const updated = SeatNumberingService.renumberSeat(seatToUpdate, seats);

      expect(updated.number).toBe(2);
    });
  });
});
