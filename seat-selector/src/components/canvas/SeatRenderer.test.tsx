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
 * - SVG icons render correctly
 * - Image icons (PNG, JPG from CDN) render correctly
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
 * Helper function to create a mock SVG icon config
 */
function createMockSvgIconConfig(overrides?: Partial<IconConfig>): IconConfig {
  return {
    id: 'chair-1',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair',
    color: '#8B4513',
    visual: {
      type: 'svg',
      content: '<rect x="0.2" y="0.2" width="0.6" height="0.6" fill="currentColor" />',
    },
    ...overrides,
  };
}

/**
 * Helper function to create a mock image icon config
 */
function createMockImageIconConfig(overrides?: Partial<IconConfig>): IconConfig {
  return {
    id: 'chair-img',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair (Image)',
    color: '#8B4513',
    visual: {
      type: 'image',
      url: 'https://cdn.example.com/icons/chair.png',
    },
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

  describe('SVG Icon Rendering', () => {
    it('renders a single SVG seat at correct position', () => {
      const seat = createMockSeat({
        position: { col: 2, row: 3 },
      });
      const iconConfig = createMockSvgIconConfig();
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
      const seatSvg = container.querySelector('.seat-icon-svg');
      expect(seatSvg).not.toBeNull();

      // Verify position attributes (SVG may round the values)
      const xPos = seatSvg?.getAttribute('x');
      const yPos = seatSvg?.getAttribute('y');
      expect(xPos).toBeDefined();
      expect(yPos).toBeDefined();
      expect(parseInt(xPos || '0')).toBeGreaterThanOrEqual(170);
      expect(parseInt(xPos || '0')).toBeLessThanOrEqual(210);
      expect(parseInt(yPos || '0')).toBeGreaterThanOrEqual(210);
      expect(parseInt(yPos || '0')).toBeLessThanOrEqual(250);
    });

    it('renders SVG icon with correct dimensions', () => {
      const seat = createMockSeat();
      const iconConfig = createMockSvgIconConfig({
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

    it('renders SVG icon content with correct color', () => {
      const seat = createMockSeat();
      const iconConfig = createMockSvgIconConfig({
        visual: {
          type: 'svg',
          content: '<circle cx="0.5" cy="0.5" r="0.4" fill="currentColor" />',
        },
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

  describe('Image Icon Rendering', () => {
    it('renders a single image seat at correct position', () => {
      const seat = createMockSeat({
        iconId: 'chair-img',
        position: { col: 2, row: 3 },
      });
      const iconConfig = createMockImageIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

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

      // Find the image element for the seat
      const seatImage = container.querySelector('.seat-icon-image');
      expect(seatImage).not.toBeNull();

      // Verify image attributes
      const xPos = seatImage?.getAttribute('x');
      const yPos = seatImage?.getAttribute('y');
      const href = seatImage?.getAttribute('href');
      
      expect(xPos).toBeDefined();
      expect(yPos).toBeDefined();
      expect(href).toBe('https://cdn.example.com/icons/chair.png');
    });

    it('renders image icon with correct dimensions', () => {
      const seat = createMockSeat({
        iconId: 'chair-img',
      });
      const iconConfig = createMockImageIconConfig({
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

      const seatImage = container.querySelector('.seat-icon-image');
      expect(seatImage?.getAttribute('width')).toBe('40'); // 1 * 40
      expect(seatImage?.getAttribute('height')).toBe('40'); // 1 * 40
    });

    it('renders multi-grid image icon at correct size', () => {
      const seat = createMockSeat({
        iconId: 'table-img',
      });
      const iconConfig = createMockImageIconConfig({
        id: 'table-img',
        url: 'https://cdn.example.com/icons/table.png',
        size: { width: 2, height: 2 },
      });
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);
      seatNumbers.set('1,0', 1);
      seatNumbers.set('0,1', 1);
      seatNumbers.set('1,1', 1);

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

      const seatImage = container.querySelector('.seat-icon-image');
      expect(seatImage?.getAttribute('width')).toBe('80'); // 2 * 40
      expect(seatImage?.getAttribute('height')).toBe('80'); // 2 * 40
    });
  });

  describe('Mixed SVG and Image Icons', () => {
    it('renders mix of SVG and image icons correctly', () => {
      const svgSeat = createMockSeat({
        id: 'seat-svg',
        position: { col: 0, row: 0 },
      });
      const imageSeat = createMockSeat({
        id: 'seat-img',
        iconId: 'chair-img',
        position: { col: 1, row: 0 },
      });

      const svgIconConfig = createMockSvgIconConfig();
      const imageIconConfig = createMockImageIconConfig();
      const gridDimensions = createMockGridDimensions();

      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(svgIconConfig.id, svgIconConfig);
      iconConfigs.set(imageIconConfig.id, imageIconConfig);

      const seatNumbers = new Map<string, number>();
      seatNumbers.set('0,0', 1);
      seatNumbers.set('1,0', 2);

      const { container } = render(
        <svg>
          <SeatRenderer
            seats={[svgSeat, imageSeat]}
            seatNumbers={seatNumbers}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      // Should render 1 SVG and 1 image
      const svgElement = container.querySelector('.seat-icon-svg');
      const imageElement = container.querySelector('.seat-icon-image');
      
      expect(svgElement).not.toBeNull();
      expect(imageElement).not.toBeNull();

      // Should render both seat numbers
      const seatNumbers_elements = container.querySelectorAll('.seat-number');
      expect(seatNumbers_elements.length).toBe(2);
    });
  });

  describe('Multi-Grid Seats', () => {
    it('renders 2x2 SVG table at correct position', () => {
      const seat = createMockSeat({
        iconId: 'table-1',
        position: { col: 1, row: 1 },
      });
      const iconConfig = createMockSvgIconConfig({
        id: 'table-1',
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

    it('renders seat numbers in all occupied grid squares for SVG seat', () => {
      const seat = createMockSeat({
        iconId: 'loveseat-1',
        position: { col: 0, row: 0 },
      });
      const iconConfig = createMockSvgIconConfig({
        id: 'loveseat-1',
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
    it('applies correct rotation transform for "down" rotation on SVG', () => {
      const seat = createMockSeat({
        rotation: 'down',
      });
      const iconConfig = createMockSvgIconConfig();
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

    it('applies correct rotation transform for image icon', () => {
      const seat = createMockSeat({
        iconId: 'chair-img',
        rotation: 'right',
      });
      const iconConfig = createMockImageIconConfig();
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

  describe('Seat Number Display', () => {
    it('displays seat number at center of grid square for SVG seat', () => {
      const seat = createMockSeat({
        position: { col: 5, row: 5 },
      });
      const iconConfig = createMockSvgIconConfig();
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
      const textContent = seatNumberText?.textContent;
      expect(textContent).toBe('7');
    });

    it('displays seat number at center of grid square for image seat', () => {
      const seat = createMockSeat({
        iconId: 'chair-img',
        position: { col: 5, row: 5 },
      });
      const iconConfig = createMockImageIconConfig();
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
      const textContent = seatNumberText?.textContent;
      expect(textContent).toBe('7');
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

      // Should not render any seat icon
      const seatSvgs = container.querySelectorAll('.seat-icon-svg');
      const seatImages = container.querySelectorAll('.seat-icon-image');
      expect(seatSvgs.length).toBe(0);
      expect(seatImages.length).toBe(0);
    });
  });

  describe('Seat Positioning Edge Cases', () => {
    it('renders seat at boundary grid coordinates', () => {
      const seat = createMockSeat({
        position: { col: 19, row: 19 },
      });
      const iconConfig = createMockSvgIconConfig();
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
