import React, { useMemo } from 'react';
import type { IconConfig } from '../types/Icon';
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
 * Supports both SVG icons (inline) and image icons (PNG, JPG from CDN).
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
 * - Support for both SVG and image icons
 *
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 *
 * @example
 * ```tsx
 * const icons = [
 *   { id: 'chair-1', capacity: 1, name: 'Chair', visual: { type: 'svg', content: '...' } },
 *   { id: 'table-4', capacity: 0, name: 'Round Table', visual: { type: 'image', url: 'https://...' } }
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

          return (
            <div
              key={icon.id}
              className={`icon-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleIconClick(icon.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="button"
              tabIndex={isSelected ? 0 : -1}
              aria-pressed={isSelected}
              aria-label={`${icon.name} - ${getCapacityLabel(icon.capacity)}`}
              title={`${icon.name}\n${getCapacityLabel(icon.capacity)}`}
            >
              <div
                className="icon-display"
                style={{
                  backgroundColor: icon.color,
                  width: `${icon.size.width * 30}px`,
                  height: `${icon.size.height * 30}px`,
                }}
              >
                {/* SVG icon display */}
                {icon.visual.type === 'svg' && (
                  <svg
                    viewBox="0 0 2 2"
                    className="icon-svg"
                    dangerouslySetInnerHTML={{ __html: icon.visual.content }}
                  />
                )}

                {/* Image icon display */}
                {icon.visual.type === 'image' && (
                  <img
                    src={icon.visual.url}
                    alt={icon.name}
                    className="icon-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
              <div className="icon-label">{getCapacityLabel(icon.capacity)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IconBank;
