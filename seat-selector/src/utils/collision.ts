/**
 * Collision Detection and Path Calculation Utilities
 * Handles overlap detection and drag path calculation for seat placement
 * Validates: Requirements 7.3, 8.2
 */

import type { GridPosition, Seat } from '../types/Seat';
import type { GridSize, IconConfig, Rotation } from '../types/Icon';
import type { GridDimensions } from './gridCoordinates';
import { getRotatedSize } from './rotationSize';

/**
 * Checks if a seat of given size at a position would collide with any existing seats
 *
 * Algorithm: GetCollisions
 * Input: targetPosition (grid cell), seat size (width × height), rotation
 * Output: list of seats at those positions, or empty if clear
 *
 * 1. Calculate all grid squares occupied by the seat footprint (rotation-aware)
 * 2. For each grid square, check if a seat already exists there
 * 3. Return list of colliding seats
 * 4. If list is empty, placement is allowed
 *
 * Complexity: O(n) where n = number of seats
 *
 * @param position - the grid position where the seat would be placed
 * @param seatSize - the size of the seat (width and height in grid squares)
 * @param existingSeats - array of currently placed seats
 * @param gridDimensions - grid metadata for bounds checking
 * @param rotation - the rotation state of the new seat
 * @param iconConfigs - map of icon configurations for size lookup
 * @returns true if placement would collide with existing seats, false if clear
 *
 * Requirements: 7.3, 8.2
 */
export function hasCollision(
  position: GridPosition,
  seatSize: GridSize,
  existingSeats: Seat[],
  gridDimensions: GridDimensions,
  rotation?: Rotation,
  iconConfigs?: Map<string, IconConfig>,
): boolean {
  // Use rotation-aware size if rotation is provided
  const effectiveSize = rotation
    ? getRotatedSize(seatSize, rotation)
    : seatSize;

  const occupiedSquares = getGridSquaresOccupied(position, effectiveSize);

  for (const square of occupiedSquares) {
    // Check bounds
    if (
      square.col < 0 ||
      square.col >= gridDimensions.cols ||
      square.row < 0 ||
      square.row >= gridDimensions.rows
    ) {
      return true; // Out of bounds is a collision
    }

    // Check for collision with existing seats
    for (const existingSeat of existingSeats) {
      // Determine size of existing seat (rotation-aware)
      let existingSeatSize = { width: 1, height: 1 };
      if (iconConfigs) {
        const config = iconConfigs.get(existingSeat.iconId);
        if (config) {
          existingSeatSize = getRotatedSize(config.size, existingSeat.rotation);
        }
      }

      const existingSquares = getGridSquaresOccupied(
        existingSeat.position,
        existingSeatSize,
      );

      if (
        existingSquares.some(
          (s) => s.col === square.col && s.row === square.row,
        )
      ) {
        return true; // Found a collision
      }
    }
  }

  return false; // No collisions found
}

/**
 * Calculates all grid squares occupied by a seat of given size at a position
 *
 * Algorithm:
 * 1. For each row from position.row to position.row + size.height - 1
 * 2. For each column from position.col to position.col + size.width - 1
 * 3. Add (col, row) to results
 * 4. Return array of grid positions
 *
 * @param position - the grid position (top-left corner of the seat)
 * @param seatSize - the size of the seat in grid squares
 * @returns array of all grid positions occupied by the seat
 *
 * Requirements: 7.3, 8.2
 */
export function getGridSquaresOccupied(
  position: GridPosition,
  seatSize: GridSize,
): GridPosition[] {
  const occupied: GridPosition[] = [];

  for (let row = position.row; row < position.row + seatSize.height; row++) {
    for (let col = position.col; col < position.col + seatSize.width; col++) {
      occupied.push({ col, row });
    }
  }

  return occupied;
}

/**
 * Calculates all grid positions along a drag path using Bresenham's line algorithm
 *
 * Algorithm: Bresenham's Line Algorithm
 * Input: start and end grid positions
 * Output: ordered list of all grid positions from start to end
 *
 * 1. If start equals end, return [start]
 * 2. Calculate delta x and delta y
 * 3. Determine step direction
 * 4. Use Bresenham's algorithm to trace line
 * 5. Return ordered list of positions
 *
 * Complexity: O(max(dx, dy))
 *
 * @param start - the starting grid position
 * @param end - the ending grid position
 * @returns ordered array of grid positions along the drag path
 *
 * Requirements: 7.3, 8.2
 */
export function calculateDragPath(
  start: GridPosition,
  end: GridPosition,
): GridPosition[] {
  if (start.col === end.col && start.row === end.row) {
    return [start];
  }

  const path: GridPosition[] = [];
  const dx = Math.abs(end.col - start.col);
  const dy = Math.abs(end.row - start.row);
  const sx = start.col < end.col ? 1 : -1;
  const sy = start.row < end.row ? 1 : -1;

  let err = dx - dy;
  let col = start.col;
  let row = start.row;

  while (true) {
    path.push({ col, row });

    if (col === end.col && row === end.row) {
      break;
    }

    const e2 = 2 * err;

    if (e2 > -dy) {
      err -= dy;
      col += sx;
    }

    if (e2 < dx) {
      err += dx;
      row += sy;
    }
  }

  return path;
}

/**
 * Finds all seats that occupy any grid square in the given path
 *
 * Algorithm: GetSeatsInDragPath
 * Input: dragStart, dragEnd (grid positions), seat size
 * Output: list of all grid positions in the path
 *
 * 1. Calculate all grid squares along the path (Bresenham's line algorithm)
 * 2. For each grid square in path:
 *    - Identify all occupied grid squares for a seat at that position
 *    - Add to results (avoiding duplicates)
 * 3. Return ordered list of positions
 *
 * @param path - array of grid positions to search
 * @param existingSeats - array of currently placed seats
 * @param iconConfigs - map of icon configurations for size lookup
 * @returns array of seats that occupy any position in the path (deduplicated)
 *
 * Requirements: 7.3, 8.2
 */
export function findSeatsInPath(
  path: GridPosition[],
  existingSeats: Seat[],
  iconConfigs: Map<string, IconConfig>,
): Seat[] {
  const seatsInPath: Set<string> = new Set(); // Use Set for deduplication by seat ID
  const result: Seat[] = [];

  for (const pathPosition of path) {
    for (const seat of existingSeats) {
      const iconConfig = iconConfigs.get(seat.iconId);
      if (!iconConfig) {
        continue;
      }

      // Use rotation-aware size
      const rotatedSize = getRotatedSize(iconConfig.size, seat.rotation);
      const occupiedSquares = getGridSquaresOccupied(seat.position, rotatedSize);

      const seatOccupiesPathPosition = occupiedSquares.some(
        (square) =>
          square.col === pathPosition.col && square.row === pathPosition.row,
      );

      if (seatOccupiesPathPosition && !seatsInPath.has(seat.id)) {
        seatsInPath.add(seat.id);
        result.push(seat);
      }
    }
  }

  return result;
}

/**
 * Helper function to check if a position overlaps with a seat
 *
 * @param position - the grid position to check
 * @param seat - the seat to check against
 * @param seatSize - the size of the seat
 * @returns true if position overlaps with seat, false otherwise
 */
export function positionOverlapsSeat(
  position: GridPosition,
  seat: Seat,
  seatSize: GridSize,
): boolean {
  const rotatedSize = getRotatedSize(seatSize, seat.rotation);
  const seatSquares = getGridSquaresOccupied(seat.position, rotatedSize);
  return seatSquares.some((s) => s.col === position.col && s.row === position.row);
}
