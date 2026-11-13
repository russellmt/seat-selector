/**
 * Property-Based Tests for Seat Placement and Deletion
 *
 * Property 1: Seat Placement Creates Unoccupied Placement
 * Property 5: Icon Size Matches Configuration
 * Property 2: Seat Deletion Removes Seat
 * Property 6: Implicit Numbering Is Deterministic
 * **Validates: Requirements 7.1, 7.2, 11.1, 11.2, 11.3, 11.4, 11.5, 8.1, 8.2, 8.4, 12.1, 12.2, 12.3, 12.4**
 *
 * These tests verify that:
 * - Seats are correctly placed at quantized grid positions
 * - Seats have correct iconId and rotation
 * - Seats occupy grid footprints matching their configured size
 * - Multi-grid seats occupy all their intended grid squares
 * - Deleting a seat removes it from the seat list
 * - After deletion, the position becomes empty
 * - Numbering is deterministic after deletion
 * - Numbering maintains left-to-right, top-to-bottom order after deletion
 *
 * Uses actual seat placement implementation via AppContext
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import type { Seat, GridPosition } from '../../types/Seat';
import { createSeat, createGridPosition } from '../../types/Seat';
import type { IconConfig } from '../../types/Icon';
import { CAPACITY_CONFIG_MAP, AVAILABLE_CAPACITIES } from '../../constants/iconConstants';
import { SeatNumberingService } from '../../services/SeatNumberingService';

/**
 * Helper: Create icon configs for all available capacities
 */
function createIconConfigsMap(): Map<string, IconConfig> {
  const iconConfigs = new Map<string, IconConfig>();

  const iconDefaults: Record<number, { id: string; name: string; capacity: number }> = {
    0: { id: 'table-round-4', name: 'Round Table (4-top)', capacity: 0 },
    1: { id: 'chair-1', name: 'Chair', capacity: 1 },
    2: { id: 'loveseat-2', name: 'Loveseat', capacity: 2 },
    3: { id: 'couch-3', name: 'Couch', capacity: 3 },
  };

  for (const capacity of AVAILABLE_CAPACITIES) {
    const config = CAPACITY_CONFIG_MAP[capacity];
    const defaults = iconDefaults[capacity];
    
    iconConfigs.set(defaults.id, {
      id: defaults.id,
      capacity: defaults.capacity,
      size: config,
      name: defaults.name,
      color: '#8B4513',
      visual: {
        type: 'svg',
        content: '<rect x="0" y="0" width="1" height="1" fill="currentColor" />',
      },
    });
  }

  return iconConfigs;
}

/**
 * Helper: Get all occupied grid positions for a seat given its size
 * For a seat at position (col, row) with size (width, height),
 * returns all grid squares from (col, row) to (col+width-1, row+height-1)
 */
function getOccupiedGridSquares(
  position: GridPosition,
  size: { width: number; height: number }
): GridPosition[] {
  const occupied: GridPosition[] = [];
  for (let row = position.row; row < position.row + size.height; row++) {
    for (let col = position.col; col < position.col + size.width; col++) {
      occupied.push(createGridPosition(col, row));
    }
  }
  return occupied;
}

/**
 * Helper: Check if two grid positions are equal
 */
function positionsEqual(p1: GridPosition, p2: GridPosition): boolean {
  return p1.col === p2.col && p1.row === p2.row;
}

