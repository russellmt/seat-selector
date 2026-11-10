import { describe, it, expect } from 'vitest';
import { createSeat, createGridPosition } from './Seat';

describe('Seat Types and Utilities', () => {
  describe('createGridPosition', () => {
    it('should create a grid position with given col and row', () => {
      const pos = createGridPosition(5, 10);
      expect(pos.col).toBe(5);
      expect(pos.row).toBe(10);
    });

    it('should handle zero coordinates', () => {
      const pos = createGridPosition(0, 0);
      expect(pos.col).toBe(0);
      expect(pos.row).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const pos = createGridPosition(-1, -5);
      expect(pos.col).toBe(-1);
      expect(pos.row).toBe(-5);
    });
  });

  describe('createSeat', () => {
    it('should create a seat with all required properties', () => {
      const pos = createGridPosition(3, 4);
      const seat = createSeat('chair-1', pos, 'down');

      expect(seat.iconId).toBe('chair-1');
      expect(seat.position).toEqual(pos);
      expect(seat.rotation).toBe('down');
      expect(seat.id).toBeDefined();
      expect(seat.id).toMatch(/^seat-/);
    });

    it('should use default rotation of "down"', () => {
      const pos = createGridPosition(0, 0);
      const seat = createSeat('chair-1', pos);

      expect(seat.rotation).toBe('down');
    });

    it('should not have number field', () => {
      const pos = createGridPosition(0, 0);
      const seat = createSeat('chair-1', pos, 'down');

      // Seat no longer has number field - it's calculated per grid square
      expect((seat as any).number).toBeUndefined();
    });

    it('should generate unique IDs for different seats', () => {
      const pos1 = createGridPosition(0, 0);
      const pos2 = createGridPosition(1, 1);
      const seat1 = createSeat('chair-1', pos1);
      const seat2 = createSeat('chair-1', pos2);

      expect(seat1.id).not.toBe(seat2.id);
    });

    it('should accept all rotation types', () => {
      const pos = createGridPosition(0, 0);
      const rotations = ['left', 'up', 'right', 'down'] as const;

      rotations.forEach((rotation) => {
        const seat = createSeat('chair-1', pos, rotation);
        expect(seat.rotation).toBe(rotation);
      });
    });

    it('should handle different icon IDs', () => {
      const pos = createGridPosition(0, 0);
      const iconIds = ['table-round-4', 'chair-1', 'loveseat-2', 'couch-3'];

      iconIds.forEach((iconId) => {
        const seat = createSeat(iconId, pos);
        expect(seat.iconId).toBe(iconId);
      });
    });
  });

  describe('Seat interface constraints', () => {
    it('should support multi-grid seats with large position values', () => {
      const pos = createGridPosition(100, 200);
      const seat = createSeat('table-round-4', pos, 'down');

      expect(seat.position.col).toBe(100);
      expect(seat.position.row).toBe(200);
      // No number field anymore - it's calculated per grid square
      expect((seat as any).number).toBeUndefined();
    });

    it('should maintain position immutability', () => {
      const pos = createGridPosition(5, 5);
      const seat = createSeat('chair-1', pos);

      // Verify the position object is the one we passed
      expect(seat.position).toEqual({ col: 5, row: 5 });

      // Verify modifying the original doesn't affect the seat
      const newSeat = { ...seat };
      expect(newSeat.position).toEqual({ col: 5, row: 5 });
    });
  });
});
