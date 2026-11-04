/**
 * Grid Coordinate Conversion Functions
 * Converts between pixel coordinates (from mouse events) and grid coordinates (logical positions)
 * Validates: Requirements 38.1, 38.2, 38.3, 38.4
 */

import type { GridPosition } from '../types/Seat';

/**
 * Grid dimensions for coordinate conversion
 * Provides the metadata needed to convert between pixel and grid coordinates
 */
export interface GridDimensions {
  squareSize: number; // pixels per grid square (at current zoom level)
  offsetX: number;    // canvas offset in pixels (left edge)
  offsetY: number;    // canvas offset in pixels (top edge)
  cols: number;       // total number of columns in the grid
  rows: number;       // total number of rows in the grid
}

/**
 * Converts pixel coordinates to grid coordinates
 *
 * Algorithm:
 * 1. Subtract canvas offset from pixel coordinates
 * 2. Divide by grid square size to get fractional grid position
 * 3. Round to nearest integer (quantize to grid center)
 * 4. Clamp to valid grid bounds
 * 5. Return GridPosition
 *
 * @param pixelX - x coordinate from mouse event (pixels)
 * @param pixelY - y coordinate from mouse event (pixels)
 * @param gridDimensions - grid metadata including offset and square size
 * @returns GridPosition clamped to valid grid bounds
 *
 * Requirements: 38.1, 38.2, 38.3, 38.4
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  gridDimensions: GridDimensions,
): GridPosition {
  // Step 1: Subtract canvas offset from pixel coordinates
  const relativeX = pixelX - gridDimensions.offsetX;
  const relativeY = pixelY - gridDimensions.offsetY;

  // Step 2: Divide by grid square size to get fractional position
  const fractionalCol = relativeX / gridDimensions.squareSize;
  const fractionalRow = relativeY / gridDimensions.squareSize;

  // Step 3: Floor to quantize to integer grid square
  // This maps pixel ranges [offset + k*size, offset + (k+1)*size) to grid k
  let col = Math.floor(fractionalCol);
  let row = Math.floor(fractionalRow);

  // Step 4: Clamp to valid grid bounds
  col = Math.max(0, Math.min(col, gridDimensions.cols - 1));
  row = Math.max(0, Math.min(row, gridDimensions.rows - 1));

  // Step 5: Return GridPosition
  return { col, row };
}

/**
 * Converts grid coordinates to pixel coordinates
 *
 * Algorithm:
 * 1. Multiply grid column by square size to get x offset within canvas
 * 2. Multiply grid row by square size to get y offset within canvas
 * 3. Add canvas offset to get absolute pixel position
 * 4. Add half square size to get the center of the grid square
 * 5. Return { pixelX, pixelY }
 *
 * @param gridPosition - grid coordinates
 * @param gridDimensions - grid metadata including offset and square size
 * @returns pixel coordinates at the center of the grid square
 *
 * Requirements: 38.1, 38.2, 38.3, 38.4
 */
export function gridToPixel(
  gridPosition: GridPosition,
  gridDimensions: GridDimensions,
): { pixelX: number; pixelY: number } {
  // Calculate position at top-left of the grid square
  const topLeftX = gridPosition.col * gridDimensions.squareSize + gridDimensions.offsetX;
  const topLeftY = gridPosition.row * gridDimensions.squareSize + gridDimensions.offsetY;

  // Add half square size to get center
  const centerPixelX = topLeftX + gridDimensions.squareSize / 2;
  const centerPixelY = topLeftY + gridDimensions.squareSize / 2;

  return { pixelX: centerPixelX, pixelY: centerPixelY };
}
