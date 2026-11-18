import React, { useMemo } from 'react';
import type { IconConfig } from '../types/Icon';
import { GRID_SQUARE_SIZE_PX } from '../constants/gridConstants';
import './IconBank.css';

/**
 * Props for the IconBank component
 */
export interface IconBankProps {
  /** Array of available icons to display */
  icons: IconConfig[];

  /** ID of the currently selected icon */
  selectedIconId: string;

  /** Callback when an icon is clicked/selected */
  onSelectIcon: (iconId: string) => void;

  /** Optional callback for rotation (not used in this component) */
  onRotate?: (rotation: string) => void;
}

/**
 * IconBank Component
 *
 * Displays available seat icons organized by seating capacity in a 2-column grid layout.
 * Icons are sorted by ascending capacity (0-person table first, then 1-person chair, etc.).
 * Each icon displays its capacity label and is highlighted when selected.
 * 
 * Uses the same stretched rendering logic as the canvas (SVG image element with 
 * preserveAspectRatio="none") to ensure visual consistency across the application.
 *
 * Features:
 * - 2-column grid layout with automatic row calculation
 * - Icons sorted by seating capacity (ascending)
 * - Visual highlight on selected icon
 * - Capacity label displayed below each icon
 * - Scrollable container for many icons
 * - Responsive sizing based on parent container width
 * - Keyboard navigation support (arrow keys)
 * - Accessible ARIA labels
 * - Same stretched rendering as canvas for consistency
 * - Uses same grid size (GRID_SQUARE_SIZE_PX) as canvas
 *
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 *
 * @example
 * ```tsx
 * const icons = [
 *   { id: 'chair-1', capacity: 1, name: 'Chair', visual: { type: 'image', url: '/icons/chair-1.svg' } },
 *   { id: 'table-4', capacity: 0, name: 'Round Table', visual: { type: 'image', url: '/icons/table-round-4.svg' } }
 * ];
 *
 * <IconBank
 *   icons={icons}
 *   selectedIconId="chair-1"
 *   onSelectIcon={(id) => console.log('Selected:', id)}
 * />
 * ```
 */
export const IconBank: React.FC<IconBankProps> = ({
  icons,
  selectedIconId,
  onSelectIcon,
}) => {
  // Sort icons by capacity (ascending) for consistent display order
  const sortedIcons = useMemo(() => {
    return [...icons].sort((a, b) => a.capacity - b.capacity);
  }, [icons]);

  const handleIconClick = (iconId: string) => {
    onSelectIcon(iconId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const iconCount = sortedIcons.length;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % iconCount;
      onSelectIcon(sortedIcons[nextIndex].id);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + iconCount) % iconCount;
      onSelectIcon(sortedIcons[prevIndex].id);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectIcon(sortedIcons[index].id);
    }
  };

  const getCapacityLabel = (capacity: number): string => {
    if (capacity === 0) {
      return 'Table';
    }
    return `Capacity: ${capacity}`;
  };

  return (
    <div className="icon-bank" role="region" aria-label="Available seat icons">
      <div className="icon-bank-grid">
        {sortedIcons.map((icon, index) => {
          const isSelected = icon.id === selectedIconId;
          // Use same grid size as canvas for visual consistency
          const iconWidthPixels = icon.size.width * GRID_SQUARE_SIZE_PX;
          const iconHeightPixels = icon.size.height * GRID_SQUARE_SIZE_PX;

          return (
            <div
              key={icon.id}
              className={`icon-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleIconClick(icon.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={isSelected ? 0 : -1}
              role="button"
              aria-pressed={isSelected}
              aria-label={`${icon.name} - ${getCapacityLabel(icon.capacity)}`}
              title={`${icon.name}\n${getCapacityLabel(icon.capacity)}`}
            >
              <div className="icon-button-content">
                <div
                  className="icon-display"
                >
                  {/* Render icon using SVG image element with same stretching logic as canvas */}
                  <svg
                    width={iconWidthPixels}
                    height={iconHeightPixels}
                    viewBox={`0 0 ${icon.size.width} ${icon.size.height}`}
                    preserveAspectRatio="none"
                    style={{
                      display: 'block',
                    }}
                  >
                    <image
                      preserveAspectRatio="none"
                      x="0"
                      y="0"
                      width={icon.size.width}
                      height={icon.size.height}
                      href={icon.visual.type === 'image' ? icon.visual.url : undefined}
                    />
                  </svg>
                </div>
                <div className="icon-label">{getCapacityLabel(icon.capacity)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IconBank;
