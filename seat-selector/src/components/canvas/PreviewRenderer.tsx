/**
 * PreviewRenderer Component
 *
 * Renders semi-transparent (50% opacity) icon preview at hover position on the Seat Canvas.
 * The component displays where an icon will be placed when hovered, quantized to grid centers.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 */

import React, { useMemo } from 'react';
import type { GridPosition } from '../../types/Seat';
import type { IconConfig, Rotation } from '../../types/Icon';
import type { Guest } from '../../types/Guest';
import type { GridDimensions } from '../../utils/gridCoordinates';
import { gridToPixel } from '../../utils/gridCoordinates';
import { getGridSquaresOccupied } from '../../utils/collision';
import { getRotationCompensation } from '../../utils/rotationCompensation';
import { getRotatedSize } from '../../utils/rotationSize';

export interface PreviewRendererProps {
  type: 'icon' | 'guest' | null;
  position: GridPosition | null;
  opacity: number;
  selectedIconId?: string;
  selectedRotation?: Rotation;
  selectedGuest?: Guest;
  gridDimensions: GridDimensions;
  iconConfigs?: Map<string, IconConfig>;
  targetOccupied?: boolean;
}

function getRotationAngle(rotation: Rotation): number {
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



export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  type,
  position,
  opacity,
  selectedIconId,
  selectedRotation,
  selectedGuest,
  gridDimensions,
  iconConfigs,
  targetOccupied,
}) => {
  if (!type || !position) {
    return null;
  }

  if (type === 'icon' && selectedIconId && iconConfigs) {
    return (
      <IconPreview
        position={position}
        selectedIconId={selectedIconId}
        selectedRotation={selectedRotation}
        opacity={opacity}
        gridDimensions={gridDimensions}
        iconConfigs={iconConfigs}
      />
    );
  }

  if (type === 'guest' && selectedGuest) {
    return (
      <GuestPreview
        position={position}
        selectedGuest={selectedGuest}
        opacity={opacity}
        gridDimensions={gridDimensions}
        targetOccupied={targetOccupied}
      />
    );
  }

  return null;
};

const IconPreview: React.FC<{
  position: GridPosition;
  selectedIconId: string;
  selectedRotation?: Rotation;
  opacity: number;
  gridDimensions: GridDimensions;
  iconConfigs: Map<string, IconConfig>;
}> = ({ position, selectedIconId, selectedRotation = 'down', opacity, gridDimensions, iconConfigs }) => {
  const iconConfig = useMemo(
    () => iconConfigs.get(selectedIconId),
    [iconConfigs, selectedIconId],
  );

  if (!iconConfig) {
    return null;
  }

  const iconWidthPixels = iconConfig.size.width * gridDimensions.squareSize;
  const iconHeightPixels = iconConfig.size.height * gridDimensions.squareSize;

  const gridTopLeftX = position.col * gridDimensions.squareSize + gridDimensions.offsetX;
  const gridTopLeftY = position.row * gridDimensions.squareSize + gridDimensions.offsetY;

  const compensation = getRotationCompensation(iconConfig.size.width, iconConfig.size.height, selectedRotation);
  const compensationPixelsX = compensation.offsetX * gridDimensions.squareSize;
  const compensationPixelsY = compensation.offsetY * gridDimensions.squareSize;

  const startPixelX = gridTopLeftX + compensationPixelsX;
  const startPixelY = gridTopLeftY + compensationPixelsY;

  const centerPixelX = startPixelX + iconWidthPixels / 2;
  const centerPixelY = startPixelY + iconHeightPixels / 2;

  const rotationAngle = getRotationAngle(selectedRotation);
  const viewBoxString = `0 0 ${iconConfig.size.width} ${iconConfig.size.height}`;

  const rotatedSize = getRotatedSize(iconConfig.size, selectedRotation);

  return (
    <g className="preview-renderer preview-icon" style={{ opacity }}>
      <g
        className="preview-icon-group"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: `${centerPixelX}px ${centerPixelY}px`,
          willChange: 'transform',
        }}
      >
        {iconConfig.visual.type === 'svg' && (
          <svg
            x={startPixelX}
            y={startPixelY}
            width={iconWidthPixels}
            height={iconHeightPixels}
            viewBox={viewBoxString}
            preserveAspectRatio="none"
            className="preview-icon-svg"
            style={{
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
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
            x={startPixelX}
            y={startPixelY}
            width={iconWidthPixels}
            height={iconHeightPixels}
            href={iconConfig.visual.url}
            className="preview-icon-image"
            style={{
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        )}
      </g>

      <GridSquareOutlines
        position={position}
        rotatedSize={rotatedSize}
        gridDimensions={gridDimensions}
        opacity={opacity}
      />
    </g>
  );
};

const GuestPreview: React.FC<{
  position: GridPosition;
  selectedGuest: Guest;
  opacity: number;
  gridDimensions: GridDimensions;
  targetOccupied?: boolean;
}> = ({ position, selectedGuest, opacity, gridDimensions, targetOccupied }) => {
  const { pixelX: centerPixelX, pixelY: centerPixelY } = gridToPixel(
    position,
    gridDimensions,
  );

  const circleRadius = (gridDimensions.squareSize * 0.7) / 2;

  return (
    <g className="preview-renderer preview-guest" style={{ opacity }}>
      <circle
        cx={centerPixelX}
        cy={centerPixelY}
        r={circleRadius}
        fill={selectedGuest.color.hex}
        style={{
          pointerEvents: 'none',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        }}
      />

      <text
        x={centerPixelX}
        y={centerPixelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="preview-guest-initials"
        style={{
          fontSize: `${gridDimensions.squareSize * 0.4}px`,
          fill: selectedGuest.color.text === 'white' ? 'white' : '#333',
          fontWeight: 'bold',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {selectedGuest.initials}
      </text>

      {targetOccupied && (
        <circle
          cx={centerPixelX}
          cy={centerPixelY}
          r={circleRadius}
          fill="none"
          stroke="#ff9800"
          strokeWidth={2}
          strokeDasharray="4,4"
          style={{
            pointerEvents: 'none',
          }}
        />
      )}
    </g>
  );
};

const GridSquareOutlines: React.FC<{
  position: GridPosition;
  rotatedSize: { width: number; height: number };
  gridDimensions: GridDimensions;
  opacity: number;
}> = ({ position, rotatedSize, gridDimensions, opacity }) => {
  const occupiedSquares = useMemo(
    () => getGridSquaresOccupied(position, rotatedSize),
    [position, rotatedSize],
  );

  return (
    <g className="grid-square-outlines" style={{ opacity: opacity * 0.3 }}>
      {occupiedSquares.map((square) => {
        const { pixelX, pixelY } = gridToPixel(square, gridDimensions);
        const topLeftX = pixelX - gridDimensions.squareSize / 2;
        const topLeftY = pixelY - gridDimensions.squareSize / 2;

        return (
          <rect
            key={`grid-outline-${square.col}-${square.row}`}
            x={topLeftX}
            y={topLeftY}
            width={gridDimensions.squareSize}
            height={gridDimensions.squareSize}
            fill="none"
            stroke="#64B5F6"
            strokeWidth={1}
            style={{
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </g>
  );
};

export default PreviewRenderer;
