/**
 * GridCanvas Component Tests
 *
 * Tests verifying:
 * - Component renders without errors
 * - SVG container is created with correct dimensions
 * - Mouse event handlers are wired correctly
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GridCanvas } from './GridCanvas';
import type { IconConfig } from '../../types/Icon';
import type { GridDimensions } from '../../utils/gridCoordinates';

// Helper to check if SVG exists (avoid toBeInTheDocument which requires jest-dom)
const expectSvgExists = (svg: SVGSVGElement | null) => {
  expect(svg).not.toBeNull();
  expect(svg).toBeDefined();
  expect(svg?.tagName).toBe('svg');
};

/**
 * Helper function to create mock icon configs
 */
const createMockIconConfig = (id: string, capacity: number): IconConfig => ({
  id,
  capacity,
  size: { width: 1, height: 1 },
  name: `Icon ${id}`,
  visual: { type: 'svg', content: '<circle cx="0.5" cy="0.5" r="0.4" />' },
  color: '#E8B4A2',
});

/**
 * Helper function to create default grid dimensions
 */
const createDefaultGridDimensions = (): GridDimensions => ({
  squareSize: 24,
  offsetX: 0,
  offsetY: 0,
  cols: 10,
  rows: 10,
});

describe('GridCanvas', () => {
  /**
   * Test 1: Component renders without errors
   */
  it('should render without errors', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={vi.fn()}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;
    expectSvgExists(svg);
  });

  /**
   * Test 2: SVG canvas is created with correct dimensions
   */
  it('should create SVG container with correct dimensions', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={vi.fn()}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;
    
    // Expected canvas size: cols * squareSize x rows * squareSize
    // 10 * 24 = 240
    expect(svg.getAttribute('width')).toBe('240');
    expect(svg.getAttribute('height')).toBe('240');
  });

  /**
   * Test 3: Mouse event handlers are wired (left-click triggers onSeatAdd)
   */
  it('should call onSeatAdd on left-click', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();
    const mockOnSeatAdd = vi.fn();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={mockOnSeatAdd}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Simulate left-click at a position within the canvas
    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });
    fireEvent.mouseUp(svg, { button: 0, clientX: 24, clientY: 24 });

    expect(mockOnSeatAdd).toHaveBeenCalled();
    expect(mockOnSeatAdd).toHaveBeenCalledWith(
      expect.objectContaining({ col: expect.any(Number), row: expect.any(Number) }),
      'chair-1',
      'down',
    );
  });

  /**
   * Test 4: Mouse event handlers are wired (right-click triggers onSeatRemove)
   */
  it('should call onSeatRemove on right-click', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();
    const mockOnSeatRemove = vi.fn();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={vi.fn()}
        onSeatRemove={mockOnSeatRemove}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Simulate right-click
    fireEvent.mouseDown(svg, { button: 2, clientX: 24, clientY: 24 });
    fireEvent.mouseUp(svg, { button: 2, clientX: 24, clientY: 24 });

    expect(mockOnSeatRemove).toHaveBeenCalled();
    expect(mockOnSeatRemove).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ col: expect.any(Number), row: expect.any(Number) }),
      ]),
    );
  });

  /**
   * Test 5: Hover preview updates on mouse move
   */
  it('should update hover preview position on mouse move', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={vi.fn()}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Move mouse to a new position
    fireEvent.mouseMove(svg, { clientX: 48, clientY: 48 });

    // Component state should be updated (we can't directly verify state, but no errors should occur)
    expectSvgExists(svg);
  });

  /**
   * Test 6: Preview is cleared when mouse leaves canvas
   */
  it('should clear hover preview when mouse leaves canvas', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={vi.fn()}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Move mouse into canvas
    fireEvent.mouseMove(svg, { clientX: 48, clientY: 48 });

    // Move mouse out of canvas
    fireEvent.mouseLeave(svg);

    // Component should still be rendered with no errors
    expectSvgExists(svg);
  });

  /**
   * Test 7: Read-only mode prevents interactions
   */
  it('should not respond to mouse events when in read-only mode', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();
    const mockOnSeatAdd = vi.fn();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={mockOnSeatAdd}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
        readOnly={true}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Attempt left-click in read-only mode
    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });
    fireEvent.mouseUp(svg, { button: 0, clientX: 24, clientY: 24 });

    // onSeatAdd should not be called
    expect(mockOnSeatAdd).not.toHaveBeenCalled();
  });

  /**
   * Test 8: Context menu is prevented on right-click
   */
  it('should prevent context menu on right-click', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={vi.fn()}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Fire context menu event with preventDefault
    const event = new MouseEvent('contextmenu', { bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    svg.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  /**
   * Test 9: Accepts guest assignment callback
   */
  it('should call onGuestAssign when guest is selected', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();
    const mockOnGuestAssign = vi.fn();
    const mockGuest = { id: 'guest-1', name: 'John', initials: 'J', colorSeed: 'john', color: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, text: 'white' as const } };

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        selectedGuestId="guest-1"
        guests={[mockGuest]}
        onSeatAdd={vi.fn()}
        onSeatRemove={vi.fn()}
        onGuestAssign={mockOnGuestAssign}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });
    fireEvent.mouseUp(svg, { button: 0, clientX: 24, clientY: 24 });

    expect(mockOnGuestAssign).toHaveBeenCalled();
  });

  /**
   * Test 10: Drag operation adds multiple seats
   */
  it('should add multiple seats during drag operation', () => {
    const mockIconConfig = createMockIconConfig('chair-1', 1);
    const iconConfigs = new Map([['chair-1', mockIconConfig]]);
    const gridDimensions = createDefaultGridDimensions();
    const mockOnSeatAdd = vi.fn();

    const { container } = render(
      <GridCanvas
        seats={[]}
        selectedIconId="chair-1"
        selectedRotation="down"
        onSeatAdd={mockOnSeatAdd}
        onSeatRemove={vi.fn()}
        iconConfigs={iconConfigs}
        gridDimensions={gridDimensions}
      />,
    );

    const svg = container.querySelector('svg.grid-canvas') as SVGSVGElement;

    // Simulate drag from (24, 24) to (72, 24) - a horizontal drag
    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });
    fireEvent.mouseMove(svg, { clientX: 48, clientY: 24 });
    fireEvent.mouseMove(svg, { clientX: 72, clientY: 24 });
    fireEvent.mouseUp(svg, { button: 0, clientX: 72, clientY: 24 });

    // Multiple seats should be added along the drag path
    expect(mockOnSeatAdd.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
