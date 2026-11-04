import type { Seat, GridPosition } from '../types/Seat';
import type { IconConfig } from '../types/Icon';
import { getGridSquaresOccupied } from '../utils/collision';

/**
 * SeatNumberingService provides implicit numbering for seats based on their grid positions
 * Numbers are assigned deterministically: left-to-right, top-to-bottom
 * 
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4
 */
export class SeatNumberingService {
  /**
   * Calculate and assign implicit numbers to all seats
   * 
   * Algorithm: CalculateSeatNumbers
   * 
   * 1. Create array of (seat, position) tuples
   * 2. Sort by row (ascending), then by column (ascending)
   * 3. Assign numbers 1, 2, 3, ... in sorted order
   * 4. Handle multi-grid seats: all grid squares occupied by a seat receive the same number
   * 5. Return updated seats array
   * 
   * Complexity: O(n log n) where n = number of seats
   * Performance: < 100ms for typical configurations
   * 
   * @param seats - the array of seats to renumber
   * @returns new array of seats with updated numbers
   * 
   * Requirements: 12.1, 12.2, 12.3, 12.4
   */
  static calculateSeatNumbers(
    seats: Seat[],
  ): Seat[] {
    if (seats.length === 0) {
      return [];
    }

    // Step 1: Create array of (seat, topLeftPosition) tuples
    // For multi-grid seats, we sort by the top-left corner
    const seatsWithPositions = seats.map(seat => ({
      seat,
      topLeftPosition: seat.position,
    }));

    // Step 2: Sort by row (ascending), then by column (ascending)
    seatsWithPositions.sort((a, b) => {
      const rowDiff = a.topLeftPosition.row - b.topLeftPosition.row;
      if (rowDiff !== 0) {
        return rowDiff;
      }
      return a.topLeftPosition.col - b.topLeftPosition.col;
    });

    // Step 3 & 4: Assign numbers 1, 2, 3, ...
    const numberedSeats = seatsWithPositions.map((item, index) => ({
      ...item.seat,
      number: index + 1, // Numbers start at 1
    }));

    return numberedSeats;
  }

  /**
   * Renumber a single seat based on all seats (utility for updating a specific seat)
   * 
   * @param seatToUpdate - the seat to renumber
   * @param allSeats - all seats in the configuration
   * @returns the updated seat with new number
   */
  static renumberSeat(
    seatToUpdate: Seat,
    allSeats: Seat[],
  ): Seat {
    const renumbered = this.calculateSeatNumbers(allSeats);
    const updated = renumbered.find(s => s.id === seatToUpdate.id);
    return updated || seatToUpdate;
  }

  /**
   * Get the seat number that occupies a specific grid square
   * 
   * Useful for rendering: multiple grid squares in a multi-grid seat
   * should all display the same number
   * 
   * @param gridPosition - the grid square to check
   * @param seats - array of seats with assigned numbers
   * @param iconConfigs - map of icon configurations for size lookup
   * @returns the seat number if a seat occupies this grid square, undefined otherwise
   */
  static getSeatNumberAt(
    gridPosition: GridPosition,
    seats: Seat[],
    iconConfigs: Map<string, IconConfig>,
  ): number | undefined {
    for (const seat of seats) {
      const iconConfig = iconConfigs.get(seat.iconId);
      if (!iconConfig) {
        continue;
      }

      const occupiedSquares = getGridSquaresOccupied(
        seat.position,
        iconConfig.size,
      );

      const isOccupied = occupiedSquares.some(
        sq => sq.col === gridPosition.col && sq.row === gridPosition.row,
      );

      if (isOccupied) {
        return seat.number;
      }
    }

    return undefined;
  }

  /**
   * Create a map of all grid positions to their seat numbers
   * Useful for quick lookups when rendering
   * 
   * @param seats - array of seats with assigned numbers
   * @param iconConfigs - map of icon configurations
   * @returns map from position string to seat number
   */
  static createPositionToNumberMap(
    seats: Seat[],
    iconConfigs: Map<string, IconConfig>,
  ): Map<string, number> {
    const map = new Map<string, number>();

    for (const seat of seats) {
      const iconConfig = iconConfigs.get(seat.iconId);
      if (!iconConfig) {
        continue;
      }

      const occupiedSquares = getGridSquaresOccupied(
        seat.position,
        iconConfig.size,
      );

      for (const square of occupiedSquares) {
        const key = `${square.col},${square.row}`;
        map.set(key, seat.number);
      }
    }

    return map;
  }
}

/**
 * Singleton instance for application-wide use
 */
export const seatNumberingService = new SeatNumberingService();
