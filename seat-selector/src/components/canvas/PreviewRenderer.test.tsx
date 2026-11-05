/**
 * PreviewRenderer Component Tests
 *
 * Tests verify:
 * - Icon preview renders at correct position with 50% opacity
 * - Icon preview is quantized to grid centers
 * - Guest preview renders at correct position
 * - Guest preview opacity varies based on target occupancy
 * - Preview hides when type is null or position is null
 * - Multi-grid icons show grid outlines
 * - SVG and image icons render as previews
 * - Guest initials display correctly
 * - Guest color applies correctly
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PreviewRenderer } from './PreviewRenderer';
import type { Guest } from '../../types/Guest';
import type { IconConfig } from '../../types/Icon';
import type { GridDimensions } from '../../utils/gridCoordinates';
import type { Color } from '../../types/Color';

/**
 * Helper function to create a mock icon config with SVG
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
 * Helper function to create a mock icon config with image
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

/**
 * Helper function to create a mock color
 */
function createMockColor(overrides?: Partial<Color>): Color {
  return {
    hex: '#FF6B6B',
    rgb: { r: 255, g: 107, b: 107 },
    text: 'white',
    ...overrides,
  };
}

/**
 * Helper function to create a mock guest
 */
function createMockGuest(overrides?: Partial<Guest>): Guest {
  return {
    id: 'guest-1',
    name: 'John Smith',
    initials: 'JS',
    colorSeed: 'John Smith',
    color: createMockColor(),
    ...overrides,
  };
}

