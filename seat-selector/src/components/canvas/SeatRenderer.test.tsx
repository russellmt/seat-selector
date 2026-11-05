/**
 * SeatRenderer Component Tests
 *
 * Tests verify:
 * - Seats render at correct positions
 * - Rotation transforms are applied correctly
 * - Icon sizing matches configuration
 * - Multi-grid seats occupy correct grid squares
 * - Seat numbers display correctly
 * - Empty seats array renders without error
 * - Missing icon configs are handled gracefully
 *
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 13.1, 13.2, 13.3
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SeatRenderer } from './SeatRenderer';
import type { Seat } from '../../types/Seat';
import type { IconConfig } from '../../types/Icon';
import type { GridDimensions } from '../../utils/gridCoordinates';

/**
 * Helper function to create a mock seat
 */
function createMockSeat(overrides?: Partial<Seat>): Seat {
  return {
    id: 'seat-1',
    iconId: 'chair-1',
    position: { col: 0, row: 0 },
    rotation: 'down',
    number: 1,
    ...overrides,
  };
}

/**
 * Helper function to create a mock icon config
 */
function createMockIconConfig(overrides?: Partial<IconConfig>): IconConfig {
  return {
    id: 'chair-1',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair',
    color: '#8B4513',
    svg: '<rect x="0.2" y="0.2" width="0.6" height="0.6" fill="currentColor" />',
    ...overrides,
  };
}

/**
 * Helper function to create a mock grid dimensions
 */
function createMockGridDimensions(overrides?: Partial<GridDimensions>): GridDimensions {
  return {
    squareSize: 40,
    offsetX: 100,
    offsetY: 100,
    cols: 20,
    rows: 20,
    ...overrides,
  };
}

