import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GridCanvas } from './GridCanvas';
import type { IconConfig } from '../../types/Icon';
import type { GridDimensions } from '../../utils/gridCoordinates';

// Helper to create mock icon config
const createMockIconConfig = (id: string, capacity: number): IconConfig => ({
  id,
  capacity,
  size: { width: 1, height: 1 },
  name: `Icon ${id}`,
  visual: { type: 'svg', content: '<circle cx="0.5" cy="0.5" r="0.4" />' },
  color: '#E8B4A2',
});

const createDefaultGridDimensions = (): GridDimensions => ({
  squareSize: 24,
  offsetX: 0,
  offsetY: 0,
  cols: 10,
  rows: 10,
});

describe('GridCanvas - Brush Interaction (Immediate Add/Delete)', () => {
  /**
   * Test: Seat is added immediately on mouseDown (not waiting for mouseUp)
   */
  it('should call onSeatAdd immediately on mouseDown (brush interaction)', () => {
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

    // Just fire mouseDown - should immediately call onSeatAdd
    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });

    // onSeatAdd should be called immediately after mouseDown
    expect(mockOnSeatAdd).toHaveBeenCalledTimes(1);
    expect(mockOnSeatAdd).toHaveBeenCalledWith(
      expect.objectContaining({ col: expect.any(Number), row: expect.any(Number) }),
      'chair-1',
      'down',
    );
  });

  /**
   * Test: Continuing to call onSeatAdd on mouseMove at different positions
   */
  it('should call onSeatAdd on mouseMove while dragging (brush continues)', () => {
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

    // mouseDown at position 1
    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });
    const callsAfterDown = mockOnSeatAdd.mock.calls.length;

    // Move to position 2 (different grid square)
    fireEvent.mouseMove(svg, { clientX: 48, clientY: 24 });
    const callsAfterFirstMove = mockOnSeatAdd.mock.calls.length;
    expect(callsAfterFirstMove).toBeGreaterThan(callsAfterDown);

    // Move to position 3 (different grid square)
    fireEvent.mouseMove(svg, { clientX: 72, clientY: 24 });
    const callsAfterSecondMove = mockOnSeatAdd.mock.calls.length;
    expect(callsAfterSecondMove).toBeGreaterThan(callsAfterFirstMove);

    // mouseUp should not add more seats
    fireEvent.mouseUp(svg, { button: 0, clientX: 72, clientY: 24 });
    expect(mockOnSeatAdd.mock.calls.length).toBe(callsAfterSecondMove); // No additional calls
  });

  /**
   * Test: Right-click deletes immediately on mouseDown
   */
  it('should call onSeatRemove immediately on right-click mouseDown', () => {
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

    // Right-click mouseDown
    fireEvent.mouseDown(svg, { button: 2, clientX: 24, clientY: 24 });

    // onSeatRemove should be called immediately
    expect(mockOnSeatRemove).toHaveBeenCalledTimes(1);
    expect(mockOnSeatRemove).toHaveBeenCalledWith([
      expect.objectContaining({ col: expect.any(Number), row: expect.any(Number) }),
    ]);
  });

  /**
   * Test: mouseUp does not trigger additional add/delete
   */
  it('should not call add/delete on mouseUp (drag work already done)', () => {
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

    // Start drag
    fireEvent.mouseDown(svg, { button: 0, clientX: 24, clientY: 24 });
    const callsAfterDown = mockOnSeatAdd.mock.calls.length;

    // Move around
    fireEvent.mouseMove(svg, { clientX: 48, clientY: 24 });
    fireEvent.mouseMove(svg, { clientX: 48, clientY: 48 });
    const callsAfterDrag = mockOnSeatAdd.mock.calls.length;
    expect(callsAfterDrag).toBeGreaterThan(callsAfterDown);

    // End drag
    fireEvent.mouseUp(svg, { button: 0, clientX: 48, clientY: 48 });

    // Verify mouseUp didn't add more seats
    expect(mockOnSeatAdd.mock.calls.length).toBe(callsAfterDrag);
  });
});