describe('PreviewRenderer Component', () => {
  describe('Visibility Control', () => {
    it('does not render when type is null', () => {
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set('chair-1', createMockSvgIconConfig());

      const { container } = render(
        <svg>
          <PreviewRenderer
            type={null}
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-renderer');
      expect(preview).toBeNull();
    });

    it('does not render when position is null', () => {
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set('chair-1', createMockSvgIconConfig());

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={null}
            opacity={0.5}
            selectedIconId="chair-1"
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-renderer');
      expect(preview).toBeNull();
    });

    it('does not render when both type and position are null', () => {
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type={null}
            position={null}
            opacity={0.5}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-renderer');
      expect(preview).toBeNull();
    });
  });

  describe('Icon Preview Rendering', () => {
    it('renders icon preview at correct position', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon).not.toBeNull();

      // Verify position is calculated correctly
      // Center at (5 * 40 + 100 + 20, 5 * 40 + 100 + 20) = (340, 340)
      // Top-left: (340 - 20, 340 - 20) = (300, 300)
      const xPos = parseFloat(previewIcon?.getAttribute('x') || '0');
      const yPos = parseFloat(previewIcon?.getAttribute('y') || '0');
      expect(xPos).toBeGreaterThanOrEqual(290);
      expect(xPos).toBeLessThanOrEqual(310);
      expect(yPos).toBeGreaterThanOrEqual(290);
      expect(yPos).toBeLessThanOrEqual(310);
    });

    it('renders icon preview with 50% opacity', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-icon') as HTMLElement;
      const style = preview?.getAttribute('style');
      expect(style).toContain('opacity');
    });

    it('renders SVG icon preview with correct dimensions', () => {
      const iconConfig = createMockSvgIconConfig({
        size: { width: 1, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 0, row: 0 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon?.getAttribute('width')).toBe('40'); // 1 * 40
      expect(previewIcon?.getAttribute('height')).toBe('40'); // 1 * 40
    });

    it('renders image icon preview with correct dimensions', () => {
      const iconConfig = createMockImageIconConfig({
        size: { width: 1, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 0, row: 0 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewImage = container.querySelector('.preview-icon-image');
      expect(previewImage?.getAttribute('width')).toBe('40'); // 1 * 40
      expect(previewImage?.getAttribute('height')).toBe('40'); // 1 * 40
      expect(previewImage?.getAttribute('href')).toBe(
        'https://cdn.example.com/icons/chair.png',
      );
    });

    it('renders multi-grid icon preview at correct size', () => {
      const iconConfig = createMockSvgIconConfig({
        size: { width: 2, height: 2 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 0, row: 0 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon?.getAttribute('width')).toBe('80'); // 2 * 40
      expect(previewIcon?.getAttribute('height')).toBe('80'); // 2 * 40
    });

    it('does not render icon preview when icon config not found', () => {
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      // No icon config provided

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId="unknown-icon"
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-renderer');
      expect(preview).toBeNull();
    });

    it('renders grid square outlines for multi-grid icon preview', () => {
      const iconConfig = createMockSvgIconConfig({
        size: { width: 2, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const gridOutlines = container.querySelectorAll('.grid-square-outlines rect');
      // 2x1 icon occupies 2 grid squares
      expect(gridOutlines.length).toBe(2);
    });

    it('renders grid outlines at correct positions', () => {
      const iconConfig = createMockSvgIconConfig({
        size: { width: 2, height: 2 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 0, row: 0 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const gridRects = container.querySelectorAll('.grid-square-outlines rect');
      // 2x2 icon occupies 4 grid squares
      expect(gridRects.length).toBe(4);
    });
  });

  describe('Guest Preview Rendering', () => {
    it('renders guest preview circle at correct position', () => {
      const guest = createMockGuest();
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const previewCircle = container.querySelector('.preview-guest circle');
      expect(previewCircle).not.toBeNull();

      // Center should be at (5 * 40 + 100 + 20, 5 * 40 + 100 + 20) = (340, 340)
      const cx = parseFloat(previewCircle?.getAttribute('cx') || '0');
      const cy = parseFloat(previewCircle?.getAttribute('cy') || '0');
      expect(cx).toBeGreaterThanOrEqual(315);
      expect(cx).toBeLessThanOrEqual(345);
      expect(cy).toBeGreaterThanOrEqual(315);
      expect(cy).toBeLessThanOrEqual(345);
    });

    it('renders guest preview circle with guest color', () => {
      const guest = createMockGuest({
        color: createMockColor({
          hex: '#00FF00',
        }),
      });
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const previewCircle = container.querySelector('.preview-guest circle');
      expect(previewCircle?.getAttribute('fill')).toBe('#00FF00');
    });

    it('renders guest initials inside circle', () => {
      const guest = createMockGuest({
        name: 'John Smith',
        initials: 'JS',
      });
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const initialsText = container.querySelector('.preview-guest-initials');
      expect(initialsText?.textContent).toBe('JS');
    });

    it('renders guest initials with correct text color for white text', () => {
      const guest = createMockGuest({
        color: createMockColor({
          text: 'white',
        }),
      });
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const initialsText = container.querySelector('.preview-guest-initials') as HTMLElement;
      const style = initialsText?.getAttribute('style') || '';
      expect(style).toContain('white');
    });

    it('renders guest initials with correct text color for black text', () => {
      const guest = createMockGuest({
        color: createMockColor({
          text: 'black',
        }),
      });
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const initialsText = container.querySelector('.preview-guest-initials') as HTMLElement;
      const style = initialsText?.getAttribute('style') || '';
      expect(style).toContain('#333');
    });

    it('renders occupied seat indicator for guest preview when target is occupied', () => {
      const guest = createMockGuest();
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.6}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
            targetOccupied={true}
          />
        </svg>,
      );

      const occupiedIndicator = container.querySelector('.preview-guest circle:last-child');
      expect(occupiedIndicator).not.toBeNull();
      // Should have stroke for occupied indicator
      expect(occupiedIndicator?.getAttribute('stroke')).toBe('#ff9800');
    });

    it('does not render occupied indicator when target is not occupied', () => {
      const guest = createMockGuest();
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
            targetOccupied={false}
          />
        </svg>,
      );

      const circles = container.querySelectorAll('.preview-guest circle');
      // Should only have 1 circle (the guest circle), no occupied indicator
      expect(circles.length).toBe(1);
    });
  });

  describe('Opacity Handling', () => {
    it('applies opacity prop to icon preview', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-icon');
      const style = preview?.getAttribute('style');
      expect(style).toContain('0.5');
    });

    it('applies opacity prop to guest preview', () => {
      const guest = createMockGuest();
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const preview = container.querySelector('.preview-guest');
      const style = preview?.getAttribute('style');
      expect(style).toContain('0.25');
    });

    it('handles varying opacity values', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const opacityValues = [0.1, 0.3, 0.5, 0.7, 0.9];

      opacityValues.forEach((opacityValue) => {
        const { container } = render(
          <svg>
            <PreviewRenderer
              type="icon"
              position={{ col: 5, row: 5 }}
              opacity={opacityValue}
              selectedIconId={iconConfig.id}
              gridDimensions={gridDimensions}
              iconConfigs={iconConfigs}
            />
          </svg>,
        );

        const preview = container.querySelector('.preview-icon') as HTMLElement;
        const style = preview?.getAttribute('style') || '';
        expect(style).toContain(opacityValue.toString());
      });
    });
  });

  describe('Quantization to Grid', () => {
    it('places icon preview quantized to grid center', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions({
        squareSize: 40,
        offsetX: 100,
        offsetY: 100,
      });
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      // Position (3, 3) should be at: (3 * 40 + 100 + 20, 3 * 40 + 100 + 20) = (240, 240)
      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 3, row: 3 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      const xPos = parseFloat(previewIcon?.getAttribute('x') || '0');
      const yPos = parseFloat(previewIcon?.getAttribute('y') || '0');

      // Top-left should be around (240 - 20, 240 - 20) = (220, 220)
      expect(xPos).toBeGreaterThanOrEqual(210);
      expect(xPos).toBeLessThanOrEqual(230);
      expect(yPos).toBeGreaterThanOrEqual(210);
      expect(yPos).toBeLessThanOrEqual(230);
    });

    it('places guest preview quantized to grid center', () => {
      const guest = createMockGuest();
      const gridDimensions = createMockGridDimensions({
        squareSize: 40,
        offsetX: 100,
        offsetY: 100,
      });

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 3, row: 3 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const circle = container.querySelector('.preview-guest circle:first-child');
      const cx = parseFloat(circle?.getAttribute('cx') || '0');
      const cy = parseFloat(circle?.getAttribute('cy') || '0');

      // Center should be around (3 * 40 + 100 + 20, 3 * 40 + 100 + 20) = (240, 240)
      expect(cx).toBeGreaterThanOrEqual(235);
      expect(cx).toBeLessThanOrEqual(245);
      expect(cy).toBeGreaterThanOrEqual(235);
      expect(cy).toBeLessThanOrEqual(245);
    });
  });

  describe('Edge Cases', () => {
    it('handles grid position at (0, 0)', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 0, row: 0 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon).not.toBeNull();
    });

    it('handles large grid offset', () => {
      const iconConfig = createMockSvgIconConfig();
      const gridDimensions = createMockGridDimensions({
        offsetX: 500,
        offsetY: 500,
      });
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      const xPos = parseFloat(previewIcon?.getAttribute('x') || '0');
      const yPos = parseFloat(previewIcon?.getAttribute('y') || '0');

      // Center: (5 * 40 + 500 + 20, 5 * 40 + 500 + 20) = (720, 720)
      // Top-left: (720 - 20, 720 - 20) = (700, 700)
      expect(xPos).toBeGreaterThanOrEqual(690);
      expect(xPos).toBeLessThanOrEqual(710);
      expect(yPos).toBeGreaterThanOrEqual(690);
      expect(yPos).toBeLessThanOrEqual(710);
    });

    it('renders guest with single letter initial', () => {
      const guest = createMockGuest({
        name: 'Adam',
        initials: 'A',
      });
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const initialsText = container.querySelector('.preview-guest-initials');
      expect(initialsText?.textContent).toBe('A');
    });

    it('renders guest with two letter initial', () => {
      const guest = createMockGuest({
        name: 'Anna Marie',
        initials: 'AM',
      });
      const gridDimensions = createMockGridDimensions();

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="guest"
            position={{ col: 5, row: 5 }}
            opacity={0.25}
            selectedGuest={guest}
            gridDimensions={gridDimensions}
          />
        </svg>,
      );

      const initialsText = container.querySelector('.preview-guest-initials');
      expect(initialsText?.textContent).toBe('AM');
    });
  });

  describe('Icon Preview with Different Sizes', () => {
    it('renders 1x1 icon preview', () => {
      const iconConfig = createMockSvgIconConfig({
        size: { width: 1, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon?.getAttribute('width')).toBe('40');
      expect(previewIcon?.getAttribute('height')).toBe('40');
    });

    it('renders 2x1 loveseat icon preview', () => {
      const iconConfig = createMockSvgIconConfig({
        id: 'loveseat-1',
        size: { width: 2, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon?.getAttribute('width')).toBe('80');
      expect(previewIcon?.getAttribute('height')).toBe('40');
    });

    it('renders 3x1 couch icon preview', () => {
      const iconConfig = createMockSvgIconConfig({
        id: 'couch-1',
        size: { width: 3, height: 1 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon?.getAttribute('width')).toBe('120');
      expect(previewIcon?.getAttribute('height')).toBe('40');
    });

    it('renders 2x2 table icon preview', () => {
      const iconConfig = createMockSvgIconConfig({
        id: 'table-1',
        size: { width: 2, height: 2 },
      });
      const gridDimensions = createMockGridDimensions();
      const iconConfigs = new Map<string, IconConfig>();
      iconConfigs.set(iconConfig.id, iconConfig);

      const { container } = render(
        <svg>
          <PreviewRenderer
            type="icon"
            position={{ col: 5, row: 5 }}
            opacity={0.5}
            selectedIconId={iconConfig.id}
            gridDimensions={gridDimensions}
            iconConfigs={iconConfigs}
          />
        </svg>,
      );

      const previewIcon = container.querySelector('.preview-icon-svg');
      expect(previewIcon?.getAttribute('width')).toBe('80');
      expect(previewIcon?.getAttribute('height')).toBe('80');
    });
  });
});
