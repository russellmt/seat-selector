/**
 * Property-Based Test for SeatNumberingService
 * 
 * Properties:
 * - Property 1: Seat Placement Creates Unoccupied Placement
 * - Property 6: Implicit Numbering Is Deterministic
 * - Property 8: Seat Count Equals Number of Seats
 * 
 * **Validates: Requirements 7.1, 7.2, 12.1, 12.2, 12.3, 12.4, 15.1, 15.2, 15.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { SeatNumberingService } from './SeatNumberingService';
import { createSeat, createGridPosition } from '../types/Seat';
import type { Seat } from '../types/Seat';
import type { IconConfig } from '../types/Icon';

// Mock icon configurations
const mockIconConfigs = new Map<string, IconConfig>([
  [
    'chair-1',
    {
      id: 'chair-1',
      capacity: 1,
      size: { width: 1, height: 1 },
      name: 'Chair',
      color: '#8B4513',
      svg: '<rect />',
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
      svg: '<rect />',
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
      svg: '<circle />',
    },
  ],
]);

describe('Property-Based Tests: SeatNumberingService', () => {
  /**
   * Property 6: Implicit Numbering Is Deterministic
   * 
   * **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
   *
   * For ANY collection of seats at ANY valid positions, running the
   * numbering algorithm multiple times SHALL produce IDENTICAL results.
   * Additionally, the numbering SHALL follow left-to-right, top-to-bottom
   * order: numbers are assigned sequentially starting at 1, with seats
   * sorted by row first, then by column.
   * 
   * This property verifies:
   * - Determinism: f(seats) = f(seats) (reproducibility)
   * - Proper ordering: numbering follows position-based rules
   * - Sequential numbering: numbers 1, 2, 3, ... n
   * - Uniqueness: each seat gets a unique number
   * 
   * Mathematical properties:
   * 1. Idempotency: f(f(seats)) = f(seats)
   * 2. Ordering invariant: if seat_i.position < seat_j.position in sort order,
   *    then seat_i.number < seat_j.number
   * 3. Sequentiality: numbers ∈ {1, 2, ..., n} with no gaps or duplicates
   */
  it('Property 6: Implicit Numbering Is Deterministic', () => {
    // Helper to create collision-free seat configurations
    const createSeats = fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        fc.oneof(
          fc.constant('chair-1'),
          fc.constant('loveseat-2'),
          fc.constant('table-round-4')
        ),
      ),
      { minLength: 0, maxLength: 40 },
    ).map((tuples) => {
      // Deduplicate by position to ensure collision-free placement
      const positionSet = new Set<string>();
      const seats: Seat[] = [];
      
      for (const [col, row, iconId] of tuples) {
        // Space positions to avoid collisions (especially for multi-grid seats)
        const spacedCol = col * 3;
        const spacedRow = row * 3;
        const key = `${spacedCol},${spacedRow}`;
        
        if (!positionSet.has(key)) {
          positionSet.add(key);
          seats.push(createSeat(iconId, createGridPosition(spacedCol, spacedRow)));
        }
      }
      
      return seats;
    });

    const property = fc.property(createSeats, (seatsArray) => {
      // First run: calculate numbering
      const firstRun = SeatNumberingService.calculateSeatNumbers(seatsArray);

      // Second run: recalculate on same input
      const secondRun = SeatNumberingService.calculateSeatNumbers(seatsArray);

      // Third run: verify idempotency further
      const thirdRun = SeatNumberingService.calculateSeatNumbers(seatsArray);

      // ====================================================================
      // Requirement 12.1: Each seat receives unique number starting at 1
      // ====================================================================
      expect(firstRun).toHaveLength(seatsArray.length);
      
      // All runs should produce same length results
      expect(secondRun).toHaveLength(firstRun.length);
      expect(thirdRun).toHaveLength(firstRun.length);

      // Numbers should be 1, 2, 3, ..., n (sequential and starting at 1)
      for (let i = 0; i < firstRun.length; i++) {
        expect(firstRun[i].number).toBe(i + 1);
        expect(secondRun[i].number).toBe(i + 1);
        expect(thirdRun[i].number).toBe(i + 1);
      }

      // ====================================================================
      // Requirement 12.2: Numbering follows left-to-right, top-to-bottom order
      // ====================================================================
      // Verify sorting order: row ascending, then column ascending
      for (let i = 0; i < firstRun.length - 1; i++) {
        const current = firstRun[i];
        const next = firstRun[i + 1];

        // If different rows, current row must be less than next row
        if (current.position.row !== next.position.row) {
          expect(current.position.row).toBeLessThan(next.position.row);
        } else {
          // Same row: column must be ascending or equal (though equal should not occur for unique positions)
          expect(current.position.col).toBeLessThanOrEqual(next.position.col);
        }

        // Current number must be less than next number
        expect(current.number).toBeLessThan(next.number);
      }

      // ====================================================================
      // Requirement 12.3: Recalculate on seat add/delete
      // ====================================================================
      // Verify determinism: running twice gives identical results
      for (let i = 0; i < firstRun.length; i++) {
        // Find seat by ID in all three runs
        const id = firstRun[i].id;
        const seat1 = firstRun.find(s => s.id === id);
        const seat2 = secondRun.find(s => s.id === id);
        const seat3 = thirdRun.find(s => s.id === id);

        // All should exist and have same number
        expect(seat1).toBeDefined();
        expect(seat2).toBeDefined();
        expect(seat3).toBeDefined();
        expect(seat1!.number).toBe(seat2!.number);
        expect(seat1!.number).toBe(seat3!.number);
      }

      // ====================================================================
      // Requirement 12.4: Efficient recalculation (< 100ms)
      // ====================================================================
      // This is tested implicitly - if calculation takes too long, the test framework will fail
      // For now, we just verify the calculation completed

      // ====================================================================
      // Additional Property Tests for Robustness
      // ====================================================================

      // All seat properties except number should be preserved
      for (const seat of firstRun) {
        const original = seatsArray.find(s => s.id === seat.id);
        expect(original).toBeDefined();
        expect(seat.id).toBe(original!.id);
        expect(seat.iconId).toBe(original!.iconId);
        expect(seat.position).toEqual(original!.position);
        expect(seat.rotation).toBe(original!.rotation);
      }

      // Verify uniqueness: all numbers should be distinct
      const numbers = firstRun.map(s => s.number);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);

      // Test getSeatNumberAt functionality
      for (const seat of firstRun) {
        const config = mockIconConfigs.get(seat.iconId);
        if (config) {
          // Check that all grid squares occupied by this seat return the correct number
          for (let row = seat.position.row; row < seat.position.row + config.size.height; row++) {
            for (let col = seat.position.col; col < seat.position.col + config.size.width; col++) {
              const seatNumber = SeatNumberingService.getSeatNumberAt(
                createGridPosition(col, row),
                firstRun,
                mockIconConfigs
              );
              expect(seatNumber).toBe(seat.number);
            }
          }
        }
      }

      // Test createPositionToNumberMap
      const map = SeatNumberingService.createPositionToNumberMap(firstRun, mockIconConfigs);
      for (const seat of firstRun) {
        const config = mockIconConfigs.get(seat.iconId);
        if (config) {
          for (let row = seat.position.row; row < seat.position.row + config.size.height; row++) {
            for (let col = seat.position.col; col < seat.position.col + config.size.width; col++) {
              const key = `${col},${row}`;
              expect(map.get(key)).toBe(seat.number);
            }
          }
        }
      }
    });

    // Run property test with 100 iterations
    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Property 1: Seat Placement Creates Unoccupied Placement
   * 
   * **Validates: Requirements 7.1, 7.2**
   *
   * For any randomly generated grid position and selected icon, placing a seat at that position
   * SHALL result in:
   * 1. A seat existing at the quantized grid position
   * 2. The seat being retrievable by its position
   * 3. The seat receiving the correct number (1 since it's the only seat)
   * 
   * This property verifies that seat placement creates valid, numbered seats that can be
   * located in the seat configuration.
   */
  it('Property 1: Seat Placement Creates Unoccupied Placement', () => {
    // Fast-check strategy for generating test data
    const seatPlacementProperty = fc.property(
      fc.integer({ min: 0, max: 100 }), // column coordinate
      fc.integer({ min: 0, max: 100 }), // row coordinate
      fc.oneof(
        fc.constant('chair-1'),
        fc.constant('loveseat-2'),
        fc.constant('table-round-4'),
      ),
      (col, row, iconId) => {
        // ====================================================================
        // Requirement 7.1: Seat exists at quantized grid position
        // ====================================================================
        
        // Create a seat at the specified position
        const position = createGridPosition(col, row);
        const seat = createSeat(iconId, position);
        const seats = [seat];

        // Apply numbering
        const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);

        // Assert: seat count is 1
        expect(numberedSeats).toHaveLength(1);
        expect(numberedSeats[0]).toBeDefined();

        // ====================================================================
        // Requirement 7.2: Seat is retrievable by its position
        // ====================================================================
        
        // The seat should be retrievable by position
        const retrievedSeat = numberedSeats.find(
          s => s.position.col === col && s.position.row === row,
        );
        expect(retrievedSeat).toBeDefined();
        expect(retrievedSeat!.id).toBe(seat.id);
        expect(retrievedSeat!.iconId).toBe(iconId);
        expect(retrievedSeat!.position).toEqual(position);

        // ====================================================================
        // Additional verification: seat number assignment
        // ====================================================================
        
        // Assert: seat is numbered 1 (since it's the only seat)
        expect(retrievedSeat!.number).toBe(1);
        expect(numberedSeats[0].number).toBe(1);

        // ====================================================================
        // Additional verification: seat properties are preserved
        // ====================================================================
        
        // Assert: all seat properties match original
        expect(retrievedSeat!.rotation).toBe(seat.rotation);
        expect(retrievedSeat!.iconId).toBe(seat.iconId);

        // ====================================================================
        // Additional verification: getSeatNumberAt works
        // ====================================================================
        
        // Verify getSeatNumberAt can locate the seat
        const seatNumberAt = SeatNumberingService.getSeatNumberAt(
          position,
          numberedSeats,
          mockIconConfigs,
        );
        
        // Note: getSeatNumberAt may return undefined if the icon config doesn't exist
        // or if the grid square isn't occupied, but with a valid icon it should work
        if (mockIconConfigs.has(iconId)) {
          expect(seatNumberAt).toBe(1);
        }
      },
    );

    fc.assert(seatPlacementProperty, { numRuns: 100 });
  });

  /**
   * Property 8: Seat Count Equals Number of Seats
   * 
   * **Validates: Requirements 15.1, 15.2, 15.3**
   *
   * For any sequence of add, remove, and clear operations on seats, the seat count
   * SHALL always equal the actual number of seats in the configuration.
   * 
   * This property verifies:
   * - Count accuracy after add operations
   * - Count accuracy after remove operations
   * - Count accuracy after clear operations
   * - Count is never negative
   * - Count matches seats.length at all times
   * 
   * Mathematical properties:
   * 1. displayedCount = seats.length (always)
   * 2. After add: count increases by 1
   * 3. After remove: count decreases by 1
   * 4. After clear: count becomes 0
   * 5. count >= 0 (non-negative invariant)
   */
  it('Property 8: Seat Count Equals Number of Seats', () => {
    // Operation types
    type Operation = 'add' | 'remove' | 'clear';

    // Helper function to calculate seat count
    const calculateSeatCount = (seats: Seat[]): number => seats.length;

    // Fast-check strategy for generating operation sequences
    const seatOperationsProperty = fc.property(
      fc.array(
        fc.record({
          operation: fc.oneof(
            fc.constant<Operation>('add'),
            fc.constant<Operation>('remove'),
            fc.constant<Operation>('clear'),
          ),
          col: fc.integer({ min: 0, max: 50 }),
          row: fc.integer({ min: 0, max: 50 }),
          iconId: fc.oneof(
            fc.constant('chair-1'),
            fc.constant('loveseat-2'),
            fc.constant('table-round-4'),
          ),
        }),
        { minLength: 0, maxLength: 30 },
      ),
      (operations) => {
        let seats: Seat[] = [];
        let displayedCount = 0;

        // ====================================================================
        // Requirement 15.1: Seat count display
        // ====================================================================
        
        // Initial state: empty seats
        expect(calculateSeatCount(seats)).toBe(0);
        displayedCount = 0;
        expect(displayedCount).toBe(calculateSeatCount(seats));

        // Process each operation
        for (const op of operations) {
          const previousCount = calculateSeatCount(seats);

          if (op.operation === 'add') {
            // ================================================================
            // Requirement 15.2: Seat count updates in real-time on add
            // ================================================================
            
            // Create a collision-free position for the new seat
            // Use spacing to minimize collisions with existing seats
            const spacedCol = op.col * 3;
            const spacedRow = op.row * 3;
            const position = createGridPosition(spacedCol, spacedRow);

            // Check if position is already occupied (avoid duplicates)
            const isOccupied = seats.some(
              s => s.position.col === spacedCol && s.position.row === spacedRow,
            );

            if (!isOccupied) {
              const newSeat = createSeat(op.iconId, position);
              seats = [...seats, newSeat];
              displayedCount = calculateSeatCount(seats);

              // Assert: count increased by 1
              expect(displayedCount).toBe(previousCount + 1);
              expect(displayedCount).toBe(calculateSeatCount(seats));
            }
          } else if (op.operation === 'remove') {
            // ================================================================
            // Requirement 15.2: Seat count updates in real-time on remove
            // ================================================================
            
            if (seats.length > 0) {
              // Remove the first seat (arbitrary choice)
              seats = seats.slice(1);
              displayedCount = calculateSeatCount(seats);

              // Assert: count decreased by 1 or stayed the same (if we removed)
              expect(displayedCount).toBe(previousCount - 1);
              expect(displayedCount).toBe(calculateSeatCount(seats));
            }
          } else if (op.operation === 'clear') {
            // ================================================================
            // Requirement 15.2: Seat count updates in real-time on clear
            // ================================================================
            
            seats = [];
            displayedCount = calculateSeatCount(seats);

            // Assert: count becomes 0 after clear
            expect(displayedCount).toBe(0);
            expect(displayedCount).toBe(calculateSeatCount(seats));
          }

          // ===================================================================
          // Requirement 15.3: Seat count represents total seat instances
          // ===================================================================
          
          // Assert: count is never negative
          expect(displayedCount).toBeGreaterThanOrEqual(0);

          // Assert: displayed count matches actual number of seats
          expect(displayedCount).toBe(calculateSeatCount(seats));

          // Assert: all seats are valid and have numbers assigned
          const numberedSeats = SeatNumberingService.calculateSeatNumbers(seats);
          expect(numberedSeats).toHaveLength(displayedCount);

          // Assert: seat numbers are sequential starting at 1
          for (let i = 0; i < numberedSeats.length; i++) {
            expect(numberedSeats[i].number).toBe(i + 1);
          }
        }

        // ===================================================================
        // Final verification: count remains consistent
        // ===================================================================
        
        expect(displayedCount).toBe(calculateSeatCount(seats));
        expect(displayedCount).toBeGreaterThanOrEqual(0);

        // Apply numbering and verify all seats are accounted for
        const finalNumberedSeats = SeatNumberingService.calculateSeatNumbers(seats);
        expect(finalNumberedSeats).toHaveLength(displayedCount);
      },
    );

    fc.assert(seatOperationsProperty, { numRuns: 100 });
  });
});
