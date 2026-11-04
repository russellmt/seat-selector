import type { IconConfig } from '../types';

/**
 * Default icon configurations for available seat types
 * Organized by seating capacity
 */
export const DEFAULT_ICONS: IconConfig[] = [
  {
    id: 'table-round-4',
    capacity: 0,
    size: { width: 2, height: 2 },
    name: 'Round Table (4-top)',
    color: '#E8B4A2',
    svg: '<circle cx="1" cy="1" r="0.8" fill="currentColor" stroke="#333" stroke-width="0.05"/>'
  },
  {
    id: 'chair-1',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair',
    color: '#8B4513',
    svg: '<rect x="0.2" y="0.2" width="0.6" height="0.6" fill="currentColor" stroke="#333" stroke-width="0.05" rx="0.05"/>'
  },
  {
    id: 'loveseat-2',
    capacity: 2,
    size: { width: 2, height: 1 },
    name: 'Loveseat',
    color: '#D2691E',
    svg: '<rect x="0.1" y="0.2" width="1.8" height="0.6" fill="currentColor" stroke="#333" stroke-width="0.05" rx="0.05"/>'
  },
  {
    id: 'couch-3',
    capacity: 3,
    size: { width: 3, height: 1 },
    name: 'Couch',
    color: '#A0522D',
    svg: '<rect x="0.1" y="0.2" width="2.8" height="0.6" fill="currentColor" stroke="#333" stroke-width="0.05" rx="0.05"/>'
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
