import { describe, it, expect, beforeEach } from 'vitest';
import { IconConfigService, DEFAULT_ICONS } from './IconConfigService';
import type { IconConfig } from '../types';

describe('IconConfigService', () => {
  let service: IconConfigService;

  beforeEach(() => {
    service = new IconConfigService();
  });

  describe('constructor', () => {
    it('should initialize with DEFAULT_ICONS when no icons provided', () => {
      const configs = service.getAllConfigs();
      expect(configs.length).toBeGreaterThan(0);
      expect(configs.length).toBe(DEFAULT_ICONS.length);
    });

    it('should initialize with custom icons when provided', () => {
      const customIcons: IconConfig[] = [
        {
          id: 'custom-1',
          capacity: 1,
          size: { width: 1, height: 1 },
          name: 'Custom Icon',
          color: '#FF0000',
          svg: '<circle cx="0.5" cy="0.5" r="0.4"/>'
        }
      ];
      const customService = new IconConfigService(customIcons);
      const configs = customService.getAllConfigs();
      expect(configs.length).toBe(1);
      expect(configs[0].id).toBe('custom-1');
    });
  });

  describe('getConfig', () => {
    it('should retrieve a config by ID', () => {
      const config = service.getConfig('table-round-4');
      expect(config).toBeDefined();
      expect(config?.id).toBe('table-round-4');
      expect(config?.capacity).toBe(0);
    });

    it('should return undefined for non-existent ID', () => {
      const config = service.getConfig('non-existent');
      expect(config).toBeUndefined();
    });

    it('should return all default icons by their IDs', () => {
      DEFAULT_ICONS.forEach(icon => {
        const config = service.getConfig(icon.id);
        expect(config).toEqual(icon);
      });
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configs sorted by capacity', () => {
      const configs = service.getAllConfigs();
      
      // Check that configs are sorted by capacity
      for (let i = 1; i < configs.length; i++) {
        expect(configs[i].capacity).toBeGreaterThanOrEqual(configs[i - 1].capacity);
      }
    });

    it('should return an array with all default icons', () => {
      const configs = service.getAllConfigs();
      expect(configs.length).toBe(DEFAULT_ICONS.length);
    });

    it('should return configs in ascending capacity order', () => {
      const configs = service.getAllConfigs();
      const capacities = configs.map(c => c.capacity);
      const sortedCapacities = [...capacities].sort((a, b) => a - b);
      expect(capacities).toEqual(sortedCapacities);
    });
  });

  describe('getConfigsByCapacity', () => {
    it('should return configs grouped by capacity', () => {
      const grouped = service.getConfigsByCapacity();
      
      // Each group should contain configs of the same capacity
      grouped.forEach(group => {
        const capacity = group[0].capacity;
        group.forEach(config => {
          expect(config.capacity).toBe(capacity);
        });
      });
    });

    it('should return groups sorted by capacity', () => {
      const grouped = service.getConfigsByCapacity();
      
      for (let i = 1; i < grouped.length; i++) {
        expect(grouped[i][0].capacity).toBeGreaterThanOrEqual(grouped[i - 1][0].capacity);
      }
    });

    it('should return all configs grouped', () => {
      const grouped = service.getConfigsByCapacity();
      const totalConfigs = grouped.reduce((sum, group) => sum + group.length, 0);
      expect(totalConfigs).toBe(DEFAULT_ICONS.length);
    });

    it('should have at least one group for each capacity in default icons', () => {
      const grouped = service.getConfigsByCapacity();
      const uniqueCapacities = new Set(DEFAULT_ICONS.map(i => i.capacity));
      
      // Should have at least as many groups as unique capacities
      expect(grouped.length).toBe(uniqueCapacities.size);
    });
  });

  describe('DEFAULT_ICONS', () => {
    it('should include 4 seat types', () => {
      expect(DEFAULT_ICONS.length).toBe(4);
    });

    it('should have a 0-person table', () => {
      const table = DEFAULT_ICONS.find(i => i.capacity === 0);
      expect(table).toBeDefined();
      expect(table?.id).toBe('table-round-4');
      expect(table?.size.width).toBe(2);
      expect(table?.size.height).toBe(2);
    });

    it('should have a 1-person chair', () => {
      const chair = DEFAULT_ICONS.find(i => i.capacity === 1);
      expect(chair).toBeDefined();
      expect(chair?.id).toBe('chair-1');
      expect(chair?.size.width).toBe(1);
      expect(chair?.size.height).toBe(1);
    });

    it('should have a 2-person loveseat', () => {
      const loveseat = DEFAULT_ICONS.find(i => i.capacity === 2);
      expect(loveseat).toBeDefined();
      expect(loveseat?.id).toBe('loveseat-2');
      expect(loveseat?.size.width).toBe(2);
      expect(loveseat?.size.height).toBe(1);
    });

    it('should have a 3-person couch', () => {
      const couch = DEFAULT_ICONS.find(i => i.capacity === 3);
      expect(couch).toBeDefined();
      expect(couch?.id).toBe('couch-3');
      expect(couch?.size.width).toBe(3);
      expect(couch?.size.height).toBe(1);
    });

    it('should have all required properties for each icon', () => {
      DEFAULT_ICONS.forEach(icon => {
        expect(icon.id).toBeDefined();
        expect(typeof icon.id).toBe('string');
        expect(icon.id.length).toBeGreaterThan(0);
        
        expect(icon.capacity).toBeDefined();
        expect(typeof icon.capacity).toBe('number');
        expect(icon.capacity).toBeGreaterThanOrEqual(0);
        
        expect(icon.size).toBeDefined();
        expect(icon.size.width).toBeGreaterThan(0);
        expect(icon.size.height).toBeGreaterThan(0);
        
        expect(icon.name).toBeDefined();
        expect(typeof icon.name).toBe('string');
        expect(icon.name.length).toBeGreaterThan(0);
        
        expect(icon.color).toBeDefined();
        expect(typeof icon.color).toBe('string');
        expect(icon.color).toMatch(/^#[0-9A-F]{6}$/i);
        
        expect(icon.svg).toBeDefined();
        expect(typeof icon.svg).toBe('string');
        expect(icon.svg.length).toBeGreaterThan(0);
      });
    });
  });
});
