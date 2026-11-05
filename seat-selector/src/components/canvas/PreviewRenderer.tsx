/**
 * PreviewRenderer Component
 *
 * Renders semi-transparent (50% opacity) icon preview at hover position on the Seat Canvas.
 * The component displays where an icon will be placed when hovered, quantized to grid centers.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 *
 * Algorithm: IconPreview
 * 1. Get current hover position (already quantized to grid centers by parent)
 * 2. Calculate pixel position from grid position using gridToPixel
 * 3. Get icon config for the selected icon
 * 4. Calculate all grid squares the icon will occupy using getGridSquaresOccupied
 * 5. Render semi-transparent (50% opacity) icon at quantized position
 * 6. Use light color overlay to indicate preview
 */

import React, { useMemo } from 'react';
import type { GridPosition } from '../../types/Seat';
import type { IconConfig } from '../../types/Icon';
import type { Guest } from '../../types/Guest';
import type { GridDimensions } from '../../utils/gridCoordinates';
import { gridToPixel } from '../../utils/gridCoordinates';
import { getGridSquaresOccupied } from '../../utils/collision';

/**
 * Props for the PreviewRenderer component
 */
export interface PreviewRendererProps {
  /** Type of preview to render: 'icon' for seat placement, 'guest' for guest assignment, or null to hide */
  type: 'icon' | 'guest' | null;

  /** Grid position where preview should be displayed (null to hide) */
  position: GridPosition | null;

  /** Opacity level for the preview (0-1, typically 0.5 for icon, 0.25-0.6 for guest) */
  opacity: number;

  /** Currently selected icon ID (required when type is 'icon') */
  selectedIconId?: string;

  /** Currently selected guest (required when type is 'guest') */
  selectedGuest?: Guest;

  /** Grid dimensions and offsets */
  gridDimensions: GridDimensions;

  /** Map of icon ID to IconConfig */
  iconConfigs?: Map<string, IconConfig>;

  /** Whether the target position is occupied (affects guest preview opacity) */
  targetOccupied?: boolean;
}

/**
 * Helper function to get rotation angle in degrees
 * Matches the SeatRenderer rotation behavior
 */
function getRotationAngle(rotation: 'left' | 'up' | 'right' | 'down'): number {
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
 * PreviewRenderer Component
 *
 * Renders a semi-transparent preview at the hover position to show where a seat or guest
 * will be placed when clicked. Supports two preview modes:
 *
 * - Icon Preview: Shows selected icon at 50% opacity when hovering over canvas
 * - Guest Preview: Shows guest's initial circle at variable opacity (25% for empty, 60% for occupied)
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  type,
  position,
  opacity,
  selectedIconId,
  selectedGuest,
  gridDimensions,
  iconConfigs,
  targetOccupied,
}) => {
  // Hide preview if no type or position
  if (!type || !position) {
    return null;
  }

  // Icon preview rendering
  if (type === 'icon' && selectedIconId && iconConfigs) {
    return (
      <IconPreview
        position={position}
        selectedIconId={selectedIconId}
        opacity={opacity}
        gridDimensions={gridDimensions}
        iconConfigs={iconConfigs}
      />
    );
  }

  // Guest preview rendering
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

/**
 * IconPreview Component
 * Renders a semi-transparent icon at the hover position
 */
const IconPreview: React.FC<{
  position: GridPosition;
  selectedIconId: string;
  opacity: number;
  gridDimensions: GridDimensions;
  iconConfigs: Map<string, IconConfig>;
}> = ({ position, selectedIconId, opacity, gridDimensions, iconConfigs }) => {
  const iconConfig = useMemo(
    () => iconConfigs.get(selectedIconId),
    [iconConfigs, selectedIconId],
  );

  if (!iconConfig) {
    return null;
  }

  // Calculate pixel position (center of the grid square)
  const { pixelX: centerPixelX, pixelY: centerPixelY } = gridToPixel(
    position,
    gridDimensions,
  );

  // Calculate top-left pixel position for the icon
  const startPixelX = centerPixelX - (iconConfig.size.width * gridDimensions.squareSize) / 2;
  const startPixelY = centerPixelY - (iconConfig.size.height * gridDimensions.squareSize) / 2;

  // Calculate width and height in pixels
  const iconWidthPixels = iconConfig.size.width * gridDimensions.squareSize;
  const iconHeightPixels = iconConfig.size.height * gridDimensions.squareSize;

  // Get rotation angle for the icon (default to 'down' for preview)
  const rotationAngle = getRotationAngle('down');

  // Calculate transform origin (center of the icon)
  const transformOriginX = centerPixelX;
  const transformOriginY = centerPixelY;

  return (
    <g className="preview-renderer preview-icon" style={{ opacity }}>
      {/* Render the preview icon */}
      <g
        className="preview-icon-group"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: `${transformOriginX}px ${transformOriginY}px`,
          willChange: 'transform',
        }}
      >
        {/* SVG icon: render inline SVG content */}
        {iconConfig.visual.type === 'svg' && (
          <svg
            x={startPixelX}
            y={startPixelY}
            width={iconWidthPixels}
            height={iconHeightPixels}
            viewBox="0 0 2.8 2.8" // Large enough to accommodate 3×1 loveseat
            preserveAspectRatio="xMidYMid meet"
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

        {/* Image icon: render as SVG image element */}
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

      {/* Render grid square outlines for visual clarity */}
      <GridSquareOutlines
        position={position}
        iconSize={iconConfig.size}
        gridDimensions={gridDimensions}
        opacity={opacity}
      />
    </g>
  );
};

/**
 * GuestPreview Component
 * Renders a semi-transparent guest circle at the hover position
 */
const GuestPreview: React.FC<{
  position: GridPosition;
  selectedGuest: Guest;
  opacity: number;
  gridDimensions: GridDimensions;
  targetOccupied?: boolean;
}> = ({ position, selectedGuest, opacity, gridDimensions, targetOccupied }) => {
  // Calculate pixel position (center of the grid square)
  const { pixelX: centerPixelX, pixelY: centerPixelY } = gridToPixel(
    position,
    gridDimensions,
  );

  // Calculate circle radius based on grid square size
  // Use 70% of square size as circle diameter for some padding
  const circleRadius = (gridDimensions.squareSize * 0.7) / 2;

  return (
    <g className="preview-renderer preview-guest" style={{ opacity }}>
      {/* Background circle */}
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

      {/* Guest initials text */}
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

      {/* Optional outline for occupied seats */}
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

/**
 * Helper component to render grid square outlines for icon preview
 * Shows which grid squares the icon will occupy
 */
const GridSquareOutlines: React.FC<{
  position: GridPosition;
  iconSize: { width: number; height: number };
  gridDimensions: GridDimensions;
  opacity: number;
}> = ({ position, iconSize, gridDimensions, opacity }) => {
  const occupiedSquares = useMemo(
    () => getGridSquaresOccupied(position, iconSize),
    [position, iconSize],
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
