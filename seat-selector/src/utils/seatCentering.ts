/**
 * Seat Centering Logic
 * 
 * For rotated seats (LEFT/RIGHT):
 * - Both loveseat (1×2) and couch (1×3) are 1 square wide
 * - They should use identical positioning logic
 * - The center-top square is the visual anchor
 */

import type { GridSize, Rotation } from '../types/Icon';

/**
 * Calculate the rendering position offset for visual alignment.
 * 
 * For LEFT/RIGHT rotations, both multi-square seats get the same treatment:
 * - Anchor at center-top: offset by -0.5 in both X and Y
 * 
 * @param size - the stored (DOWN-facing) icon size
 * @param rotation - the rotation state
 * @returns { offsetX, offsetY } in grid squares
 */
export function getCenteringOffset(
  size: GridSize,
  rotation: Rotation,
): { offsetX: number; offsetY: number } {
  // For LEFT/RIGHT rotations, use -0.5 for both dimensions
  // This centers the icon on its anchor point
  if (rotation === 'left' || rotation === 'right') {
    return { offsetX: -0.5, offsetY: -0.5 };
  }

  // For DOWN/UP, apply centering based on stored dimensions
  const offsetX = size.width % 2 === 0 ? -0.5 : 0;
  const offsetY = size.height % 2 === 0 ? -0.5 : 0;

  return { offsetX, offsetY };
}
