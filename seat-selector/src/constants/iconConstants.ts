/**
 * Icon capacity configurations.
 * Defines the grid size (width x height in grid squares) for each icon type.
 */

/**
 * Represents the grid dimensions occupied by an icon.
 */
interface IconCapacityConfig {
  /** The width of the icon in grid squares */
  width: number;
  /** The height of the icon in grid squares */
  height: number;
}

/**
 * Configuration for a 0-person table icon (Round Table).
 * Occupies a 2×2 grid square footprint.
 */
export const TABLE_CAPACITY_CONFIG: IconCapacityConfig = {
  width: 2,
  height: 2,
} as const;

/**
 * Configuration for a 1-person chair icon.
 * Occupies a 1×1 grid square footprint.
 */
export const CHAIR_CAPACITY_CONFIG: IconCapacityConfig = {
  width: 1,
  height: 1,
} as const;

/**
 * Configuration for a 2-person loveseat icon.
 * Occupies a 2×1 grid square footprint.
 */
export const LOVESEAT_CAPACITY_CONFIG: IconCapacityConfig = {
  width: 2,
  height: 1,
} as const;

/**
 * Configuration for a 3-person couch icon.
 * Occupies a 3×1 grid square footprint.
 */
export const COUCH_CAPACITY_CONFIG: IconCapacityConfig = {
  width: 3,
  height: 1,
} as const;

/**
 * Mapping of capacity to grid configuration.
 * Use this to look up the grid size for any icon by capacity.
 */
export const CAPACITY_CONFIG_MAP: Record<number, IconCapacityConfig> = {
  0: TABLE_CAPACITY_CONFIG,
  1: CHAIR_CAPACITY_CONFIG,
  2: LOVESEAT_CAPACITY_CONFIG,
  3: COUCH_CAPACITY_CONFIG,
} as const;

/**
 * Array of available capacities in order.
 * Used to organize icons in the UI by increasing capacity.
 */
export const AVAILABLE_CAPACITIES = [0, 1, 2, 3] as const;
