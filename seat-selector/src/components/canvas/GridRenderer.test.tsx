/**
 * GridRenderer Component Tests
 *
 * Verifies:
 * - Grid lines are rendered
 * - Correct number of vertical and horizontal lines
 * - Lines have correct opacity and color
 * - Lines scale with grid dimensions
 * - Component renders without errors
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GridRenderer } from './GridRenderer';
import type { GridDimensions } from '../../utils/gridCoordinates';

describe('GridRenderer', () => {
  /**
   * Test: Renders grid lines without errors
   */
  it('should render without errors', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 10,
      rows: 10,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const gridRenderer = container.querySelector('.grid-renderer');
    expect(gridRenderer).toBeDefined();
  });

  /**
   * Test: Renders correct number of vertical lines
   * For a grid with cols=10, there should be 11 vertical lines (0 to 10 inclusive)
   */
  it('should render correct number of vertical lines', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 10,
      rows: 10,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    
    // Count vertical lines by checking x1 == x2
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });
    
    // Should be cols + 1 lines
    expect(verticalLines.length).toBe(gridDimensions.cols + 1);
  });

  /**
   * Test: Renders correct number of horizontal lines
   * For a grid with rows=10, there should be 11 horizontal lines (0 to 10 inclusive)
   */
  it('should render correct number of horizontal lines', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 10,
      rows: 10,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    
    // Count horizontal lines by checking y1 == y2
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });
    
    // Should be rows + 1 lines
    expect(horizontalLines.length).toBe(gridDimensions.rows + 1);
  });

  /**
   * Test: Vertical lines have correct color
   */
  it('should render vertical lines with correct color', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 5,
      rows: 5,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });

    // Check first vertical line
    const firstLine = verticalLines[0] as SVGLineElement;
    expect(firstLine.getAttribute('stroke')).toBe('#ADD8E6'); // Light blue
  });

  /**
   * Test: Horizontal lines have correct color
   */
  it('should render horizontal lines with correct color', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 5,
      rows: 5,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });

    // Check first horizontal line
    const firstLine = horizontalLines[0] as SVGLineElement;
    expect(firstLine.getAttribute('stroke')).toBe('#ADD8E6'); // Light blue
  });

  /**
   * Test: Lines have correct opacity
   */
  it('should render lines with opacity 0.3', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 5,
      rows: 5,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');

    allLines.forEach((line) => {
      expect(line.getAttribute('opacity')).toBe('0.3');
    });
  });

  /**
   * Test: Vertical lines are positioned at correct x coordinates
   */
  it('should position vertical lines at correct x coordinates', () => {
    const squareSize = 40;
    const cols = 5;
    const gridDimensions: GridDimensions = {
      squareSize,
      offsetX: 0,
      offsetY: 0,
      cols,
      rows: 5,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });

    verticalLines.forEach((line, index) => {
      const expectedX = index * squareSize;
      expect(parseFloat((line as SVGLineElement).getAttribute('x1') || '0')).toBe(expectedX);
      expect(parseFloat((line as SVGLineElement).getAttribute('x2') || '0')).toBe(expectedX);
    });
  });

  /**
   * Test: Horizontal lines are positioned at correct y coordinates
   */
  it('should position horizontal lines at correct y coordinates', () => {
    const squareSize = 40;
    const rows = 5;
    const gridDimensions: GridDimensions = {
      squareSize,
      offsetX: 0,
      offsetY: 0,
      cols: 5,
      rows,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });

    horizontalLines.forEach((line, index) => {
      const expectedY = index * squareSize;
      expect(parseFloat((line as SVGLineElement).getAttribute('y1') || '0')).toBe(expectedY);
      expect(parseFloat((line as SVGLineElement).getAttribute('y2') || '0')).toBe(expectedY);
    });
  });

  /**
   * Test: Vertical lines extend the full height of the canvas
   */
  it('should extend vertical lines to full canvas height', () => {
    const squareSize = 40;
    const rows = 5;
    const gridDimensions: GridDimensions = {
      squareSize,
      offsetX: 0,
      offsetY: 0,
      cols: 5,
      rows,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });

    const expectedCanvasHeight = rows * squareSize;
    verticalLines.forEach((line) => {
      expect(parseFloat((line as SVGLineElement).getAttribute('y1') || '0')).toBe(0);
      expect(parseFloat((line as SVGLineElement).getAttribute('y2') || '0')).toBe(expectedCanvasHeight);
    });
  });

  /**
   * Test: Horizontal lines extend the full width of the canvas
   */
  it('should extend horizontal lines to full canvas width', () => {
    const squareSize = 40;
    const cols = 5;
    const gridDimensions: GridDimensions = {
      squareSize,
      offsetX: 0,
      offsetY: 0,
      cols,
      rows: 5,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });

    const expectedCanvasWidth = cols * squareSize;
    horizontalLines.forEach((line) => {
      expect(parseFloat((line as SVGLineElement).getAttribute('x1') || '0')).toBe(0);
      expect(parseFloat((line as SVGLineElement).getAttribute('x2') || '0')).toBe(expectedCanvasWidth);
    });
  });

  /**
   * Test: Grid scales correctly with different square sizes
   */
  it('should scale grid with different square sizes', () => {
    const cols = 10;
    const rows = 10;

    // Test with squareSize = 50
    const gridDimensions50: GridDimensions = {
      squareSize: 50,
      offsetX: 0,
      offsetY: 0,
      cols,
      rows,
    };

    const { container: container50 } = render(<GridRenderer gridDimensions={gridDimensions50} />);
    const allLines50 = container50.querySelectorAll('line');
    const verticalLines50 = Array.from(allLines50).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });
    const fifthVLine50 = verticalLines50[5] as SVGLineElement;
    expect(parseFloat(fifthVLine50.getAttribute('x1') || '0')).toBe(5 * 50); // 250

    // Test with squareSize = 100
    const gridDimensions100: GridDimensions = {
      squareSize: 100,
      offsetX: 0,
      offsetY: 0,
      cols,
      rows,
    };

    const { container: container100 } = render(<GridRenderer gridDimensions={gridDimensions100} />);
    const allLines100 = container100.querySelectorAll('line');
    const verticalLines100 = Array.from(allLines100).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });
    const fifthVLine100 = verticalLines100[5] as SVGLineElement;
    expect(parseFloat(fifthVLine100.getAttribute('x1') || '0')).toBe(5 * 100); // 500
  });

  /**
   * Test: Different grid dimensions render correctly
   */
  it('should handle different grid dimensions', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 20,
      rows: 15,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });

    // Should have cols + 1 vertical lines
    expect(verticalLines.length).toBe(gridDimensions.cols + 1);
    // Should have rows + 1 horizontal lines
    expect(horizontalLines.length).toBe(gridDimensions.rows + 1);
  });

  /**
   * Test: All lines have stroke width of 1
   */
  it('should render lines with stroke width 1', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 5,
      rows: 5,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');

    allLines.forEach((line) => {
      expect(line.getAttribute('stroke-width')).toBe('1');
    });
  });

  /**
   * Test: Grid renderer is wrapped in a group with correct class
   */
  it('should render within a group element with grid-renderer class', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 10,
      rows: 10,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const group = container.querySelector('g.grid-renderer');

    expect(group).toBeDefined();
    // Verify it contains lines
    const lines = group?.querySelectorAll('line');
    expect(lines?.length).toBeGreaterThan(0);
  });

  /**
   * Test: Grid renders with minimal grid (1x1)
   */
  it('should render minimal 1x1 grid', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 1,
      rows: 1,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });

    // 1x1 grid should have 2 vertical lines and 2 horizontal lines
    expect(verticalLines.length).toBe(2);
    expect(horizontalLines.length).toBe(2);
  });

  /**
   * Test: Grid renders with large dimensions
   */
  it('should render large grid efficiently', () => {
    const gridDimensions: GridDimensions = {
      squareSize: 40,
      offsetX: 0,
      offsetY: 0,
      cols: 100,
      rows: 100,
    };

    const { container } = render(<GridRenderer gridDimensions={gridDimensions} />);
    const allLines = container.querySelectorAll('line');
    
    const verticalLines = Array.from(allLines).filter((line) => {
      const x1 = parseFloat((line as SVGLineElement).getAttribute('x1') || '0');
      const x2 = parseFloat((line as SVGLineElement).getAttribute('x2') || '0');
      return x1 === x2;
    });
    const horizontalLines = Array.from(allLines).filter((line) => {
      const y1 = parseFloat((line as SVGLineElement).getAttribute('y1') || '0');
      const y2 = parseFloat((line as SVGLineElement).getAttribute('y2') || '0');
      return y1 === y2;
    });

    // Should have 101 vertical and 101 horizontal lines
    expect(verticalLines.length).toBe(101);
    expect(horizontalLines.length).toBe(101);
  });
});
