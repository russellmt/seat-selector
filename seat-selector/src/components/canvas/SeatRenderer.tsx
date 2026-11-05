/**
 * SeatRenderer Component
 *
 * Renders placed seats on the canvas with proper positioning, rotation, and scaling.
 * Each seat displays its icon (SVG or image) with applied transforms and seat numbers.
 *
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4, 13.5**
 *
 * Algorithm: RenderSeat
 * For each seat:
 * 1. Calculate pixel position from grid position using gridToPixel
 * 2. Apply rotation transform to seat icon (via CSS transform)
 * 3. Scale icon to match icon size (width × height grid squares)
 * 4. Render seat icon at calculated position (SVG or image)
 * 5. For multi-grid seats:
 *    - Calculate all grid squares occupied using getGridSquaresOccupied
 *    - Render seat number in center of each grid square
 * 6. Render seat number as white text, centered on seat footprint
 */

import React, { useMemo } from 'react';
import type { Seat } from '../../types/Seat';
import type { IconConfig } from '../../types/Icon';
import type { GridDimensions } from '../../utils/gridCoordinates';
import { gridToPixel } from '../../utils/gridCoordinates';
import { getGridSquaresOccupied } from '../../utils/collision';
import { SeatNumberingService } from '../../services/SeatNumberingService';

/**
 * Props for the SeatRenderer component
 */
export interface SeatRendererProps {
  /** Array of seats to render */
  seats: Seat[];

  /** Map of seat position string to seat numbers for quick lookup */
  seatNumbers: Map<string, number>;

  /** Grid dimensions and offsets */
  gridDimensions: GridDimensions;

  /** Map of icon ID to IconConfig for retrieving icon properties */
  iconConfigs: Map<string, IconConfig>;
}

/**
 * Helper function to get rotation angle in degrees
 */
function getRotationAngle(rotation: Seat['rotation']): number {
  switch (rotation) {
    case 'left':
      return 270; // -90 degrees (or 270 clockwise)
    case 'up':
      return 180;
    case 'right':
      return 90;
    case 'down':
    default:
      return 0;
  }
}

/**
 * Helper function to get transform origin for rotation
 * Returns the center of the seat footprint
 */
function getTransformOrigin(
  startPixelX: number,
  startPixelY: number,
  squareSize: number,
  width: number,
  height: number,
): string {
  const centerX = startPixelX + (squareSize * width) / 2;
  const centerY = startPixelY + (squareSize * height) / 2;
  return `${centerX}px ${centerY}px`;
}

/**
 * SeatRenderer Component
 *
 * Renders all placed seats with their icons (SVG or image), rotations, and seat numbers.
 * Uses CSS transforms for GPU-accelerated rotation and scaling.
 * Supports both inline SVG content and image URLs (PNG, JPG, etc. from CDN).
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4, 13.5
 */
export const SeatRenderer: React.FC<SeatRendererProps> = ({
  seats,
  seatNumbers,
  gridDimensions,
  iconConfigs,
}) => {
  // Use provided seatNumbers if available, otherwise calculate from seats
  const numberMap = useMemo(() => {
    // If seatNumbers is provided and has content, use it directly
    if (seatNumbers && seatNumbers.size > 0) {
      return seatNumbers;
    }
    // Otherwise, calculate from seats using SeatNumberingService
    return SeatNumberingService.createPositionToNumberMap(seats, iconConfigs);
  }, [seats, seatNumbers, iconConfigs]);

  // Render each seat
  const seatElements = seats.map(seat => {
    const iconConfig = iconConfigs.get(seat.iconId);
    if (!iconConfig) {
      // Skip rendering if icon config not found
      return null;
    }

    // Calculate the pixel position of the seat's top-left corner
    const { pixelX: startPixelX, pixelY: startPixelY } = gridToPixel(
      seat.position,
      gridDimensions,
    );

    // Calculate the width and height of the seat in pixels
    const seatWidthPixels = iconConfig.size.width * gridDimensions.squareSize;
    const seatHeightPixels = iconConfig.size.height * gridDimensions.squareSize;

    // Get rotation angle
    const rotationAngle = getRotationAngle(seat.rotation);

    // Get transform origin (center of the seat footprint)
    const transformOrigin = getTransformOrigin(
      startPixelX,
      startPixelY,
      gridDimensions.squareSize,
      iconConfig.size.width,
      iconConfig.size.height,
    );

    // Get all grid squares occupied by this seat
    const occupiedSquares = getGridSquaresOccupied(seat.position, iconConfig.size);

    return (
      <g key={seat.id} className="seat-renderer-group">
        {/* Render the seat icon */}
        <g
          className="seat-icon"
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transformOrigin,
            // Use GPU acceleration for better performance
            willChange: 'transform',
          }}
        >
          {/* SVG icon: render inline SVG content */}
          {iconConfig.visual.type === 'svg' && (
            <svg
              x={startPixelX}
              y={startPixelY}
              width={seatWidthPixels}
              height={seatHeightPixels}
              viewBox="0 0 2.8 2.8" // Large enough to accommodate 3×1 loveseat
              preserveAspectRatio="xMidYMid meet"
              className="seat-icon-svg"
              style={{
                pointerEvents: 'none', // Prevent interaction with icon itself
              }}
            >
              {/* Render the icon SVG content */}
              <g
                dangerouslySetInnerHTML={{
                  __html: iconConfig.visual.content,
                }}
                style={{
                  color: iconConfig.color,
                }}
              />
            </svg>
          )}

          {/* Image icon: render as SVG image element for consistent transform support */}
          {iconConfig.visual.type === 'image' && (
            <image
              x={startPixelX}
              y={startPixelY}
              width={seatWidthPixels}
              height={seatHeightPixels}
              href={iconConfig.visual.url}
              className="seat-icon-image"
              style={{
                pointerEvents: 'none', // Prevent interaction with image itself
              }}
              onError={() => {
                console.warn(`Failed to load icon image: ${iconConfig.visual.type === 'image' ? iconConfig.visual.url : 'unknown'}`);
              }}
            />
          )}
        </g>

        {/* Render seat numbers for each grid square occupied by this seat */}
        {occupiedSquares.map(gridSquare => {
          const { pixelX: numberPixelX, pixelY: numberPixelY } = gridToPixel(
            gridSquare,
            gridDimensions,
          );

          // Get the seat number for this grid square
          const positionKey = `${gridSquare.col},${gridSquare.row}`;
          const seatNumber = numberMap.get(positionKey);

          if (seatNumber === undefined) {
            return null;
          }

          return (
            <text
              key={`seat-number-${seat.id}-${positionKey}`}
              x={numberPixelX}
              y={numberPixelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="seat-number"
              style={{
                fontSize: `${gridDimensions.squareSize * 0.5}px`,
                fill: 'white',
                fontWeight: 'bold',
                pointerEvents: 'none',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                // Add text outline for better contrast
                stroke: '#333',
                strokeWidth: 0.5,
                paintOrder: 'stroke',
              }}
            >
              {seatNumber}
            </text>
          );
        })}
      </g>
    );
  });

  return <g className="seat-renderer">{seatElements}</g>;
};

export default SeatRenderer;
