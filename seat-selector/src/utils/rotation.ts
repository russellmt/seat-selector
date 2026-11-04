/**
 * Rotation utility functions
 * Handles rotation state cycling through cardinal directions
 */

import type { Rotation } from '../types/Icon';

/**
 * Rotates to the next cardinal direction in the cycle
 * Cycle: left → up → right → down → left
 * @param current - The current rotation state
 * @returns The next rotation state clockwise
 */
export function rotate(current: Rotation): Rotation {
  const cycle: Record<Rotation, Rotation> = {
    left: 'up',
    up: 'right',
    right: 'down',
    down: 'left',
  };
  return cycle[current];
}

/**
 * Rotates backward to the previous cardinal direction
 * Cycle: left ← up ← right ← down ← left
 * @param current - The current rotation state
 * @returns The previous rotation state counter-clockwise
 */
export function rotateBack(current: Rotation): Rotation {
  const cycle: Record<Rotation, Rotation> = {
    left: 'down',
    up: 'left',
    right: 'up',
    down: 'right',
  };
  return cycle[current];
}

/**
 * Gets the rotation state after applying rotate n times
 * @param current - The starting rotation state
 * @param times - Number of times to rotate
 * @returns The rotation state after n rotations
 */
export function rotateN(current: Rotation, times: number): Rotation {
  let result = current;
  const normalizedTimes = ((times % 4) + 4) % 4; // Normalize to 0-3
  for (let i = 0; i < normalizedTimes; i++) {
    result = rotate(result);
  }
  return result;
}
