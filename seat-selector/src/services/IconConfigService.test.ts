import { describe, it, expect } from 'vitest';
import { IconConfigService, DEFAULT_ICONS } from './IconConfigService';

describe('IconConfigService', () => {
  describe('getConfig', () => {
    it('should return config for valid icon ID', () => {
      const service = new IconConfigService();
      const config = service.getConfig('chair-1');
      expect(config).toBeDefined();
      expect(config?.id).toBe('chair-1');
      expect(config?.capacity).toBe(1);
    });

    it('should return undefined for invalid icon ID', () => {
      const service = new IconConfigService();
      const config = service.getConfig('nonexistent');
      expect(config).toBeUndefined();
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configs', () => {
      const service = new IconConfigService();
      const configs = service.getAllConfigs();
      expect(configs.length).toBe(DEFAULT_ICONS.length);
    });

    it('should return configs sorted by capacity', () => {
      const service = new IconConfigService();
      const configs = service.getAllConfigs();
      for (let i = 0; i < configs.length - 1; i++) {
        expect(configs[i].capacity).toBeLessThanOrEqual(configs[i + 1].capacity);
      }
    });

    it('should include all default icons', () => {
      const service = new IconConfigService();
      const configs = service.getAllConfigs();
      DEFAULT_ICONS.forEach(icon => {
        const found = configs.find(c => c.id === icon.id);
        expect(found).toBeDefined();
      });
    });
  });

  describe('getConfigsByCapacity', () => {
    it('should return grouped configs', () => {
      const service = new IconConfigService();
      const groups = service.getConfigsByCapacity();
      expect(groups.length).toBeGreaterThan(0);
    });

    it('should return groups sorted by capacity', () => {
      const service = new IconConfigService();
      const groups = service.getConfigsByCapacity();
      for (let i = 0; i < groups.length - 1; i++) {
        expect(groups[i][0].capacity).toBeLessThan(groups[i + 1][0].capacity);
      }
    });

    it('should return all configs grouped by capacity', () => {
      const service = new IconConfigService();
      const groups = service.getConfigsByCapacity();
      let totalConfigs = 0;
      groups.forEach(group => {
        totalConfigs += group.length;
        // All configs in a group should have the same capacity
        const firstCapacity = group[0].capacity;
        group.forEach(config => {
          expect(config.capacity).toBe(firstCapacity);
        });
      });
      expect(totalConfigs).toBe(DEFAULT_ICONS.length);
    });

    it('should have at least one group for each capacity in default icons', () => {
      const service = new IconConfigService();
      const groups = service.getConfigsByCapacity();
      
      const capacities = new Set(DEFAULT_ICONS.map(i => i.capacity));
      expect(groups.length).toBe(capacities.size);
    });
  });

  describe('DEFAULT_ICONS Configuration', () => {
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

    it('should have a 2-person loveseat with 2x1 grid (horizontal when DOWN)', () => {
      const loveseat = DEFAULT_ICONS.find(i => i.capacity === 2);
      expect(loveseat).toBeDefined();
      expect(loveseat?.id).toBe('loveseat-2');
      expect(loveseat?.size.width).toBe(2);
      expect(loveseat?.size.height).toBe(1);
    });

    it('should have a 3-person couch with 3x1 grid (horizontal when DOWN)', () => {
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
        
        expect(icon.visual).toBeDefined();
        expect(icon.visual.type === 'svg' || icon.visual.type === 'image').toBe(true);
        
        if (icon.visual.type === 'svg') {
          expect(typeof icon.visual.content).toBe('string');
          expect(icon.visual.content.length).toBeGreaterThan(0);
        } else if (icon.visual.type === 'image') {
          expect(typeof icon.visual.url).toBe('string');
          expect(icon.visual.url.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
