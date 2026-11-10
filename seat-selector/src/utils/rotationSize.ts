/**
 * Rotation-aware size calculations
 * 
 * The grid footprint changes with rotation:
 * - Loveseat: 2×1 when facing DOWN/UP, 1×2 when facing LEFT/RIGHT
 * - Couch: 3×1 when facing DOWN/UP, 1×3 when facing LEFT/RIGHT
 * 
 * This affects:
 * 1. Which grid squares the seat occupies
 * 2. Where seat numbers are placed
 * 3. Collision detection
 */

import type { GridSize, Rotation } from '../types';

/**
 * Calculates the grid footprint of an icon based on rotation
 * 
 * The stored size is the footprint when facing DOWN.
 * When rotated LEFT/RIGHT by 90°, dimensions swap.
 * 
 * @param storedSize - the size when facing DOWN (e.g., loveseat is 2×1)
 * @param rotation - the rotation direction
 * @returns the grid footprint for this rotation
 */
export function getRotatedSize(storedSize: GridSize, rotation: Rotation): GridSize {
  switch (rotation) {
    case 'down':
    case 'up':
      // DOWN/UP: use stored size as-is
      return storedSize;
    
    case 'left':
    case 'right':
      // LEFT/RIGHT: swap width and height (90° rotation)
      return {
        width: storedSize.height,
        height: storedSize.width,
      };
    
    default:
      return storedSize;
  }
}
