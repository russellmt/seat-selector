import { describe, it, expect } from 'vitest';
import {
  createGuest,
  extractInitials,
  createGuestAssignmentMap,
  isAssigned,
  getAssignedGuest,
  assignGuestToSeat,
  unassignGuestFromSeat,
  clearAllAssignments,
  getSeatsForGuest,
  unassignGuestFromAllSeats,
  countAssignments,
} from './Guest';
import { createColor } from './Color';

describe('Guest Types and Utilities', () => {
  describe('extractInitials', () => {
    it('should extract initials from a two-word name', () => {
      const initials = extractInitials('John Smith');
      expect(initials).toBe('JS');
    });

    it('should extract initials from a single word', () => {
      const initials = extractInitials('Madonna');
      expect(initials).toBe('M');
    });

    it('should extract initials from a three-word name', () => {
      const initials = extractInitials('Mary Jane Watson');
      expect(initials).toBe('MJ'); // Only first two words
    });

    it('should handle names with extra spaces', () => {
      const initials = extractInitials('  John   Smith  ');
      expect(initials).toBe('JS');
    });

    it('should handle single character names', () => {
      const initials = extractInitials('A B C');
      expect(initials).toBe('AB');
    });

    it('should uppercase initials', () => {
      const initials = extractInitials('john smith');
      expect(initials).toBe('JS');
    });

    it('should handle empty string', () => {
      const initials = extractInitials('');
      expect(initials).toBe('');
    });
  });

  describe('createGuest', () => {
    it('should create a guest with all properties', () => {
      const color = createColor('#FF0000', 255, 0, 0, 'white');
      const guest = createGuest('John Smith', color);

      expect(guest.name).toBe('John Smith');
      expect(guest.initials).toBe('JS');
      expect(guest.colorSeed).toBe('John Smith');
      expect(guest.color).toEqual(color);
      expect(guest.id).toBeDefined();
      expect(guest.id).toMatch(/^guest-/);
    });

    it('should generate unique IDs for different guests', () => {
      const color = createColor('#FF0000', 255, 0, 0);
      const guest1 = createGuest('John Smith', color);
      const guest2 = createGuest('Jane Doe', color);

      expect(guest1.id).not.toBe(guest2.id);
    });

    it('should handle different color objects', () => {
      const colorRed = createColor('#FF0000', 255, 0, 0);
      const colorBlue = createColor('#0000FF', 0, 0, 255);

      const guest1 = createGuest('John', colorRed);
      const guest2 = createGuest('Jane', colorBlue);

      expect(guest1.color.hex).toBe('#FF0000');
      expect(guest2.color.hex).toBe('#0000FF');
    });
  });

  describe('GuestAssignmentMap utilities', () => {
    describe('createGuestAssignmentMap', () => {
      it('should create an empty assignment map', () => {
        const map = createGuestAssignmentMap();
        expect(map.size).toBe(0);
      });
    });

    describe('isAssigned', () => {
      it('should return false for unassigned seat', () => {
        const map = createGuestAssignmentMap();
        expect(isAssigned(map, 1)).toBe(false);
      });

      it('should return true for assigned seat', () => {
        const map = createGuestAssignmentMap();
        const newMap = assignGuestToSeat(map, 1, 'guest-123');
        expect(isAssigned(newMap, 1)).toBe(true);
      });
    });

    describe('getAssignedGuest', () => {
      it('should return undefined for unassigned seat', () => {
        const map = createGuestAssignmentMap();
        expect(getAssignedGuest(map, 1)).toBeUndefined();
      });

      it('should return guest ID for assigned seat', () => {
        const map = createGuestAssignmentMap();
        const newMap = assignGuestToSeat(map, 1, 'guest-123');
        expect(getAssignedGuest(newMap, 1)).toBe('guest-123');
      });
    });

    describe('assignGuestToSeat', () => {
      it('should create new map with assignment', () => {
        const map = createGuestAssignmentMap();
        const newMap = assignGuestToSeat(map, 1, 'guest-123');

        expect(map.size).toBe(0); // original unchanged
        expect(newMap.size).toBe(1);
        expect(newMap.get(1)).toBe('guest-123');
      });

      it('should replace existing assignment', () => {
        const map = createGuestAssignmentMap();
        const map1 = assignGuestToSeat(map, 1, 'guest-123');
        const map2 = assignGuestToSeat(map1, 1, 'guest-456');

        expect(map2.get(1)).toBe('guest-456');
        expect(map2.size).toBe(1);
      });

      it('should handle multiple assignments', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 2, 'guest-456');
        map = assignGuestToSeat(map, 3, 'guest-789');

        expect(map.size).toBe(3);
        expect(map.get(1)).toBe('guest-123');
        expect(map.get(2)).toBe('guest-456');
        expect(map.get(3)).toBe('guest-789');
      });
    });

    describe('unassignGuestFromSeat', () => {
      it('should remove assignment from seat', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = unassignGuestFromSeat(map, 1);

        expect(isAssigned(map, 1)).toBe(false);
        expect(map.size).toBe(0);
      });

      it('should not affect other assignments', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 2, 'guest-456');
        map = unassignGuestFromSeat(map, 1);

        expect(isAssigned(map, 1)).toBe(false);
        expect(isAssigned(map, 2)).toBe(true);
        expect(map.size).toBe(1);
      });
    });

    describe('clearAllAssignments', () => {
      it('should return empty map', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 2, 'guest-456');

        const cleared = clearAllAssignments();
        expect(cleared.size).toBe(0);
      });
    });

    describe('getSeatsForGuest', () => {
      it('should return empty array for unassigned guest', () => {
        const map = createGuestAssignmentMap();
        const seats = getSeatsForGuest(map, 'guest-123');
        expect(seats).toEqual([]);
      });

      it('should return seat number for assigned guest', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 5, 'guest-123');
        const seats = getSeatsForGuest(map, 'guest-123');
        expect(seats).toEqual([5]);
      });

      it('should return multiple seat numbers in sorted order', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 3, 'guest-123');
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 5, 'guest-123');
        const seats = getSeatsForGuest(map, 'guest-123');
        expect(seats).toEqual([1, 3, 5]);
      });

      it('should not return seats assigned to other guests', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 2, 'guest-456');
        const seats = getSeatsForGuest(map, 'guest-123');
        expect(seats).toEqual([1]);
      });
    });

    describe('unassignGuestFromAllSeats', () => {
      it('should remove guest from all seats', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 2, 'guest-123');
        map = assignGuestToSeat(map, 3, 'guest-456');

        map = unassignGuestFromAllSeats(map, 'guest-123');
        expect(isAssigned(map, 1)).toBe(false);
        expect(isAssigned(map, 2)).toBe(false);
        expect(isAssigned(map, 3)).toBe(true);
        expect(map.size).toBe(1);
      });

      it('should handle non-existent guest', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        const newMap = unassignGuestFromAllSeats(map, 'guest-999');
        expect(newMap.size).toBe(1); // unchanged
      });
    });

    describe('countAssignments', () => {
      it('should return 0 for empty map', () => {
        const map = createGuestAssignmentMap();
        expect(countAssignments(map)).toBe(0);
      });

      it('should count assigned seats', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        expect(countAssignments(map)).toBe(1);

        map = assignGuestToSeat(map, 2, 'guest-456');
        expect(countAssignments(map)).toBe(2);

        map = assignGuestToSeat(map, 3, 'guest-789');
        expect(countAssignments(map)).toBe(3);
      });

      it('should update count after removal', () => {
        let map = createGuestAssignmentMap();
        map = assignGuestToSeat(map, 1, 'guest-123');
        map = assignGuestToSeat(map, 2, 'guest-456');
        expect(countAssignments(map)).toBe(2);

        map = unassignGuestFromSeat(map, 1);
        expect(countAssignments(map)).toBe(1);
      });
    });
  });
});
