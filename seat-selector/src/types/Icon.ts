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
 * Visual representation of an icon - supports both inline SVG and image URLs
 */
export type IconVisual = 
  | { type: 'svg'; content: string }           // Inline SVG markup
  | { type: 'image'; url: string };            // Image URL (PNG, JPG, etc.)

/**
 * IconConfig represents a seating element type (table, chair, couch, etc.)
 * that can be placed on the canvas
 */
export interface IconConfig {
  id: string;           // unique identifier
  capacity: number;     // number of people this seat accommodates
  size: GridSize;       // footprint dimensions in grid squares
  name: string;         // human-readable name
  visual: IconVisual;   // SVG content or image URL for rendering
  color: string;        // default color for rendering
}

/**
 * Legacy IconConfig type for backward compatibility
 * Accepts either the old 'svg' field or the new 'visual' union type
 */
export type IconConfigInput = Omit<IconConfig, 'visual'> & {
  visual?: IconVisual;
  svg?: string;  // legacy field for backward compatibility
};

/**
 * Normalizes an IconConfig to ensure it has the visual field
 * Converts legacy 'svg' field to new 'visual' format if needed
 */
export function normalizeIconConfig(input: IconConfigInput | IconConfig): IconConfig {
  const config = input as any;
  
  if (config.visual) {
    return config as IconConfig;
  }
  
  if (config.svg) {
    return {
      ...config,
      visual: { type: 'svg', content: config.svg },
    };
  }
  
  throw new Error(`IconConfig ${config.id} must have either 'visual' or 'svg' field`);
}
