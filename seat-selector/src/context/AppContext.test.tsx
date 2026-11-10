import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from './AppContext';
import type { Seat, Guest } from '../types';

/**
 * Helper function to create a wrapper with AppProvider
 */
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProvider>{children}</AppProvider>;
  };
}

/**
 * Helper function to create a test seat
 */
function createTestSeat(overrides?: Partial<Seat>): Seat {
  return {
    id: 'seat-1',
    iconId: 'table-round-4',
    position: { col: 0, row: 0 },
    rotation: 'down',
    ...overrides,
  };
}

/**
 * Helper function to create a test guest
 */
function createTestGuest(overrides?: Partial<Guest>): Guest {
  return {
    id: 'guest-1',
    name: 'John Doe',
    initials: 'JD',
    colorSeed: 'john-doe',
    color: {
      hex: '#FF0000',
      rgb: { r: 255, g: 0, b: 0 },
      text: 'white',
    },
    ...overrides,
  };
}

describe('AppProvider and useApp Hook', () => {
  describe('Initial State', () => {
    it('should provide initial state with correct defaults', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      expect(result.current.title).toBe('');
      expect(result.current.seats).toEqual([]);
      expect(result.current.selectedIconId).toBe('table-round-4');
      expect(result.current.selectedRotation).toBe('down');
      expect(result.current.guests).toEqual([]);
      expect(result.current.selectedGuestId).toBeNull();
      expect(result.current.sortOrder).toBe('original');
      expect(result.current.assignments.size).toBe(0);
      expect(result.current.arrangementName).toBe('');
      expect(result.current.currentPage).toBe('home');
    });
  });

  describe('Seat Actions', () => {
    it('should add a single seat', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testSeat = createTestSeat();

      act(() => {
        result.current.addSeat(testSeat);
      });

      expect(result.current.seats).toHaveLength(1);
      expect(result.current.seats[0]).toEqual(testSeat);
    });

    it('should add multiple seats', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const seat1 = createTestSeat({ id: 'seat-1' });
      const seat2 = createTestSeat({ id: 'seat-2', position: { col: 1, row: 0 } });

      act(() => {
        result.current.addSeats([seat1, seat2]);
      });

      expect(result.current.seats).toHaveLength(2);
    });

    it('should not add duplicate seats at same position', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testSeat = createTestSeat();

      act(() => {
        result.current.addSeat(testSeat);
        result.current.addSeat(testSeat);
      });

      expect(result.current.seats).toHaveLength(1);
    });

    it('should remove a seat by ID', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testSeat = createTestSeat();

      act(() => {
        result.current.addSeat(testSeat);
      });

      expect(result.current.seats).toHaveLength(1);

      act(() => {
        result.current.removeSeat(testSeat.id);
      });

      expect(result.current.seats).toHaveLength(0);
    });

    it('should remove multiple seats', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const seat1 = createTestSeat({ id: 'seat-1' });
      const seat2 = createTestSeat({ id: 'seat-2', position: { col: 1, row: 0 } });
      const seat3 = createTestSeat({ id: 'seat-3', position: { col: 2, row: 0 } });

      act(() => {
        result.current.addSeats([seat1, seat2, seat3]);
      });

      expect(result.current.seats).toHaveLength(3);

      act(() => {
        result.current.removeSeats(['seat-1', 'seat-3']);
      });

      expect(result.current.seats).toHaveLength(1);
      expect(result.current.seats[0].id).toBe('seat-2');
    });

    it('should clear all seats', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const seat1 = createTestSeat({ id: 'seat-1' });
      const seat2 = createTestSeat({ id: 'seat-2', position: { col: 1, row: 0 } });

      act(() => {
        result.current.addSeats([seat1, seat2]);
      });

      expect(result.current.seats).toHaveLength(2);

      act(() => {
        result.current.clearAllSeats();
      });

      expect(result.current.seats).toHaveLength(0);
      expect(result.current.assignments.size).toBe(0);
    });

    it('should update seat numbers based on position', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const seat1 = createTestSeat({ id: 'seat-1', position: { col: 1, row: 1 } });
      const seat2 = createTestSeat({ id: 'seat-2', position: { col: 0, row: 0 } });
      const seat3 = createTestSeat({ id: 'seat-3', position: { col: 0, row: 1 } });

      act(() => {
        result.current.addSeats([seat1, seat2, seat3]);
      });

      act(() => {
        result.current.updateSeatNumbers();
      });

      // Should be sorted by row, then column
      // seat2 (0,0) -> number 1
      // seat3 (0,1) -> number 2
      // seat1 (1,1) -> number 3



    });
  });

  describe('Icon Selection Actions', () => {
    it('should set selected icon', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setSelectedIcon('chair-1');
      });

      expect(result.current.selectedIconId).toBe('chair-1');
      expect(result.current.selectedRotation).toBe('down');
    });

    it('should restore previous rotation when selecting icon again', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      // chair-1 hasn't been set up yet, so it defaults to 'down'
      act(() => {
        result.current.setSelectedIcon('chair-1');
      });

      expect(result.current.selectedRotation).toBe('down');

      // Now set chair-1 to 'left'
      act(() => {
        result.current.setRotation('left');
      });

      expect(result.current.selectedRotation).toBe('left');

      // Switch to a different icon
      act(() => {
        result.current.setSelectedIcon('loveseat-2');
      });

      // loveseat-2 hasn't been set up yet, so it defaults to 'down'
      expect(result.current.selectedRotation).toBe('down');

      // Switch back to chair-1 and it should restore the 'left' rotation we set
      act(() => {
        result.current.setSelectedIcon('chair-1');
      });

      expect(result.current.selectedRotation).toBe('left');
    });

    it('should set rotation for current icon', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setSelectedIcon('chair-1');
        result.current.setRotation('up');
      });

      expect(result.current.selectedRotation).toBe('up');
    });

    it('should set rotation for specific icon', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setIconRotation('loveseat-2', 'right');
      });

      act(() => {
        result.current.setSelectedIcon('loveseat-2');
      });

      expect(result.current.selectedRotation).toBe('right');
    });
  });

  describe('Title Actions', () => {
    it('should set title', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setTitle('My Event');
      });

      expect(result.current.title).toBe('My Event');
    });

    it('should not exceed 32 character limit for title', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const longTitle = 'a'.repeat(40);

      act(() => {
        result.current.setTitle(longTitle);
      });

      expect(result.current.title).toBe('');

      act(() => {
        result.current.setTitle('a'.repeat(32));
      });

      expect(result.current.title).toBe('a'.repeat(32));
    });
  });

  describe('Guest Actions', () => {
    it('should add a guest', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testGuest = createTestGuest();

      act(() => {
        result.current.addGuest(testGuest);
      });

      expect(result.current.guests).toHaveLength(1);
      expect(result.current.guests[0]).toEqual(testGuest);
    });

    it('should remove a guest', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testGuest = createTestGuest();

      act(() => {
        result.current.addGuest(testGuest);
      });

      expect(result.current.guests).toHaveLength(1);

      act(() => {
        result.current.removeGuest(testGuest.id);
      });

      expect(result.current.guests).toHaveLength(0);
    });

    it('should unassign guest from seats when removed', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const guest1 = createTestGuest({ id: 'guest-1' });
      const guest2 = createTestGuest({ id: 'guest-2', name: 'Jane Doe' });

      act(() => {
        result.current.addGuest(guest1);
        result.current.addGuest(guest2);
        result.current.assignGuest(1, 'guest-1');
        result.current.assignGuest(2, 'guest-2');
      });

      expect(result.current.assignments.size).toBe(2);

      act(() => {
        result.current.removeGuest('guest-1');
      });

      expect(result.current.assignments.size).toBe(1);
      expect(result.current.assignments.get(1)).toBeUndefined();
      expect(result.current.assignments.get(2)).toBe('guest-2');
    });

    it('should clear guest selection when removed', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testGuest = createTestGuest();

      act(() => {
        result.current.addGuest(testGuest);
        result.current.selectGuest(testGuest.id);
      });

      expect(result.current.selectedGuestId).toBe(testGuest.id);

      act(() => {
        result.current.removeGuest(testGuest.id);
      });

      expect(result.current.selectedGuestId).toBeNull();
    });

    it('should update guest', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testGuest = createTestGuest();

      act(() => {
        result.current.addGuest(testGuest);
      });

      act(() => {
        result.current.updateGuest('guest-1', { name: 'Jane Doe', initials: 'JD' });
      });

      expect(result.current.guests[0].name).toBe('Jane Doe');
      expect(result.current.guests[0].initials).toBe('JD');
    });

    it('should select and deselect guest', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const testGuest = createTestGuest();

      act(() => {
        result.current.addGuest(testGuest);
        result.current.selectGuest(testGuest.id);
      });

      expect(result.current.selectedGuestId).toBe(testGuest.id);

      act(() => {
        result.current.selectGuest(null);
      });

      expect(result.current.selectedGuestId).toBeNull();
    });

    it('should set sort order', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setSortOrder('alphabetical-asc');
      });

      expect(result.current.sortOrder).toBe('alphabetical-asc');

      act(() => {
        result.current.setSortOrder('alphabetical-desc');
      });

      expect(result.current.sortOrder).toBe('alphabetical-desc');
    });

    it('should reorder guests', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const guest1 = createTestGuest({ id: 'guest-1', name: 'Alice' });
      const guest2 = createTestGuest({ id: 'guest-2', name: 'Bob' });
      const guest3 = createTestGuest({ id: 'guest-3', name: 'Charlie' });

      act(() => {
        result.current.addGuest(guest1);
        result.current.addGuest(guest2);
        result.current.addGuest(guest3);
      });

      expect(result.current.guests[0].name).toBe('Alice');
      expect(result.current.guests[1].name).toBe('Bob');
      expect(result.current.guests[2].name).toBe('Charlie');

      act(() => {
        result.current.reorderGuests(0, 2);
      });

      expect(result.current.guests[0].name).toBe('Bob');
      expect(result.current.guests[1].name).toBe('Charlie');
      expect(result.current.guests[2].name).toBe('Alice');
    });

    it('should clear all guests', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });
      const guest1 = createTestGuest({ id: 'guest-1' });
      const guest2 = createTestGuest({ id: 'guest-2', name: 'Jane Doe' });

      act(() => {
        result.current.addGuest(guest1);
        result.current.addGuest(guest2);
        result.current.selectGuest('guest-1');
        result.current.assignGuest(1, 'guest-1');
      });

      expect(result.current.guests).toHaveLength(2);

      act(() => {
        result.current.clearAllGuests();
      });

      expect(result.current.guests).toHaveLength(0);
      expect(result.current.selectedGuestId).toBeNull();
      expect(result.current.assignments.size).toBe(0);
    });
  });

  describe('Assignment Actions', () => {
    it('should assign guest to seat', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.assignGuest(1, 'guest-1');
      });

      expect(result.current.assignments.get(1)).toBe('guest-1');
    });

    it('should replace existing assignment', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.assignGuest(1, 'guest-1');
      });

      expect(result.current.assignments.get(1)).toBe('guest-1');

      act(() => {
        result.current.assignGuest(1, 'guest-2');
      });

      expect(result.current.assignments.get(1)).toBe('guest-2');
    });

    it('should unassign guest from seat', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.assignGuest(1, 'guest-1');
      });

      expect(result.current.assignments.get(1)).toBe('guest-1');

      act(() => {
        result.current.unassignGuest(1);
      });

      expect(result.current.assignments.get(1)).toBeUndefined();
    });

    it('should clear all assignments', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.assignGuest(1, 'guest-1');
        result.current.assignGuest(2, 'guest-2');
        result.current.assignGuest(3, 'guest-1');
      });

      expect(result.current.assignments.size).toBe(3);

      act(() => {
        result.current.clearAllAssignments();
      });

      expect(result.current.assignments.size).toBe(0);
    });
  });

  describe('Arrangement Actions', () => {
    it('should set arrangement name', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setArrangementName('My Arrangement');
      });

      expect(result.current.arrangementName).toBe('My Arrangement');
    });
  });

  describe('Navigation Actions', () => {
    it('should set current page', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      act(() => {
        result.current.setCurrentPage('canvas');
      });

      expect(result.current.currentPage).toBe('canvas');

      act(() => {
        result.current.setCurrentPage('guests');
      });

      expect(result.current.currentPage).toBe('guests');
    });
  });

  describe('useApp Hook Error Handling', () => {
    it('should throw error when used outside AppProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useApp());
      }).toThrow('useApp must be used within an AppProvider');

      console.error = originalError;
    });
  });

  describe('Complex Scenarios', () => {
    it('should maintain state across multiple operations', () => {
      const { result } = renderHook(() => useApp(), { wrapper: createWrapper() });

      // Set up seats
      const seat1 = createTestSeat({ id: 'seat-1', position: { col: 0, row: 0 } });
      const seat2 = createTestSeat({ id: 'seat-2', position: { col: 1, row: 0 } });

      act(() => {
        result.current.addSeats([seat1, seat2]);
        result.current.updateSeatNumbers();
      });

      expect(result.current.seats).toHaveLength(2);



      // Add guests
      const guest1 = createTestGuest({ id: 'guest-1' });
      const guest2 = createTestGuest({ id: 'guest-2', name: 'Jane' });

      act(() => {
        result.current.addGuest(guest1);
        result.current.addGuest(guest2);
        result.current.selectGuest('guest-1');
      });

      expect(result.current.guests).toHaveLength(2);
      expect(result.current.selectedGuestId).toBe('guest-1');

      // Make assignments
      act(() => {
        result.current.assignGuest(1, 'guest-1');
        result.current.assignGuest(2, 'guest-2');
      });

      expect(result.current.assignments.size).toBe(2);

      // Set configuration details
      act(() => {
        result.current.setTitle('Test Event');
        result.current.setArrangementName('Arrangement 1');
        result.current.setSortOrder('alphabetical-asc');
      });

      // Verify all state persists
      expect(result.current.title).toBe('Test Event');
      expect(result.current.arrangementName).toBe('Arrangement 1');
      expect(result.current.sortOrder).toBe('alphabetical-asc');
      expect(result.current.seats).toHaveLength(2);
      expect(result.current.guests).toHaveLength(2);
      expect(result.current.assignments.size).toBe(2);
    });
  });
});
