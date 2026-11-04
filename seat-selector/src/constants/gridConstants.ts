/**
 * Grid styling and configuration constants.
 * These values define the visual appearance and behavior of the grid canvas.
 */

/**
 * The size of one grid square in pixels.
 * At 96 DPI, this represents approximately 0.75 cm (or about 3 feet in real-world space).
 */
export const GRID_SQUARE_SIZE_PX = 24 as const;

/**
 * The color of grid lines displayed on the canvas.
 * Uses light blue to provide subtle visual guidance without interfering with seat visibility.
 */
export const GRID_LINE_COLOR = '#87CEEB' as const;

/**
 * The opacity of grid lines (0-1 scale).
 * A value of 0.3 ensures the grid is visible but subtle and unobtrusive.
 */
export const GRID_LINE_OPACITY = 0.3 as const;

/**
 * Default canvas width in pixels.
 * This is the standard display width for the seat arrangement canvas.
 */
export const DEFAULT_CANVAS_WIDTH = 1920 as const;

/**
 * Default canvas height in pixels.
 * This is the standard display height for the seat arrangement canvas.
 */
export const DEFAULT_CANVAS_HEIGHT = 1080 as const;

/**
 * Grid line width in pixels for SVG rendering.
 */
export const GRID_LINE_WIDTH = 1 as const;

/**
 * Dash array pattern for grid lines (optional enhancement for subtle appearance).
 */
export const GRID_LINE_DASH_ARRAY = '2,2' as const;