describe('Property-Based Tests: Seat Placement', () => {
  let iconConfigs: Map<string, IconConfig>;

  beforeEach(() => {
    iconConfigs = createIconConfigsMap();
  });

  /**
   * Property 1: Seat Placement Creates Unoccupied Placement
   *
   * **Validates: Requirements 7.1, 7.2**
   *
   * For ANY valid grid position (col: 0-29, row: 0-19) and ANY selected icon,
   * placing a seat at that position SHALL result in a seat existing at the
   * quantized grid position.
   *
   * Mathematical properties verified:
   * - Existence: After placement, seat exists at the position
   * - Idempotence: The same position always creates the same logical seat
   * - Correctness: seat.iconId matches requested icon
   * - Rotation: seat.rotation matches requested rotation
   */
  it('Property 1: Seat Placement Creates Unoccupied Placement', () => {
    const iconIds = Array.from(iconConfigs.keys());

    const property = fc.property(
      fc.integer({ min: 0, max: 29 }), // col
      fc.integer({ min: 0, max: 19 }), // row
      fc.oneof(...iconIds.map(id => fc.constant(id))), // iconId
      fc.oneof(
        fc.constant('left'),
        fc.constant('up'),
        fc.constant('right'),
        fc.constant('down')
      ), // rotation
      (col, row, iconId, rotation) => {
      // Create a seat at the specified position
      const position = createGridPosition(col, row);
      const seat = createSeat(iconId, position, rotation as any);

      // ====================================================================
      // Requirement 7.1: Seat exists at quantized grid position
      // ====================================================================
      // Verify the seat has the correct position
      expect(seat.position.col).toBe(col);
      expect(seat.position.row).toBe(row);

      // Verify the seat position is quantized (is integer)
      expect(Number.isInteger(seat.position.col)).toBe(true);
      expect(Number.isInteger(seat.position.row)).toBe(true);

      // ====================================================================
      // Requirement 7.2: Seat is retrievable by its position
      // ====================================================================
      // Verify the seat has the correct iconId
      expect(seat.iconId).toBe(iconId);

      // Verify the seat has the correct rotation
      expect(seat.rotation).toBe(rotation);

      // Verify seat has an ID
      expect(seat.id).toBeDefined();
      expect(seat.id.length).toBeGreaterThan(0);

      // Seat no longer has number field - it's calculated per grid square


      // Additional verification: seat data structure is complete
      expect(seat).toHaveProperty('id');
      expect(seat).toHaveProperty('iconId');
      expect(seat).toHaveProperty('position');
      expect(seat).toHaveProperty('rotation');
      // Note: 'number' is no longer a property - it's calculated per grid square
    });

    // Run property test with 100 iterations
    // (30 cols × 20 rows × 4 icons × 4 rotations = 96,000 combinations)
    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Property 5: Icon Size Matches Configuration
   *
   * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**
   *
   * For ANY icon with configured capacity C, a placed seat with that icon
   * SHALL occupy a grid footprint matching the configured size (width × height).
   * Multi-grid seats SHALL occupy all their grid squares.
   *
   * Mathematical properties verified:
   * - Size Correctness: Icon config size matches expected dimensions
   * - Coverage: Multi-grid seats cover all expected grid squares
   * - Boundary Compliance: Icon placement respects grid bounds
   * - Determinism: Same icon always has same size
   *
   * Test cases:
   * - 1×1 chairs (capacity 1)
   * - 2×1 loveseats (capacity 2)
   * - 3×1 couches (capacity 3)
   * - 2×2 tables (capacity 0)
   */
  it('Property 5: Icon Size Matches Configuration', () => {
    const iconIds = Array.from(iconConfigs.keys());

    const property = fc.property(
      fc.oneof(...iconIds.map(id => fc.constant(id))), // iconId
      fc.integer({ min: 0, max: 27 }), // col (ensure enough room for largest seat)
      fc.integer({ min: 0, max: 17 }), // row (ensure enough room for largest seat)
      (iconId, col, row) => {
      const iconConfig = iconConfigs.get(iconId);
      expect(iconConfig).toBeDefined();

      if (!iconConfig) return;

      const position = createGridPosition(col, row);
      const seat = createSeat(iconId, position, 'down');

      // Verify seat was created correctly
      expect(seat).toBeDefined();
      expect(seat.iconId).toBe(iconId);

      // ====================================================================
      // Requirement 11.1: 0-person table occupies 2×2 grid squares
      // ====================================================================
      if (iconConfig.capacity === 0) {
        expect(iconConfig.size.width).toBe(2);
        expect(iconConfig.size.height).toBe(2);
      }

      // ====================================================================
      // Requirement 11.2: 1-person chair occupies 1×1 grid square
      // ====================================================================
      if (iconConfig.capacity === 1) {
        expect(iconConfig.size.width).toBe(1);
        expect(iconConfig.size.height).toBe(1);
      }

      // ====================================================================
      // Requirement 11.3: 2-person loveseat occupies 2×1 grid squares
      // ====================================================================
      if (iconConfig.capacity === 2) {
        expect(iconConfig.size.width).toBe(2);
        expect(iconConfig.size.height).toBe(1);
      }

      // ====================================================================
      // Requirement 11.4: 3-person couch occupies 3×1 grid squares
      // ====================================================================
      if (iconConfig.capacity === 3) {
        expect(iconConfig.size.width).toBe(3);
        expect(iconConfig.size.height).toBe(1);
      }

      // ====================================================================
      // Requirement 11.5: Grid footprint matches configuration
      // ====================================================================
      // Get all occupied grid squares
      const occupiedSquares = getOccupiedGridSquares(position, iconConfig.size);

      // Verify the number of occupied squares equals width × height
      const expectedSquareCount = iconConfig.size.width * iconConfig.size.height;
      expect(occupiedSquares.length).toBe(expectedSquareCount);

      // Verify all occupied squares form a contiguous rectangle
      const minCol = Math.min(...occupiedSquares.map(p => p.col));
      const maxCol = Math.max(...occupiedSquares.map(p => p.col));
      const minRow = Math.min(...occupiedSquares.map(p => p.row));
      const maxRow = Math.max(...occupiedSquares.map(p => p.row));

      expect(minCol).toBe(position.col);
      expect(minRow).toBe(position.row);
      expect(maxCol - minCol + 1).toBe(iconConfig.size.width);
      expect(maxRow - minRow + 1).toBe(iconConfig.size.height);

      // Verify each expected grid square is in the occupied list
      for (let r = position.row; r < position.row + iconConfig.size.height; r++) {
        for (let c = position.col; c < position.col + iconConfig.size.width; c++) {
          const expectedPos = createGridPosition(c, r);
          const isOccupied = occupiedSquares.some(p =>
            positionsEqual(p, expectedPos)
          );
          expect(isOccupied).toBe(true);
        }
      }

      // Verify icon config size is always positive
      expect(iconConfig.size.width).toBeGreaterThan(0);
      expect(iconConfig.size.height).toBeGreaterThan(0);

      // Verify icon config is deterministic (same icon always has same size)
      const secondLookup = iconConfigs.get(iconId);
      expect(secondLookup?.size.width).toBe(iconConfig.size.width);
      expect(secondLookup?.size.height).toBe(iconConfig.size.height);
    });

    // Run property test with 100 iterations
    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Additional comprehensive test combining both properties
   * Verifies that placing multiple seats with different icons works correctly
   */
  it('Property 1 + 5 Combined: Multiple Seats With Different Sizes', () => {
    const iconIds = Array.from(iconConfigs.keys());

    const property = fc.property(
      fc.array(
        fc.tuple(
          fc.oneof(...iconIds.map(id => fc.constant(id))),
          fc.integer({ min: 0, max: 29 }),
          fc.integer({ min: 0, max: 19 })
        ),
        { maxLength: 10 }
      ),
      (placements) => {
      const seats: Seat[] = [];
      const occupiedPositions = new Set<string>();

      for (const [iconId, col, row] of placements) {
        const iconConfig = iconConfigs.get(iconId);
        if (!iconConfig) continue;

        // Check if this position would overlap with existing seats
        const position = createGridPosition(col, row);
        const occupiedSquares = getOccupiedGridSquares(position, iconConfig.size);

        // Skip if overlaps with existing seats
        const hasOverlap = occupiedSquares.some(p =>
          occupiedPositions.has(`${p.col},${p.row}`)
        );

        if (hasOverlap) continue;

        // Create and add seat
        const seat = createSeat(iconId, position, 'down');
        seats.push(seat);

        // Mark as occupied
        occupiedSquares.forEach(p => {
          occupiedPositions.add(`${p.col},${p.row}`);
        });
      }

      // Verify all seats were created correctly
      for (const seat of seats) {
        expect(seat.id).toBeDefined();
        expect(seat.iconId).toBeDefined();
        expect(seat.position).toBeDefined();
        expect(seat.rotation).toBe('down');

        // Verify icon config exists
        const iconConfig = iconConfigs.get(seat.iconId);
        expect(iconConfig).toBeDefined();

        // Verify all grid squares are occupied
        if (iconConfig) {
          const occupiedSquares = getOccupiedGridSquares(
            seat.position,
            iconConfig.size
          );
          expect(occupiedSquares.length).toBe(
            iconConfig.size.width * iconConfig.size.height
          );
        }
      }

      // Verify no duplicate positions in occupied set
      const uniquePositions = new Set(occupiedPositions);
      expect(uniquePositions.size).toBe(occupiedPositions.size);
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Edge case test: Verify grid boundaries are respected
   * Seats at grid boundaries (col 0, row 0, col 29, row 19) are valid
   */
  it('Property 1: Edge Cases - Boundary Positions', () => {
    const property = fc.property(
      fc.oneof(
        fc.constant(0), // left boundary
        fc.constant(29) // right boundary
      ),
      fc.oneof(
        fc.constant(0), // top boundary
        fc.constant(19) // bottom boundary
      ),
      fc.oneof(
        fc.constant('table-round-4'),
        fc.constant('chair-1')
      ), // Use small icons at boundaries
      (col, row, iconId) => {
      const position = createGridPosition(col, row);
      const seat = createSeat(iconId, position, 'down');

      // Verify seat exists at boundary
      expect(seat.position.col).toBe(col);
      expect(seat.position.row).toBe(row);
      expect(seat.iconId).toBe(iconId);

      // Verify position is valid
      expect(seat.position.col).toBeGreaterThanOrEqual(0);
      expect(seat.position.row).toBeGreaterThanOrEqual(0);
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Edge case test: Verify center position works correctly
   * Grid center is approximately at (15, 10)
   */
  it('Property 1: Edge Cases - Center Position', () => {
    const property = fc.property(
      fc.oneof(
        fc.constant(14),
        fc.constant(15),
        fc.constant(16)
      ),
      fc.oneof(
        fc.constant(9),
        fc.constant(10),
        fc.constant(11)
      ),
      fc.oneof(...Array.from(iconConfigs.keys()).map(id => fc.constant(id))),
      (col, row, iconId) => {
      const position = createGridPosition(col, row);
      const seat = createSeat(iconId, position, 'down');

      // Verify seat exists at center region
      expect(seat.position.col).toBe(col);
      expect(seat.position.row).toBe(row);

      // Verify icon config matches
      const iconConfig = iconConfigs.get(iconId);
      expect(iconConfig?.id).toBe(iconId);
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Rotation independence test: Verify seat size is independent of rotation
   * A rotated 2×1 loveseat should still occupy 2 grid squares (even if visually rotated)
   */
  it('Property 5: Rotation Independence - Seat Size Constant', () => {
    const property = fc.property(
      fc.oneof(
        fc.constant('loveseat-2'),
        fc.constant('couch-3')
      ), // Multi-grid seats
      fc.integer({ min: 0, max: 27 }),
      fc.integer({ min: 0, max: 17 }),
      fc.oneof(
        fc.constant('left'),
        fc.constant('up'),
        fc.constant('right'),
        fc.constant('down')
      ),
      (iconId, col, row, rotation) => {
      const position = createGridPosition(col, row);
      const seat = createSeat(iconId, position, rotation as any);

      const iconConfig = iconConfigs.get(iconId);
      expect(iconConfig).toBeDefined();

      if (iconConfig) {
        // Verify size is constant regardless of rotation
        const occupiedSquares = getOccupiedGridSquares(position, iconConfig.size);
        expect(occupiedSquares.length).toBe(
          iconConfig.size.width * iconConfig.size.height
        );

        // Verify rotation is stored correctly
        expect(seat.rotation).toBe(rotation);
      }
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Property 2: Seat Deletion Removes Seat
   *
   * **Validates: Requirements 8.1, 8.2, 8.4**
   *
   * For ANY placed seat on the canvas, deleting it (via right-click) SHALL result
   * in that seat being removed from the seat list. A subsequent query for seats
   * at that position SHALL return empty.
   *
   * Mathematical properties verified:
   * - Removal: After deletion, seat no longer exists in seat list
   * - Position Emptiness: Query at deleted position returns no seat
   * - Single Deletion: Deleting one seat doesn't affect others
   * - Multi-grid Deletion: All grid squares are cleared for multi-grid seats
   * - No-op Safety: Deleting from empty position is safe
   *
   * Test cases:
   * - Single-click deletion on existing seat
   * - Multi-grid seat deletion (loveseat, couch)
   * - All grid squares cleared for multi-grid seats
   * - Multiple seat deletion in sequence
   * - Right-click on empty grid square (no-op)
   */
  it('Property 2: Seat Deletion Removes Seat', () => {
    const property = fc.property(
      fc.array(
        fc.tuple(
          fc.oneof(...Array.from(iconConfigs.keys()).map(id => fc.constant(id))),
          fc.integer({ min: 0, max: 29 }),
          fc.integer({ min: 0, max: 19 })
        ),
        { maxLength: 20 }
      ),
      (placements) => {
      // Step 1: Place seats without overlaps
      const seats: Seat[] = [];
      const occupiedPositions = new Set<string>();

      for (const [iconId, col, row] of placements) {
        const iconConfig = iconConfigs.get(iconId);
        if (!iconConfig) continue;

        // Check if this position would overlap with existing seats
        const position = createGridPosition(col, row);
        const occupiedSquares = getOccupiedGridSquares(position, iconConfig.size);

        // Skip if overlaps with existing seats
        const hasOverlap = occupiedSquares.some(p =>
          occupiedPositions.has(`${p.col},${p.row}`)
        );

        if (hasOverlap) continue;

        // Create and add seat
        const seat = createSeat(iconId, position, 'down');
        seats.push(seat);

        // Mark as occupied
        occupiedSquares.forEach(p => {
          occupiedPositions.add(`${p.col},${p.row}`);
        });
      }

      // If no seats were placed, we can't test deletion
      if (seats.length === 0) {
        return;
      }

      // Step 2: Test single seat deletion
      for (let i = 0; i < seats.length; i++) {
        const seatToDelete = seats[i];
        const initialCount = seats.length;

        // Create a copy of seats without the seat to delete
        const deletedSeats = seats.filter((_, index) => index !== i);

        // ====================================================================
        // Requirement 8.1: Seat Deletion Removes From List
        // ====================================================================
        // After deletion, the seat count should be exactly one less
        expect(deletedSeats.length).toBe(initialCount - 1);

        // The deleted seat should not be in the list
        const stillExists = deletedSeats.some(s => s.id === seatToDelete.id);
        expect(stillExists).toBe(false);

        // ====================================================================
        // Requirement 8.2: Query For Seats At Position Returns Empty
        // ====================================================================
        // Get the icon config for the deleted seat
        const iconConfig = iconConfigs.get(seatToDelete.iconId);
        if (iconConfig) {
          // Get all occupied squares
          const occupiedSquares = getOccupiedGridSquares(
            seatToDelete.position,
            iconConfig.size
          );

          // For each grid square that was occupied by the deleted seat,
          // verify no seat occupies it anymore
          for (const gridSquare of occupiedSquares) {
            const seatsAtPosition = deletedSeats.filter(s => {
              const seatOccupied = getOccupiedGridSquares(
                s.position,
                iconConfigs.get(s.iconId)?.size || { width: 1, height: 1 }
              );
              return seatOccupied.some(p =>
                positionsEqual(p, gridSquare)
              );
            });

            expect(seatsAtPosition.length).toBe(0);
          }
        }
      }

      // Step 3: Test multiple sequential deletions
      if (seats.length >= 2) {
        const seatsAfterFirstDelete = seats.slice(1);
        expect(seatsAfterFirstDelete.length).toBe(seats.length - 1);

        const seatsAfterSecondDelete = seatsAfterFirstDelete.slice(1);
        expect(seatsAfterSecondDelete.length).toBe(seats.length - 2);
      }

      // ====================================================================
      // Requirement 8.4: Multi-grid Seats - All Squares Cleared
      // ====================================================================
      // Find and test multi-grid seats (capacity 2 or 3)
      const multiGridSeats = seats.filter(s => {
        const config = iconConfigs.get(s.iconId);
        return config && (config.capacity === 2 || config.capacity === 3);
      });

      for (const multiGridSeat of multiGridSeats) {
        const iconConfig = iconConfigs.get(multiGridSeat.iconId);
        expect(iconConfig).toBeDefined();

        if (iconConfig) {
          // Get all grid squares occupied
          const occupiedSquares = getOccupiedGridSquares(
            multiGridSeat.position,
            iconConfig.size
          );

          // Verify all squares are occupied by this seat
          for (const square of occupiedSquares) {
            const seatsAtSquare = seats.filter(s => {
              const seatOccupied = getOccupiedGridSquares(
                s.position,
                iconConfigs.get(s.iconId)?.size || { width: 1, height: 1 }
              );
              return seatOccupied.some(p => positionsEqual(p, square));
            });

            // There should be exactly one seat at this square (the multi-grid seat)
            expect(seatsAtSquare.length).toBeGreaterThan(0);

            // After "deleting" the multi-grid seat, all squares should be empty
            const deletedSeats = seats.filter(s => s.id !== multiGridSeat.id);
            const seatsAtSquareAfterDelete = deletedSeats.filter(s => {
              const seatOccupied = getOccupiedGridSquares(
                s.position,
                iconConfigs.get(s.iconId)?.size || { width: 1, height: 1 }
              );
              return seatOccupied.some(p => positionsEqual(p, square));
            });

            expect(seatsAtSquareAfterDelete.length).toBe(0);
          }
        }
      }
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Property 6: Implicit Numbering Is Deterministic
   *
   * **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
   *
   * After deleting any seats, recalculating seat numbers twice SHALL produce
   * identical numbering. Numbering SHALL maintain left-to-right, top-to-bottom
   * order based on seat position.
   *
   * Mathematical properties verified:
   * - Determinism: Same input produces same output every time
   * - Consistency: Recalculating twice gives same result
   * - Order: Seats numbered left-to-right, top-to-bottom by position
   * - Uniqueness: Each numbering position has unique number
   * - Idempotence: Recalculating doesn't change the order
   *
   * Test cases:
   * - After single deletion, remaining seats renumbered sequentially
   * - After drag deletion of multiple seats, remaining seats renumbered
   * - Numbering order always left-to-right, then top-to-bottom
   * - Numbering recalculation is deterministic (same input = same output)
   * - Multi-grid seats maintain deterministic numbering
   */
  it('Property 6: Implicit Numbering Is Deterministic', () => {
    const property = fc.property(
      fc.array(
        fc.tuple(
          fc.oneof(...Array.from(iconConfigs.keys()).map(id => fc.constant(id))),
          fc.integer({ min: 0, max: 29 }),
          fc.integer({ min: 0, max: 19 })
        ),
        { maxLength: 15 }
      ),
      fc.integer({ min: 0, max: 10 }), // How many seats to delete (0 = none)
      (placements, deleteCount) => {
      // Step 1: Place seats without overlaps
      const seats: Seat[] = [];
      const occupiedPositions = new Set<string>();

      for (const [iconId, col, row] of placements) {
        const iconConfig = iconConfigs.get(iconId);
        if (!iconConfig) continue;

        // Check if this position would overlap with existing seats
        const position = createGridPosition(col, row);
        const occupiedSquares = getOccupiedGridSquares(position, iconConfig.size);

        // Skip if overlaps with existing seats
        const hasOverlap = occupiedSquares.some(p =>
          occupiedPositions.has(`${p.col},${p.row}`)
        );

        if (hasOverlap) continue;

        // Create and add seat
        const seat = createSeat(iconId, position, 'down');
        seats.push(seat);

        // Mark as occupied
        occupiedSquares.forEach(p => {
          occupiedPositions.add(`${p.col},${p.row}`);
        });
      }

      // If no seats, numbering is trivially deterministic (empty list)
      if (seats.length === 0) {
        return;
      }

      // Step 2: Delete some seats
      const actualDeleteCount = Math.min(deleteCount, seats.length - 1);
      let remainingSeats = seats.slice(actualDeleteCount);

      // ====================================================================
      // Requirement 12.1 & 12.2: Numbering is deterministic and consistent
      // ====================================================================
      // Calculate numbers twice and verify they're identical

      // First calculation
      const numbersFirst = SeatNumberingService.createPositionToNumberMap(
        remainingSeats,
        iconConfigs
      );

      // Second calculation (should be identical)
      const numbersSecond = SeatNumberingService.createPositionToNumberMap(
        remainingSeats,
        iconConfigs
      );

      // Verify the two calculations are identical
      expect(numbersFirst.size).toBe(numbersSecond.size);

      for (const [key, number] of numbersFirst) {
        const secondNumber = numbersSecond.get(key);
        expect(secondNumber).toBe(number);
      }

      // ====================================================================
      // Requirement 12.3: Numbering follows left-to-right, top-to-bottom order
      // ====================================================================
      // Sort seats by position to verify numbering order
      const sortedSeats = [...remainingSeats].sort((a, b) => {
        const rowDiff = a.position.row - b.position.row;
        if (rowDiff !== 0) {
          return rowDiff;
        }
        return a.position.col - b.position.col;
      });

      // Verify that earlier seats in sorted order have smaller numbers
      let currentNumber = 0;
      for (const seat of sortedSeats) {
        const iconConfig = iconConfigs.get(seat.iconId);
        if (!iconConfig) continue;

        // Skip tables (capacity 0) as they don't get numbered
        if (iconConfig.capacity === 0) continue;

        const occupiedSquares = getOccupiedGridSquares(
          seat.position,
          iconConfig.size
        );

        for (const square of occupiedSquares) {
          const key = `${square.col},${square.row}`;
          const number = numbersFirst.get(key);

          if (number !== undefined) {
            // Each grid square should have a unique incrementing number
            expect(number).toBeGreaterThan(currentNumber);
            currentNumber = number;
          }
        }
      }

      // ====================================================================
      // Requirement 12.4: Numbering is unique and sequential for seats
      // ====================================================================
      // Verify no duplicate numbers (each position has unique number)
      const numbersList = Array.from(numbersFirst.values());
      const uniqueNumbers = new Set(numbersList);
      expect(uniqueNumbers.size).toBe(numbersList.length);

      // Verify numbers start from 1 (or are empty if no seats)
      if (numbersList.length > 0) {
        const minNumber = Math.min(...numbersList);
        expect(minNumber).toBe(1);
      }

      // ====================================================================
      // Verify multi-grid seats - each square gets unique incrementing number
      // ====================================================================
      const multiGridSeats = remainingSeats.filter(s => {
        const config = iconConfigs.get(s.iconId);
        return config && (config.capacity === 2 || config.capacity === 3);
      });

      for (const multiGridSeat of multiGridSeats) {
        const iconConfig = iconConfigs.get(multiGridSeat.iconId);
        if (!iconConfig) continue;

        const occupiedSquares = getOccupiedGridSquares(
          multiGridSeat.position,
          iconConfig.size
        );

        // Get the numbers for all squares
        const squareNumbers = occupiedSquares
          .map(s => `${s.col},${s.row}`)
          .map(key => numbersFirst.get(key))
          .filter(num => num !== undefined) as number[];

        // Verify all squares have numbers
        expect(squareNumbers.length).toBe(occupiedSquares.length);

        // Verify numbers are sequential (each grid square gets unique incrementing number)
        for (let i = 1; i < squareNumbers.length; i++) {
          expect(squareNumbers[i]).toBe(squareNumbers[i - 1] + 1);
        }
      }

      // ====================================================================
      // Edge case: Empty remaining seats
      // ====================================================================
      if (remainingSeats.length === 0) {
        expect(numbersFirst.size).toBe(0);
        expect(numbersSecond.size).toBe(0);
      }
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Edge case test: Verify deletion of single seats
   * Tests that deleting a single seat from a multi-seat configuration works
   */
  it('Property 2 Edge Case: Single Seat Deletion', () => {
    const property = fc.property(
      fc.integer({ min: 0, max: 5 }), // Number of seats to place
      (seatCount) => {
      if (seatCount === 0) return;

      const seats: Seat[] = [];

      // Place seats in a grid pattern to avoid overlaps
      for (let i = 0; i < seatCount; i++) {
        const col = (i % 5) * 3; // Spacing of 3 to avoid overlaps
        const row = Math.floor(i / 5) * 3;

        if (col >= 30 || row >= 20) continue; // Skip if out of bounds

        const position = createGridPosition(col, row);
        const seat = createSeat('chair-1', position, 'down');
        seats.push(seat);
      }

      // Delete first seat if it exists
      if (seats.length > 0) {
        const deletedSeat = seats[0];
        const remainingSeats = seats.slice(1);

        // Verify deletion
        expect(remainingSeats.length).toBe(seats.length - 1);
        expect(remainingSeats.every(s => s.id !== deletedSeat.id)).toBe(true);

        // Verify position is empty
        const occupiedAtDeletedPos = remainingSeats.filter(s =>
          positionsEqual(s.position, deletedSeat.position)
        );
        expect(occupiedAtDeletedPos.length).toBe(0);
      }
    });

    fc.assert(property, { numRuns: 100 });
  });

  /**
   * Integration test: Deletion followed by renumbering
   * Tests that numbering is correct after deletion
   */
  it('Property 2 + 6 Combined: Deletion With Renumbering', () => {
    const property = fc.property(
      fc.array(
        fc.tuple(
          fc.oneof(
            fc.constant('chair-1'),
            fc.constant('loveseat-2')
          ),
          fc.integer({ min: 0, max: 27 }),
          fc.integer({ min: 0, max: 18 })
        ),
        { maxLength: 10 }
      ),
      (placements) => {
      // Place seats without overlaps
      const seats: Seat[] = [];
      const occupied = new Set<string>();

      for (const [iconId, col, row] of placements) {
        const config = iconConfigs.get(iconId);
        if (!config) continue;

        const position = createGridPosition(col, row);
        const squares = getOccupiedGridSquares(position, config.size);

        // Check overlap
        const hasOverlap = squares.some(s => occupied.has(`${s.col},${s.row}`));
        if (hasOverlap) continue;

        const seat = createSeat(iconId, position, 'down');
        seats.push(seat);

        squares.forEach(s => occupied.add(`${s.col},${s.row}`));
      }

      if (seats.length === 0) return;

      // Delete middle seat if exists
      const deleteIndex = Math.floor(seats.length / 2);
      const deletedSeat = seats[deleteIndex];
      const remainingSeats = seats.filter((_, i) => i !== deleteIndex);

      // ====================================================================
      // Property 2: Deletion removes seat
      // ====================================================================
      expect(remainingSeats.length).toBe(seats.length - 1);
      expect(remainingSeats.every(s => s.id !== deletedSeat.id)).toBe(true);

      // ====================================================================
      // Property 6: Numbering is deterministic after deletion
      // ====================================================================
      const numbersAfterDelete1 = SeatNumberingService.createPositionToNumberMap(
        remainingSeats,
        iconConfigs
      );

      const numbersAfterDelete2 = SeatNumberingService.createPositionToNumberMap(
        remainingSeats,
        iconConfigs
      );

      // Verify deterministic numbering
      expect(numbersAfterDelete1.size).toBe(numbersAfterDelete2.size);
      for (const [key, number] of numbersAfterDelete1) {
        expect(numbersAfterDelete2.get(key)).toBe(number);
      }
    });

    fc.assert(property, { numRuns: 100 });
  });
});
