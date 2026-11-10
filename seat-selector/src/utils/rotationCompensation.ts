/**
 * Calculate rendering position compensation for rotated icons
 * 
 * For 90° rotations (LEFT/RIGHT), the visual bounds shift from the rotation.
 * We apply consistent compensation for both LEFT and RIGHT.
 */

import type { Rotation } from '../types/Icon';

export function getRotationCompensation(
  storedWidth: number,
  storedHeight: number,
  rotation: Rotation,
): { offsetX: number; offsetY: number } {
  // For DOWN/UP, no compensation
  if (rotation === 'down' || rotation === 'up') {
    return { offsetX: 0, offsetY: 0 };
  }
  
  // For LEFT/RIGHT, compensate for dimension swap
  // Both rotate 90°, so apply same compensation
  // Shift LEFT by half the width difference
  let offsetX = -(storedWidth - storedHeight) / 2;
  
  // Shift DOWN by half the difference (since height swaps to width position)
  // storedHeight becomes the visual width, storedWidth becomes visual height
  // Need to shift DOWN by (storedWidth - storedHeight) / 2
  let offsetY = (storedWidth - storedHeight) / 2;
  
  // Normalize -0 to 0 (JavaScript floating-point edge case)
  // This ensures consistent comparison in tests when width = height
  offsetX = offsetX === 0 ? 0 : offsetX;
  offsetY = offsetY === 0 ? 0 : offsetY;
  
  return { offsetX, offsetY };
}
