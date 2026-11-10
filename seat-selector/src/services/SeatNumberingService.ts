import type { Seat, GridPosition } from '../types/Seat';
import type { IconConfig } from '../types/Icon';
import { getGridSquaresOccupied } from '../utils/collision';
import { getRotatedSize } from '../utils/rotationSize';

/**
 * SeatNumberingService provides implicit numbering for seats based on their grid positions
 * Numbers are assigned deterministically: left-to-right, top-to-bottom
 * 
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4
 */

export class SeatNumberingService {
  static calculateSeatNumbers(seats: Seat[]): Seat[] {
    return seats;
  }

  static renumberSeat(seatToUpdate: Seat): Seat {
    return seatToUpdate;
  }

  static getNumberForGridSquare(
    gridPosition: GridPosition,
    seats: Seat[],
    iconConfigs: Map<string, IconConfig>,
  ): number | undefined {
    const seatsWithPositions = seats.map(seat => ({
      seat,
      topLeftPosition: seat.position,
    }));

    seatsWithPositions.sort((a, b) => {
      const rowDiff = a.topLeftPosition.row - b.topLeftPosition.row;
      if (rowDiff !== 0) {
        return rowDiff;
      }
      return a.topLeftPosition.col - b.topLeftPosition.col;
    });

    let globalNumber = 1;
    for (const { seat } of seatsWithPositions) {
      const iconConfig = iconConfigs.get(seat.iconId);
      if (!iconConfig) {
        continue;
      }

      if (iconConfig.capacity === 0) {
        continue;
      }

      const rotatedSize = getRotatedSize(iconConfig.size, seat.rotation);
      const occupiedSquares = getGridSquaresOccupied(seat.position, rotatedSize);

      for (const square of occupiedSquares) {
        if (square.col === gridPosition.col && square.row === gridPosition.row) {
          return globalNumber;
        }
        globalNumber++;
      }
    }

    return undefined;
  }

  static createPositionToNumberMap(
    seats: Seat[],
    iconConfigs: Map<string, IconConfig>,
  ): Map<string, number> {
    const map = new Map<string, number>();

    const seatsWithPositions = seats.map(seat => ({
      seat,
      topLeftPosition: seat.position,
    }));

    seatsWithPositions.sort((a, b) => {
      const rowDiff = a.topLeftPosition.row - b.topLeftPosition.row;
      if (rowDiff !== 0) {
        return rowDiff;
      }
      return a.topLeftPosition.col - b.topLeftPosition.col;
    });

    let globalNumber = 1;
    for (const { seat } of seatsWithPositions) {
      const iconConfig = iconConfigs.get(seat.iconId);
      if (!iconConfig) {
        continue;
      }

      if (iconConfig.capacity === 0) {
        continue;
      }

      const rotatedSize = getRotatedSize(iconConfig.size, seat.rotation);
      const occupiedSquares = getGridSquaresOccupied(seat.position, rotatedSize);

      for (const square of occupiedSquares) {
        const key = `${square.col},${square.row}`;
        map.set(key, globalNumber);
        globalNumber++;
      }
    }

    return map;
  }
}

export const seatNumberingService = new SeatNumberingService();
