/**
 * SeatRenderer Component
 *
 * Renders placed seats on the canvas with proper positioning, rotation, and scaling.
 * Each seat displays its icon with rotation transform and seat numbers in the correct grid squares.
 *
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4, 13.5**
 */

import React, { useMemo } from 'react';
import type { Seat } from '../../types/Seat';
import type { IconConfig } from '../../types/Icon';
import type { GridDimensions } from '../../utils/gridCoordinates';
import { gridToPixel } from '../../utils/gridCoordinates';
import { getGridSquaresOccupied } from '../../utils/collision';
import { SeatNumberingService } from '../../services/SeatNumberingService';
import { getRotationCompensation } from '../../utils/rotationCompensation';
import { getRotatedSize } from '../../utils/rotationSize';

/**
 * Props for the SeatRenderer component
 */
export interface SeatRendererProps {
  seats: Seat[];
  seatNumbers?: Map<string, number>;
  gridDimensions: GridDimensions;
  iconConfigs: Map<string, IconConfig>;
}

function getRotationAngle(rotation: Seat['rotation']): number {
  switch (rotation) {
    case 'left':
      return 270;
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
 * Calculate rotation compensation offset to align icon with grid after rotation
 */


export const SeatRenderer: React.FC<SeatRendererProps> = ({
  seats,
  seatNumbers,
  gridDimensions,
  iconConfigs,
}) => {
  const numberMap = useMemo(() => {
    if (seatNumbers && seatNumbers.size > 0) {
      return seatNumbers;
    }
    return SeatNumberingService.createPositionToNumberMap(seats, iconConfigs);
  }, [seats, seatNumbers, iconConfigs]);

  const seatElements = seats.map(seat => {
    const iconConfig = iconConfigs.get(seat.iconId);
    if (!iconConfig) {
      return null;
    }

    const rotatedSize = getRotatedSize(iconConfig.size, seat.rotation);
    const compensation = getRotationCompensation(iconConfig.size.width, iconConfig.size.height, seat.rotation);
    
    const iconWidthPixels = iconConfig.size.width * gridDimensions.squareSize;
    const iconHeightPixels = iconConfig.size.height * gridDimensions.squareSize;

    const gridTopLeftX = seat.position.col * gridDimensions.squareSize + gridDimensions.offsetX;
    const gridTopLeftY = seat.position.row * gridDimensions.squareSize + gridDimensions.offsetY;

    // Apply rotation compensation
    const compensationPixelsX = compensation.offsetX * gridDimensions.squareSize;
    const compensationPixelsY = compensation.offsetY * gridDimensions.squareSize;

    const iconPixelX = gridTopLeftX + compensationPixelsX;
    const iconPixelY = gridTopLeftY + compensationPixelsY;

    const centerPixelX = iconPixelX + iconWidthPixels / 2;
    const centerPixelY = iconPixelY + iconHeightPixels / 2;

    const rotationAngle = getRotationAngle(seat.rotation);
    const viewBoxString = `0 0 ${iconConfig.size.width} ${iconConfig.size.height}`;

    // Grid squares from seat position with rotated size
    const occupiedSquares = getGridSquaresOccupied(seat.position, rotatedSize);

    return (
      <g key={seat.id} className="seat-renderer-group">
        <g
          className="seat-icon"
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transformOrigin: `${centerPixelX}px ${centerPixelY}px`,
            willChange: 'transform',
          }}
        >
          {iconConfig.visual.type === 'svg' && (
            <svg
              x={iconPixelX}
              y={iconPixelY}
              width={iconWidthPixels}
              height={iconHeightPixels}
              viewBox={viewBoxString}
              preserveAspectRatio="none"
              className="seat-icon-svg"
              style={{
                pointerEvents: 'none',
              }}
            >
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

          {iconConfig.visual.type === 'image' && (
            <image
              x={iconPixelX}
              y={iconPixelY}
              width={iconWidthPixels}
              height={iconHeightPixels}
              href={iconConfig.visual.url}
              className="seat-icon-image"
              style={{
                pointerEvents: 'none',
              }}
              onError={() => {
                console.warn(`Failed to load icon image: ${iconConfig.visual.type === 'image' ? iconConfig.visual.url : 'unknown'}`);
              }}
            />
          )}
        </g>

        {occupiedSquares.map(gridSquare => {
          const { pixelX: numberPixelX, pixelY: numberPixelY } = gridToPixel(
            gridSquare,
            gridDimensions,
          );

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
                fontSize: `${gridDimensions.squareSize * 0.35}px`,
                fill: 'white',
                fontWeight: 'bold',
                pointerEvents: 'none',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
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
