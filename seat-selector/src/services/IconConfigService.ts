import type { IconConfig } from '../types';

/**
 * Default icon configurations for available seat types
 * Organized by seating capacity
 * 
 * SVG positioning strategy (when facing DOWN):
 * - Front/seating side at bottom (y=0.85), padding on left, right
 * - Back of seat at top (y=0), minimal padding
 * - Each icon fills its grid footprint with directional padding
 * 
 * Padding values (applied to SVG content within the viewBox):
 * - Left/Right: 0.05 (5% of grid square) - side padding
 * - Top (back when DOWN): 0 (no padding at back)
 * - Bottom (front when DOWN): 0.15 (15% of grid square)
 * - Seating area: 0 to 0.85
 * 
 * Size dimensions (width × height in grid squares):
 * - Table: 2×2 grid squares (non-rotatable, always 2×2)
 * - Chair: 1×1 grid square (non-rotatable)
 * - Loveseat: 2×1 grid squares (horizontal when DOWN/UP, rotates to 1×2 when LEFT/RIGHT)
 * - Couch: 3×1 grid squares (horizontal when DOWN/UP, rotates to 1×3 when LEFT/RIGHT)
 * 
 * SVG coordinates for each icon's viewBox (when facing DOWN):
 * - Table: viewBox="0 0 2 2" - circle centered
 * - Chair: viewBox="0 0 1 1" - rectangle from (0.05, 0) to (0.95, 0.85)
 * - Loveseat: viewBox="0 0 2 1" - rectangle from (0.05, 0) to (1.95, 0.85)
 * - Couch: viewBox="0 0 3 1" - rectangle from (0.05, 0) to (2.95, 0.85)
 */
export const DEFAULT_ICONS: IconConfig[] = [
  {
    id: 'table-round-4',
    capacity: 0,
    size: { width: 2, height: 2 },
    name: 'Round Table (4-top)',
    color: '#E8B4A2',
    visual: {
      type: 'svg',
      // Table: 2x2 grid squares, centered circle
      // Centered at (1,1) with radius 0.9 to fill most of the space
      content: '<circle cx="1" cy="1" r="0.9" fill="currentColor" stroke="#333" stroke-width="0.05"/>'
    }
  },
  {
    id: 'chair-1',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair',
    color: '#8B4513',
    visual: {
      type: 'svg',
      // Chair: 1x1 grid square
      // When facing DOWN: back at top (y=0), front seating at bottom (y=0.85)
      // Padding on left (0.05), right (0.05), no padding at back, bottom gap (0.15)
      // Rectangle from (0.05, 0) to (0.95, 0.85)
      content: '<rect x="0.05" y="0" width="0.9" height="0.85" fill="currentColor" stroke="#333" stroke-width="0.04" rx="0.05"/>'
    }
  },
  {
    id: 'loveseat-2',
    capacity: 2,
    size: { width: 2, height: 1 },
    name: 'Loveseat',
    color: '#D2691E',
    visual: {
      type: 'svg',
      // Loveseat: 2x1 grid squares (horizontal when facing DOWN/UP)
      // When facing DOWN: back at top (y=0), front at bottom (y=0.85)
      // Padding on left (0.05), right (0.05), no padding at back, bottom gap (0.15)
      // Rectangle from (0.05, 0) to (1.95, 0.85)
      content: '<rect x="0.05" y="0" width="1.9" height="0.85" fill="currentColor" stroke="#333" stroke-width="0.04" rx="0.05"/>'
    }
  },
  {
    id: 'couch-3',
    capacity: 3,
    size: { width: 3, height: 1 },
    name: 'Couch',
    color: '#A0522D',
    visual: {
      type: 'svg',
      // Couch: 3x1 grid squares (horizontal when facing DOWN/UP)
      // When facing DOWN: back at top (y=0), front at bottom (y=0.85)
      // Padding on left (0.05), right (0.05), no padding at back, bottom gap (0.15)
      // Rectangle from (0.05, 0) to (2.95, 0.85)
      content: '<rect x="0.05" y="0" width="2.9" height="0.85" fill="currentColor" stroke="#333" stroke-width="0.04" rx="0.05"/>'
    }
  }
];

/**
 * IconConfigService provides centralized management of icon configurations
 * Handles retrieval, filtering, and organization of seat type configurations
 */
export class IconConfigService {
  private configs: Map<string, IconConfig>;

  /**
   * Initialize the service with default icon configurations
   */
  constructor(icons: IconConfig[] = DEFAULT_ICONS) {
    this.configs = new Map();
    icons.forEach(icon => {
      this.configs.set(icon.id, icon);
    });
  }

  /**
   * Retrieve a single icon configuration by ID
   * @param iconId - The unique identifier of the icon
   * @returns The IconConfig if found, undefined otherwise
   */
  getConfig(iconId: string): IconConfig | undefined {
    return this.configs.get(iconId);
  }

  /**
   * Retrieve all icon configurations
   * @returns Array of all IconConfig objects, sorted by capacity
   */
  getAllConfigs(): IconConfig[] {
    return Array.from(this.configs.values()).sort((a, b) => a.capacity - b.capacity);
  }

  /**
   * Retrieve icon configurations grouped by capacity
   * @returns Array of IconConfig arrays, each subarray contains icons of the same capacity
   */
  getConfigsByCapacity(): IconConfig[][] {
    const grouped = new Map<number, IconConfig[]>();

    // Group configs by capacity
    this.configs.forEach(config => {
      if (!grouped.has(config.capacity)) {
        grouped.set(config.capacity, []);
      }
      grouped.get(config.capacity)!.push(config);
    });

    // Sort by capacity and return as array of arrays
    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(entry => entry[1]);
  }
}

/**
 * Singleton instance of IconConfigService for application-wide use
 */
export const iconConfigService = new IconConfigService();