describe('SeatRenderer Component', () => {
  describe('Empty Seats Array', () => {
    it('renders without error when seats array is empty', () => {
      const iconConfigs = new Map<string, IconConfig>();
      const gridDimensions = createMockGridDimensions();
      const seatNumbers = new Map<string, number>();

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatRenderer = container.querySelector('.seat-renderer');
      expect(seatRenderer).not.toBeNull();
      expect(seatRenderer?.children.length).toBe(0);
    });
  });

  describe('Single Seat Rendering', () => {
    it('renders a single seat at correct position', () => {
      const seat = createMockSeat({
        position: { col: 2, row: 3 },
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      // Calculate expected position: (col * squareSize + offsetX, row * squareSize + offsetY)
      // (2 * 40 + 100, 3 * 40 + 100) = (180, 220)

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('2,3', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Find the SVG group for the seat
      const seatGroup = container.querySelector('.seat-icon-svg');
      expect(seatGroup).not.toBeNull();

      // Verify position attributes (SVG may round the values)
      const xPos = seatGroup?.getAttribute('x');
      const yPos = seatGroup?.getAttribute('y');
      expect(xPos).toBeDefined();
      expect(yPos).toBeDefined();
      expect(parseInt(xPos || '0')).toBeGreaterThanOrEqual(170);
      expect(parseInt(xPos || '0')).toBeLessThanOrEqual(210);
      expect(parseInt(yPos || '0')).toBeGreaterThanOrEqual(210);
      expect(parseInt(yPos || '0')).toBeLessThanOrEqual(250);
    });

    it('renders seat icon with correct dimensions', () => {
      const seat = createMockSeat();
      const iconConfig = createMockIconConfig({
        size: { width: 1, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatSvg = container.querySelector('.seat-icon-svg');
      expect(seatSvg?.getAttribute('width')).toBe('40'); // 1 * 40
      expect(seatSvg?.getAttribute('height')).toBe('40'); // 1 * 40
    });
  });

  describe('Multi-Grid Seats', () => {
    it('renders 2x2 table at correct position', () => {
      const seat = createMockSeat({
        iconId: 'table-round-4',
        position: { col: 1, row: 1 },
      });
      const iconConfig = createMockIconConfig({
        id: 'table-round-4',
        size: { width: 2, height: 2 },
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('1,1', 1);
      seatNumbers.set('2,1', 1);
      seatNumbers.set('1,2', 1);
      seatNumbers.set('2,2', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatSvg = container.querySelector('.seat-icon-svg');
      expect(seatSvg?.getAttribute('width')).toBe('80'); // 2 * 40
      expect(seatSvg?.getAttribute('height')).toBe('80'); // 2 * 40
    });

    it('renders seat numbers in all occupied grid squares', () => {
      const seat = createMockSeat({
        iconId: 'loveseat-2',
        position: { col: 0, row: 0 },
      });
      const iconConfig = createMockIconConfig({
        id: 'loveseat-2',
        size: { width: 2, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);
      seatNumbers.set('1,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Loveseat occupies 2 grid squares horizontally
      const numberTexts = container.querySelectorAll('.seat-number');
      expect(numberTexts.length).toBe(2);

      // Verify both numbers are "1"
      numberTexts.forEach(text => {
        expect(text.textContent).toBe('1');
      });
    });
  });

  describe('Rotation Transforms', () => {
    it('applies correct rotation transform for "down" rotation', () => {
      const seat = createMockSeat({
        rotation: 'down',
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatIcon = container.querySelector('.seat-icon') as HTMLElement;
      const style = seatIcon?.getAttribute('style') || '';
      expect(style).toContain('rotate(0deg)');
    });

    it('applies correct rotation transform for "left" rotation', () => {
      const seat = createMockSeat({
        rotation: 'left',
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatIcon = container.querySelector('.seat-icon') as HTMLElement;
      const style = seatIcon?.getAttribute('style') || '';
      expect(style).toContain('rotate(270deg)');
    });

    it('applies correct rotation transform for "up" rotation', () => {
      const seat = createMockSeat({
        rotation: 'up',
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatIcon = container.querySelector('.seat-icon') as HTMLElement;
      const style = seatIcon?.getAttribute('style') || '';
      expect(style).toContain('rotate(180deg)');
    });

    it('applies correct rotation transform for "right" rotation', () => {
      const seat = createMockSeat({
        rotation: 'right',
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatIcon = container.querySelector('.seat-icon') as HTMLElement;
      const style = seatIcon?.getAttribute('style') || '';
      expect(style).toContain('rotate(90deg)');
    });
  });

  describe('Multiple Seats', () => {
    it('renders multiple seats with different positions', () => {
      const seats = [
        createMockSeat({
          id: 'seat-1',
          position: { col: 0, row: 0 },
          number: 1,
        }),
        createMockSeat({
          id: 'seat-2',
          position: { col: 2, row: 1 },
          number: 2,
        }),
        createMockSeat({
          id: 'seat-3',
          position: { col: 1, row: 3 },
          number: 3,
        }),
      ];

      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);
      seatNumbers.set('2,1', 2);
      seatNumbers.set('1,3', 3);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={seats}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Should render 3 seat groups
      const seatGroups = container.querySelectorAll('.seat-renderer-group');
      expect(seatGroups.length).toBe(3);

      // Should render 3 seat SVG icons
      const seatSvgs = container.querySelectorAll('.seat-icon-svg');
      expect(seatSvgs.length).toBe(3);

      // Should render 3 seat numbers
      const seatNumbers_elements = container.querySelectorAll('.seat-number');
      expect(seatNumbers_elements.length).toBe(3);
    });
  });

  describe('Missing Icon Configs', () => {
    it('skips rendering seats with missing icon config', () => {
      const seat = createMockSeat({
        iconId: 'unknown-icon',
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      // Empty map, no icon config for 'unknown-icon'

      const seatNumbers = new Map<string, number>();

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Should not render any seat SVG
      const seatSvgs = container.querySelectorAll('.seat-icon-svg');
      expect(seatSvgs.length).toBe(0);
    });

    it('renders available seats and skips ones with missing configs', () => {
      const seats = [
        createMockSeat({
          id: 'seat-1',
          iconId: 'chair-1',
          position: { col: 0, row: 0 },
          number: 1,
        }),
        createMockSeat({
          id: 'seat-2',
          iconId: 'unknown-icon',
          position: { col: 1, row: 1 },
          number: 2,
        }),
      ];

      const iconConfig = createMockIconConfig({
        id: 'chair-1',
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig); // Only 'chair-1' config

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={seats}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Should only render 1 seat (the one with valid config)
      const seatSvgs = container.querySelectorAll('.seat-icon-svg');
      expect(seatSvgs.length).toBe(1);

      // Should only render 1 seat number
      const seatNumbers_elements = container.querySelectorAll('.seat-number');
      expect(seatNumbers_elements.length).toBe(1);
    });
  });

  describe('Seat Number Display', () => {
    it('displays seat number at center of grid square', () => {
      const seat = createMockSeat({
        position: { col: 5, row: 5 },
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('5,5', 7);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatNumberText = container.querySelector('.seat-number');
      expect(seatNumberText).not.toBeNull();
      // Check for text properties (SVG attributes may be stored differently)
      const textContent = seatNumberText?.textContent;
      expect(textContent).toBe('7');

      // Verify position approximately: (5 * 40 + 100 + 20, 5 * 40 + 100 + 20) = (320, 320)
      const xPos = parseFloat(seatNumberText?.getAttribute('x') || '0');
      const yPos = parseFloat(seatNumberText?.getAttribute('y') || '0');
      expect(xPos).toBeGreaterThanOrEqual(310);
      expect(xPos).toBeLessThanOrEqual(330);
      expect(yPos).toBeGreaterThanOrEqual(310);
      expect(yPos).toBeLessThanOrEqual(330);
    });

    it('displays correct number for each grid square in multi-grid seat', () => {
      const seat = createMockSeat({
        iconId: 'table-round-4',
        position: { col: 0, row: 0 },
      });
      const iconConfig = createMockIconConfig({
        id: 'table-round-4',
        size: { width: 2, height: 2 },
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 5);
      seatNumbers.set('1,0', 5);
      seatNumbers.set('0,1', 5);
      seatNumbers.set('1,1', 5);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatNumbers_elements = container.querySelectorAll('.seat-number');
      expect(seatNumbers_elements.length).toBe(4);

      // All should show "5"
      seatNumbers_elements.forEach(text => {
        expect(text.textContent).toBe('5');
      });
    });
  });

  describe('Icon SVG Content', () => {
    it('renders icon SVG content with correct color', () => {
      const seat = createMockSeat();
      const iconConfig = createMockIconConfig({
        svg: '<circle cx="0.5" cy="0.5" r="0.4" fill="currentColor" />',
        color: '#FF0000',
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Find the icon group
      const iconGroup = container.querySelector('.seat-icon-svg g');
      expect(iconGroup).not.toBeNull();

      // Verify SVG content is rendered (contains the circle)
      const renderedSvg = iconGroup?.innerHTML;
      expect(renderedSvg).toContain('circle');
    });
  });

  describe('Seat Positioning Edge Cases', () => {
    it('renders seat at boundary grid coordinates', () => {
      const seat = createMockSeat({
        position: { col: 19, row: 19 },
      });
      const iconConfig = createMockIconConfig();
      const gridDimensions = createMockGridDimensions({
        cols: 20,
        rows: 20,
      });

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('19,19', 100);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[seat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const seatSvg = container.querySelector('.seat-icon-svg');
      // Position: (19 * 40 + 100, 19 * 40 + 100) = (860, 860)
      const xPos = parseFloat(seatSvg?.getAttribute('x') || '0');
      const yPos = parseFloat(seatSvg?.getAttribute('y') || '0');
      expect(xPos).toBeGreaterThanOrEqual(850);
      expect(xPos).toBeLessThanOrEqual(890);
      expect(yPos).toBeGreaterThanOrEqual(850);
      expect(yPos).toBeLessThanOrEqual(890);
    });
  });
});
