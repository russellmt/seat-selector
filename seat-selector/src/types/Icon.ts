/**
 * Icon Configuration Types
 * Defines the structure for seat icons and related configuration
 */

/**
 * GridSize represents the dimensions of an icon footprint in grid squares
 */
export interface GridSize {
  width: number;  // width in grid squares
  height: number; // height in grid squares
}

/**
 * Cardinal directions for icon rotation
 */
export type Rotation = 'left' | 'up' | 'right' | 'down';

/**
 * IconConfig represents a seating element type (table, chair, couch, etc.)
 * that can be placed on the canvas
 */
export interface IconConfig {
  id: string;           // unique identifier
  capacity: number;     // number of people this seat accommodates
  size: GridSize;       // footprint dimensions in grid squares
  name: string;         // human-readable name
  svg: string;          // SVG content for rendering
  color: string;        // default color for rendering
}
