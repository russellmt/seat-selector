/**
 * Seat and Grid Position Types
 * Defines the structure for seats and their positioning on the grid
 */

import type { Rotation } from './Icon';

/**
 * GridPosition represents a coordinate on the grid
 * col and row are integer values identifying a unique grid square
 */
export interface GridPosition {
  col: number;  // column coordinate (x-axis)
  row: number;  // row coordinate (y-axis)
}

/**
 * Seat represents a placed instance of an icon on the canvas
 * Each seat has a position and rotation. Numbers are calculated per grid square
 * based on the seat's position and capacity, not stored on the seat itself.
 */
export interface Seat {
  id: string;              // unique identifier
  iconId: string;          // reference to the icon configuration
  position: GridPosition;  // grid coordinates where the seat is placed
  rotation: Rotation;      // rotation state (left, up, right, down)
}

/**
 * Creates a new seat with the given parameters
 * @param iconId - the icon configuration ID
 * @param position - the grid position
 * @param rotation - the rotation state (defaults to 'down')
 * @returns a new Seat object
 */
export function createSeat(
  iconId: string,
  position: GridPosition,
  rotation: Rotation = 'down',
): Seat {
  return {
    id: `seat-${Math.random().toString(36).substr(2, 9)}`,
    iconId,
    position,
    rotation,
  };
}

/**
 * Creates a grid position
 * @param col - column coordinate
 * @param row - row coordinate
 * @returns a new GridPosition object
 */
export function createGridPosition(col: number, row: number): GridPosition {
  return { col, row };
}
