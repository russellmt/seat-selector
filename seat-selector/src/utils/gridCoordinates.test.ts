/**
 * Unit tests for grid coordinate conversion functions
 * Tests pixelToGrid and gridToPixel algorithms
 *
 * Property-Based Tests validate:
 * - Requirements 38.1, 38.2, 38.3, 38.4: Grid coordinate system
 * - Property 21: Grid Coordinates Uniquely Identify Positions
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { pixelToGrid, gridToPixel, type GridDimensions } from './gridCoordinates';

describe('Grid Coordinate Conversion', () => {
  const gridDimensions: GridDimensions = {
    squareSize: 40, // 40 pixels per grid square
    offsetX: 100,   // canvas starts 100px from left
    offsetY: 100,   // canvas starts 100px from top
    cols: 10,
    rows: 10,
  };

  describe('pixelToGrid', () => {
    it('should convert pixel at grid square start', () => {
      // Grid square (0, 0) starts at pixel (100, 100)
      const result = pixelToGrid(100, 100, gridDimensions);
      expect(result).toEqual({ col: 0, row: 0 });
    });

    it('should convert pixel at start of grid square (1, 0)', () => {
      // Grid square (1, 0) starts at pixel (140, 100)
      const result = pixelToGrid(140, 100, gridDimensions);
      expect(result).toEqual({ col: 1, row: 0 });
    });

    it('should map pixels within a grid square range', () => {
      // Pixels 100-139 map to grid 0
      // Pixels 140-179 map to grid 1
      expect(pixelToGrid(139, 100, gridDimensions).col).toBe(0);
      expect(pixelToGrid(140, 100, gridDimensions).col).toBe(1);
    });

    it('should clamp to left boundary', () => {
      const result = pixelToGrid(50, 120, gridDimensions);
      expect(result.col).toBe(0);
    });

    it('should clamp to right boundary', () => {
      const result = pixelToGrid(600, 120, gridDimensions);
      expect(result.col).toBe(9);
    });

    it('should clamp to top boundary', () => {
      const result = pixelToGrid(120, 50, gridDimensions);
      expect(result.row).toBe(0);
    });

    it('should clamp to bottom boundary', () => {
      const result = pixelToGrid(120, 600, gridDimensions);
      expect(result.row).toBe(9);
    });

    it('should clamp to all boundaries', () => {
      const result = pixelToGrid(-1000, -1000, gridDimensions);
      expect(result).toEqual({ col: 0, row: 0 });
    });
  });

  describe('gridToPixel', () => {
    it('should convert grid position (0, 0) to pixel center', () => {
      const result = gridToPixel({ col: 0, row: 0 }, gridDimensions);
      // Grid (0, 0): top-left 100 + (0 * 40) = 100, center 100 + 20 = 120
      expect(result).toEqual({ pixelX: 120, pixelY: 120 });
    });

    it('should convert grid position (1, 0) to pixel center', () => {
      const result = gridToPixel({ col: 1, row: 0 }, gridDimensions);
      // Grid (1, 0): top-left 100 + (1 * 40) = 140, center 140 + 20 = 160
      expect(result).toEqual({ pixelX: 160, pixelY: 120 });
    });

    it('should convert grid position (0, 1) to pixel center', () => {
      const result = gridToPixel({ col: 0, row: 1 }, gridDimensions);
      // Grid (0, 1): center at (120, 160)
      expect(result).toEqual({ pixelX: 120, pixelY: 160 });
    });

    it('should convert grid position (5, 5) to pixel center', () => {
      const result = gridToPixel({ col: 5, row: 5 }, gridDimensions);
      // Grid (5, 5): center at (320, 320)
      expect(result).toEqual({ pixelX: 320, pixelY: 320 });
    });

    it('should convert grid position (9, 9) to pixel center', () => {
      const result = gridToPixel({ col: 9, row: 9 }, gridDimensions);
      // Grid (9, 9): center at (480, 480)
      expect(result).toEqual({ pixelX: 480, pixelY: 480 });
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve grid coordinates when converting to pixel and back', () => {
      // Grid to pixel to grid should preserve coordinates
      // (pixel to grid is lossy due to quantization, but grid to pixel to grid is lossless)
      const testCases = [
        { col: 0, row: 0 },
        { col: 1, row: 1 },
        { col: 5, row: 5 },
        { col: 9, row: 9 },
      ];

      for (const originalGrid of testCases) {
        const pixel = gridToPixel(originalGrid, gridDimensions);
        const resultGrid = pixelToGrid(pixel.pixelX, pixel.pixelY, gridDimensions);
        expect(resultGrid).toEqual(originalGrid);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle zero offset canvas', () => {
      const zeroOffsetGrid: GridDimensions = {
        squareSize: 50,
        offsetX: 0,
        offsetY: 0,
        cols: 5,
        rows: 5,
      };

      // (75 - 0) / 50 = 1.5, floor(1.5) = 1
      const result = pixelToGrid(75, 75, zeroOffsetGrid);
      expect(result).toEqual({ col: 1, row: 1 });
    });

    it('should handle large square size', () => {
      const largeSquareGrid: GridDimensions = {
        squareSize: 200,
        offsetX: 50,
        offsetY: 50,
        cols: 4,
        rows: 4,
      };

      // (250 - 50) / 200 = 1, floor(1) = 1
      const result = pixelToGrid(250, 250, largeSquareGrid);
      expect(result).toEqual({ col: 1, row: 1 });
    });

    it('should handle small square size', () => {
      const smallSquareGrid: GridDimensions = {
        squareSize: 10,
        offsetX: 20,
        offsetY: 20,
        cols: 20,
        rows: 20,
      };

      // (75 - 20) / 10 = 5.5, floor(5.5) = 5
      const result = pixelToGrid(75, 75, smallSquareGrid);
      expect(result).toEqual({ col: 5, row: 5 });
    });

    it('should handle negative offset', () => {
      const negativeOffsetGrid: GridDimensions = {
        squareSize: 40,
        offsetX: -50,
        offsetY: -50,
        cols: 10,
        rows: 10,
      };

      // (50 - (-50)) / 40 = 2.5, floor(2.5) = 2
      const result = pixelToGrid(50, 50, negativeOffsetGrid);
      expect(result).toEqual({ col: 2, row: 2 });
    });

    it('should handle single cell grid', () => {
      const singleCellGrid: GridDimensions = {
        squareSize: 40,
        offsetX: 100,
        offsetY: 100,
        cols: 1,
        rows: 1,
      };

      const result1 = pixelToGrid(0, 0, singleCellGrid);
      const result2 = pixelToGrid(1000, 1000, singleCellGrid);
      expect(result1).toEqual({ col: 0, row: 0 });
      expect(result2).toEqual({ col: 0, row: 0 });
    });

    it('should handle fractional square sizes', () => {
      const fractionalGrid: GridDimensions = {
        squareSize: 33.33,
        offsetX: 100,
        offsetY: 100,
        cols: 10,
        rows: 10,
      };

      // (166.65 - 100) / 33.33 ≈ 1.999, floor(1.999) = 1
      const result = pixelToGrid(166.65, 166.65, fractionalGrid);
      expect(result.col).toBe(1);
      expect(result.row).toBe(1);
    });
  });

  describe('Zoom level consistency', () => {
    it('should handle 2x zoom correctly', () => {
      const zoomedGrid: GridDimensions = {
        squareSize: 80,
        offsetX: 100,
        offsetY: 100,
        cols: 10,
        rows: 10,
      };

      // (180 - 100) / 80 = 1, floor(1) = 1
      const result = pixelToGrid(180, 180, zoomedGrid);
      expect(result).toEqual({ col: 1, row: 1 });
    });

    it('should handle 0.5x zoom correctly', () => {
      const zoomedOutGrid: GridDimensions = {
        squareSize: 20,
        offsetX: 100,
        offsetY: 100,
        cols: 10,
        rows: 10,
      };

      // (120 - 100) / 20 = 1, floor(1) = 1
      const result = pixelToGrid(120, 120, zoomedOutGrid);
      expect(result).toEqual({ col: 1, row: 1 });
    });
  });

  // ===================================================================
  // PROPERTY-BASED TESTS
  // Property 21: Grid Coordinates Uniquely Identify Positions
  // **Validates: Requirements 38.1, 38.2, 38.3, 38.4**
  // ===================================================================

  describe('Property-Based Tests: Coordinate System Integrity', () => {
    /**
     * Property 21.1: Round-trip conversion preserves grid coordinates
     *
     * For any valid grid coordinate, converting to pixel and back
     * to grid SHALL return the original grid coordinate.
     * This verifies the coordinate system is reversible and consistent.
     *
     * Mathematical property: grid → pixel → grid = grid (identity)
     */
    it('Property 21.1: Grid → Pixel → Grid conversion is reversible', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          offsetX: fc.integer({ min: -500, max: 500 }),
          offsetY: fc.integer({ min: -500, max: 500 }),
          cols: fc.integer({ min: 1, max: 100 }),
          rows: fc.integer({ min: 1, max: 100 }),
        }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
        (gridDims, col, row) => {
          const gridDimensions: GridDimensions = gridDims;
          // Clamp grid coordinates to bounds
          const clampedCol = Math.min(col, gridDimensions.cols - 1);
          const clampedRow = Math.min(row, gridDimensions.rows - 1);
          const originalGrid = { col: clampedCol, row: clampedRow };

          // Convert grid → pixel → grid
          const pixel = gridToPixel(originalGrid, gridDimensions);
          const resultGrid = pixelToGrid(pixel.pixelX, pixel.pixelY, gridDimensions);

          // Result should equal original
          expect(resultGrid).toEqual(originalGrid);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.2: Different grid coordinates map to different pixel positions
     *
     * For any two different grid coordinates, the resulting pixel positions
     * SHALL be different. This verifies uniqueness: no collisions between
     * different grid positions.
     *
     * Mathematical property: grid1 ≠ grid2 → pixel1 ≠ pixel2
     */
    it('Property 21.2: Different grid coordinates produce different pixel positions', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          offsetX: fc.integer({ min: -500, max: 500 }),
          offsetY: fc.integer({ min: -500, max: 500 }),
          cols: fc.integer({ min: 2, max: 100 }),
          rows: fc.integer({ min: 2, max: 100 }),
        }),
        fc.tuple(
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 0, max: 99 }),
        ),
        (gridDims, [col1, row1, col2, row2]) => {
          const gridDimensions: GridDimensions = gridDims;

          // Clamp to bounds
          const clampedCol1 = Math.min(col1, gridDimensions.cols - 1);
          const clampedRow1 = Math.min(row1, gridDimensions.rows - 1);
          const clampedCol2 = Math.min(col2, gridDimensions.cols - 1);
          const clampedRow2 = Math.min(row2, gridDimensions.rows - 1);

          const grid1 = { col: clampedCol1, row: clampedRow1 };
          const grid2 = { col: clampedCol2, row: clampedRow2 };

          // If grid coordinates are different, pixel positions must be different
          if (grid1.col !== grid2.col || grid1.row !== grid2.row) {
            const pixel1 = gridToPixel(grid1, gridDimensions);
            const pixel2 = gridToPixel(grid2, gridDimensions);

            // Positions should be different
            const pixelsAreDifferent =
              pixel1.pixelX !== pixel2.pixelX || pixel1.pixelY !== pixel2.pixelY;
            expect(pixelsAreDifferent).toBe(true);
          }
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.3: pixelToGrid always produces valid grid coordinates
     *
     * For any pixel position and grid dimensions, pixelToGrid SHALL return
     * coordinates within valid bounds (0 ≤ col < cols, 0 ≤ row < rows).
     * This verifies clamping works correctly.
     *
     * Mathematical property: ∀ pixel, ∃ grid ∈ [0, cols-1] × [0, rows-1]
     */
    it('Property 21.3: pixelToGrid always returns valid grid coordinates within bounds', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          offsetX: fc.integer({ min: -1000, max: 1000 }),
          offsetY: fc.integer({ min: -1000, max: 1000 }),
          cols: fc.integer({ min: 1, max: 100 }),
          rows: fc.integer({ min: 1, max: 100 }),
        }),
        fc.integer({ min: -2000, max: 2000 }),
        fc.integer({ min: -2000, max: 2000 }),
        (gridDims, pixelX, pixelY) => {
          const gridDimensions: GridDimensions = gridDims;
          const result = pixelToGrid(pixelX, pixelY, gridDimensions);

          // Result must be within valid bounds
          expect(result.col).toBeGreaterThanOrEqual(0);
          expect(result.col).toBeLessThan(gridDimensions.cols);
          expect(result.row).toBeGreaterThanOrEqual(0);
          expect(result.row).toBeLessThan(gridDimensions.rows);

          // Result must be an integer
          expect(Number.isInteger(result.col)).toBe(true);
          expect(Number.isInteger(result.row)).toBe(true);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.4: gridToPixel produces pixel coordinates at grid square centers
     *
     * For any grid coordinate, gridToPixel SHALL return a pixel position
     * at the center of that grid square, calculated as:
     * pixelX = offsetX + (col + 0.5) * squareSize
     * pixelY = offsetY + (row + 0.5) * squareSize
     *
     * Mathematical property: verified by formula
     */
    it('Property 21.4: gridToPixel produces pixel coordinates at grid square centers', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          offsetX: fc.integer({ min: -500, max: 500 }),
          offsetY: fc.integer({ min: -500, max: 500 }),
          cols: fc.integer({ min: 1, max: 100 }),
          rows: fc.integer({ min: 1, max: 100 }),
        }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
        (gridDims, col, row) => {
          const gridDimensions: GridDimensions = gridDims;
          const clampedCol = Math.min(col, gridDimensions.cols - 1);
          const clampedRow = Math.min(row, gridDimensions.rows - 1);
          const grid = { col: clampedCol, row: clampedRow };

          const result = gridToPixel(grid, gridDimensions);

          // Verify formula: center = offset + (index + 0.5) * squareSize
          const expectedPixelX =
            gridDimensions.offsetX + (grid.col + 0.5) * gridDimensions.squareSize;
          const expectedPixelY =
            gridDimensions.offsetY + (grid.row + 0.5) * gridDimensions.squareSize;

          expect(result.pixelX).toBe(expectedPixelX);
          expect(result.pixelY).toBe(expectedPixelY);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.5: Pixel-to-grid conversion is idempotent within a grid square
     *
     * For any pixel position within a grid square, converting to grid
     * SHALL always return the same grid coordinate regardless of where
     * within that square the pixel is located.
     *
     * Mathematical property: all pixels in range [offset + k*size, offset + (k+1)*size) → grid k
     */
    it('Property 21.5: All pixels within a grid square map to the same grid coordinate', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 10, max: 200 }),
          offsetX: fc.integer({ min: -500, max: 500 }),
          offsetY: fc.integer({ min: -500, max: 500 }),
          cols: fc.integer({ min: 2, max: 50 }),
          rows: fc.integer({ min: 2, max: 50 }),
        }),
        fc.integer({ min: 0, max: 49 }),
        fc.integer({ min: 0, max: 49 }),
        fc.integer({ min: 0, max: 9 }),
        fc.integer({ min: 0, max: 9 }),
        (gridDims, col, row, offsetInSquareX, offsetInSquareY) => {
          const gridDimensions: GridDimensions = gridDims;
          const clampedCol = Math.min(col, gridDimensions.cols - 1);
          const clampedRow = Math.min(row, gridDimensions.rows - 1);

          // Calculate pixel position within the grid square
          const squarePixelX =
            gridDimensions.offsetX + clampedCol * gridDimensions.squareSize + offsetInSquareX;
          const squarePixelY =
            gridDimensions.offsetY + clampedRow * gridDimensions.squareSize + offsetInSquareY;

          const result = pixelToGrid(squarePixelX, squarePixelY, gridDimensions);

          // Result should be the grid coordinate of that square
          expect(result.col).toBe(clampedCol);
          expect(result.row).toBe(clampedRow);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.6: Coordinate system with origin at (0, 0)
     *
     * The coordinate system SHALL have origin (0, 0) at the top-left corner.
     * When offset is (0, 0), pixel (0, 0) should map to grid (0, 0).
     *
     * Validates Requirement 38.4: origin (0, 0) SHALL be at the top-left corner
     */
    it('Property 21.6: Coordinate origin is at top-left (0, 0) with zero offset', () => {
      const property = fc.property(
        fc.integer({ min: 5, max: 200 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (squareSize, cols, rows) => {
          const gridDimensions: GridDimensions = {
            squareSize,
            offsetX: 0,
            offsetY: 0,
            cols,
            rows,
          };

          // Pixel (0, 0) should map to grid (0, 0)
          const result = pixelToGrid(0, 0, gridDimensions);
          expect(result).toEqual({ col: 0, row: 0 });

          // Grid (0, 0) should map back to pixel (squareSize/2, squareSize/2)
          const pixel = gridToPixel({ col: 0, row: 0 }, gridDimensions);
          expect(pixel.pixelX).toBe(squareSize / 2);
          expect(pixel.pixelY).toBe(squareSize / 2);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.7: Grid coordinates uniquely identify positions at different zoom levels
     *
     * The uniqueness and reversibility properties SHALL hold across
     * different zoom levels (different squareSize values).
     *
     * This verifies the coordinate system scales consistently.
     */
    it('Property 21.7: Coordinate system consistency across different zoom levels', () => {
      const property = fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 2, max: 10 }), // zoom factor
        (col, row, zoomFactor) => {
          const baseGrid: GridDimensions = {
            squareSize: 40,
            offsetX: 100,
            offsetY: 100,
            cols: 20,
            rows: 20,
          };

          const clampedCol = Math.min(col, baseGrid.cols - 1);
          const clampedRow = Math.min(row, baseGrid.rows - 1);
          const grid = { col: clampedCol, row: clampedRow };

          // Zoomed grid
          const zoomedGrid: GridDimensions = {
            squareSize: baseGrid.squareSize * zoomFactor,
            offsetX: baseGrid.offsetX,
            offsetY: baseGrid.offsetY,
            cols: baseGrid.cols,
            rows: baseGrid.rows,
          };

          // Both should round-trip correctly
          const pixel1 = gridToPixel(grid, baseGrid);
          const result1 = pixelToGrid(pixel1.pixelX, pixel1.pixelY, baseGrid);
          expect(result1).toEqual(grid);

          const pixel2 = gridToPixel(grid, zoomedGrid);
          const result2 = pixelToGrid(pixel2.pixelX, pixel2.pixelY, zoomedGrid);
          expect(result2).toEqual(grid);

          // Different grids should produce proportionally different pixels
          const pixelRatioX = pixel2.pixelX / pixel1.pixelX;
          const pixelRatioY = pixel2.pixelY / pixel1.pixelY;
          // Note: ratios near 1 when col/row is 0, but structure is maintained
          expect(pixelRatioX).toBeGreaterThan(0);
          expect(pixelRatioY).toBeGreaterThan(0);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.8: Monotonicity - increasing grid coordinates increase pixel positions
     *
     * For grid coordinates within the same bounds, increasing col SHALL
     * increase pixelX, and increasing row SHALL increase pixelY.
     *
     * Mathematical property: col1 < col2 → pixelX1 < pixelX2 (monotonic)
     */
    it('Property 21.8: Increasing grid coordinates monotonically increase pixel positions', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          offsetX: fc.integer({ min: -500, max: 500 }),
          offsetY: fc.integer({ min: -500, max: 500 }),
          cols: fc.integer({ min: 3, max: 100 }),
          rows: fc.integer({ min: 3, max: 100 }),
        }),
        fc.integer({ min: 0, max: 97 }),
        fc.integer({ min: 0, max: 97 }),
        (gridDims, col, row) => {
          const gridDimensions: GridDimensions = gridDims;
          const clampedCol = Math.min(col, gridDimensions.cols - 2);
          const clampedRow = Math.min(row, gridDimensions.rows - 2);

          const grid1 = { col: clampedCol, row: clampedRow };
          const grid2 = { col: clampedCol + 1, row: clampedRow };
          const grid3 = { col: clampedCol, row: clampedRow + 1 };

          const pixel1 = gridToPixel(grid1, gridDimensions);
          const pixel2 = gridToPixel(grid2, gridDimensions);
          const pixel3 = gridToPixel(grid3, gridDimensions);

          // Increasing column should increase pixelX
          expect(pixel2.pixelX).toBeGreaterThan(pixel1.pixelX);
          // Increasing row should increase pixelY
          expect(pixel3.pixelY).toBeGreaterThan(pixel1.pixelY);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.9: Consistent spacing between adjacent grid coordinates
     *
     * The pixel distance between adjacent grid coordinates SHALL be constant
     * and equal to squareSize (distance between grid centers is squareSize).
     *
     * Mathematical property: distance(pixel[i], pixel[i+1]) = squareSize
     */
    it('Property 21.9: Adjacent grid coordinates have consistent pixel spacing', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          offsetX: fc.integer({ min: -500, max: 500 }),
          offsetY: fc.integer({ min: -500, max: 500 }),
          cols: fc.integer({ min: 3, max: 100 }),
          rows: fc.integer({ min: 3, max: 100 }),
        }),
        fc.integer({ min: 0, max: 97 }),
        fc.integer({ min: 0, max: 97 }),
        (gridDims, col, row) => {
          const gridDimensions: GridDimensions = gridDims;
          const clampedCol = Math.min(col, gridDimensions.cols - 2);
          const clampedRow = Math.min(row, gridDimensions.rows - 2);

          const grid1 = { col: clampedCol, row: clampedRow };
          const grid2 = { col: clampedCol + 1, row: clampedRow };
          const grid3 = { col: clampedCol, row: clampedRow + 1 };

          const pixel1 = gridToPixel(grid1, gridDimensions);
          const pixel2 = gridToPixel(grid2, gridDimensions);
          const pixel3 = gridToPixel(grid3, gridDimensions);

          // Distance between col+1 should be exactly squareSize
          const xDistance = Math.abs(pixel2.pixelX - pixel1.pixelX);
          const yDistance = Math.abs(pixel3.pixelY - pixel1.pixelY);

          expect(xDistance).toBe(gridDimensions.squareSize);
          expect(yDistance).toBe(gridDimensions.squareSize);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });

    /**
     * Property 21.10: Canvas offset doesn't affect grid coordinate uniqueness
     *
     * Changing the canvas offset SHALL NOT affect which grid coordinates
     * are unique from each other - it only translates all pixels uniformly.
     *
     * Mathematical property: offset change is a linear translation
     */
    it('Property 21.10: Canvas offset affects all pixels uniformly without affecting grid uniqueness', () => {
      const property = fc.property(
        fc.record({
          squareSize: fc.integer({ min: 5, max: 200 }),
          cols: fc.integer({ min: 2, max: 50 }),
          rows: fc.integer({ min: 2, max: 50 }),
        }),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: 0, max: 49 }),
        fc.integer({ min: 0, max: 49 }),
        (baseDims, offsetX1, offsetX2, col, row) => {
          const gridDimensions1: GridDimensions = {
            ...baseDims,
            offsetX: offsetX1,
            offsetY: offsetX1,
          };

          const gridDimensions2: GridDimensions = {
            ...baseDims,
            offsetX: offsetX2,
            offsetY: offsetX2,
          };

          const clampedCol = Math.min(col, baseDims.cols - 1);
          const clampedRow = Math.min(row, baseDims.rows - 1);
          const grid = { col: clampedCol, row: clampedRow };

          const pixel1 = gridToPixel(grid, gridDimensions1);
          const pixel2 = gridToPixel(grid, gridDimensions2);

          // Both should round-trip correctly to the same grid coordinate
          const result1 = pixelToGrid(pixel1.pixelX, pixel1.pixelY, gridDimensions1);
          const result2 = pixelToGrid(pixel2.pixelX, pixel2.pixelY, gridDimensions2);

          expect(result1).toEqual(grid);
          expect(result2).toEqual(grid);

          // Pixels should differ by exactly the offset difference
          const expectedPixelXDiff = offsetX2 - offsetX1;
          const actualPixelXDiff = pixel2.pixelX - pixel1.pixelX;
          expect(actualPixelXDiff).toBe(expectedPixelXDiff);
        },
      );

      fc.assert(property, { numRuns: 100 });
    });
  });
});
