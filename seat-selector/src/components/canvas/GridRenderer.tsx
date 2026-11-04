/**
 * GridRenderer Component
 *
 * Renders the visual grid lines on the SVG canvas.
 * Draws vertical and horizontal lines in light blue with subtle opacity.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import React from 'react';
import type { GridDimensions } from '../../utils/gridCoordinates';

/**
 * Props for the GridRenderer component
 */
export interface GridRendererProps {
  /** Grid dimensions and offsets */
  gridDimensions: GridDimensions;

  /** Reference to parent SVG element (for potential future use) */
  svgRef?: React.RefObject<SVGSVGElement>;
}

/**
 * GridRenderer Component
 *
 * Renders grid lines for the canvas background.
 *
 * Algorithm:
 * 1. For each column from 0 to gridDimensions.cols:
 *    - Draw vertical line at (col × squareSize, 0) to (col × squareSize, maxHeight)
 *    - Use light blue color with opacity 0.3
 *
 * 2. For each row from 0 to gridDimensions.rows:
 *    - Draw horizontal line at (0, row × squareSize) to (maxWidth, row × squareSize)
 *    - Use light blue color with opacity 0.3
 *
 * 3. Rendering is efficient: uses SVG elements (not canvas) for crisp output
 *
 * Requirements: 2.1, 2.2, 2.3
 */
export const GridRenderer: React.FC<GridRendererProps> = ({ gridDimensions }) => {
  // Grid line color: light blue
  const GRID_LINE_COLOR = '#ADD8E6'; // Light blue
  const GRID_LINE_OPACITY = 0.3;
  const GRID_LINE_WIDTH = 1;

  // Calculate canvas dimensions
  const canvasWidth = gridDimensions.cols * gridDimensions.squareSize;
  const canvasHeight = gridDimensions.rows * gridDimensions.squareSize;

  // Generate vertical lines (columns)
  const verticalLines = [];
  for (let col = 0; col <= gridDimensions.cols; col++) {
    const x = col * gridDimensions.squareSize;
    verticalLines.push(
      <line
        key={`v-${col}`}
        x1={x}
        y1={0}
        x2={x}
        y2={canvasHeight}
        stroke={GRID_LINE_COLOR}
        strokeWidth={GRID_LINE_WIDTH}
        opacity={GRID_LINE_OPACITY}
      />
    );
  }

  // Generate horizontal lines (rows)
  const horizontalLines = [];
  for (let row = 0; row <= gridDimensions.rows; row++) {
    const y = row * gridDimensions.squareSize;
    horizontalLines.push(
      <line
        key={`h-${row}`}
        x1={0}
        y1={y}
        x2={canvasWidth}
        y2={y}
        stroke={GRID_LINE_COLOR}
        strokeWidth={GRID_LINE_WIDTH}
        opacity={GRID_LINE_OPACITY}
      />
    );
  }

  return (
    <g className="grid-renderer">
      {/* Vertical lines */}
      {verticalLines}
      {/* Horizontal lines */}
      {horizontalLines}
    </g>
  );
};

export default GridRenderer;
