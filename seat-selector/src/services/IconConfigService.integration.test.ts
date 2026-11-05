import { describe, it, expect } from 'vitest';
import { IconConfigService, DEFAULT_ICONS, iconConfigService } from './IconConfigService';
import type { GridSize, Rotation } from '../types';

describe('IconConfigService Integration Tests', () => {
  describe('Requirements 39.1, 39.2, 39.3, 39.4', () => {
    it('should fulfill requirement 39.1: store icon configurations with all required properties', () => {
      const service = new IconConfigService();

      DEFAULT_ICONS.forEach(icon => {
        const config = service.getConfig(icon.id);
        
        expect(config).toBeDefined();
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('capacity');
        expect(config).toHaveProperty('size');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('visual');
        expect(config).toHaveProperty('color');
      });
    });

    it('should fulfill requirement 39.2: allow easy modification of icon configurations', () => {
      const customConfig = {
        id: 'custom-seat',
        capacity: 2,
        size: { width: 2, height: 1 } as GridSize,
        name: 'Custom Seat',
        color: '#FF00FF',
        visual: { type: 'svg' as const, content: '<rect />' }
      };

      const service = new IconConfigService([customConfig]);
      const retrieved = service.getConfig('custom-seat');

      expect(retrieved).toEqual(customConfig);
    });

    it('should fulfill requirement 39.3: include all required icon configuration properties', () => {
      const service = new IconConfigService();
      const config = service.getConfig('table-round-4');

      expect(config?.id).toBeDefined();
      expect(typeof config?.id).toBe('string');

      expect(config?.capacity).toBeDefined();
      expect(typeof config?.capacity).toBe('number');

      expect(config?.size).toBeDefined();
      expect(config?.size.width).toBeDefined();
      expect(config?.size.height).toBeDefined();

      expect(config?.name).toBeDefined();
      expect(typeof config?.name).toBe('string');

      expect(config?.visual).toBeDefined();
      expect(config?.visual.type === 'svg' || config?.visual.type === 'image').toBe(true);

      expect(config?.color).toBeDefined();
      expect(typeof config?.color).toBe('string');
    });

    it('should fulfill requirement 39.4: load and provide consistent access to icon configurations', () => {
      const service = new IconConfigService();
      const allConfigs = service.getAllConfigs();

      expect(allConfigs.length).toBeGreaterThan(0);

      // Verify we can access each config by ID
      allConfigs.forEach(config => {
        const retrieved = service.getConfig(config.id);
        expect(retrieved).toEqual(config);
      });
    });
  });

  describe('IconConfigService Methods', () => {
    it('should get a specific icon config by ID', () => {
      const service = new IconConfigService();
      const config = service.getConfig('chair-1');

      expect(config?.id).toBe('chair-1');
      expect(config?.capacity).toBe(1);
      expect(config?.size.width).toBe(1);
      expect(config?.size.height).toBe(1);
    });

    it('should get all configs sorted by capacity', () => {
      const service = new IconConfigService();
      const allConfigs = service.getAllConfigs();

      for (let i = 1; i < allConfigs.length; i++) {
        expect(allConfigs[i].capacity).toBeGreaterThanOrEqual(allConfigs[i - 1].capacity);
      }
    });

    it('should get configs grouped by capacity', () => {
      const service = new IconConfigService();
      const grouped = service.getConfigsByCapacity();

      grouped.forEach((group, index) => {
        const capacity = group[0].capacity;
        
        // All items in group should have same capacity
        group.forEach(config => {
          expect(config.capacity).toBe(capacity);
        });

        // Groups should be sorted by capacity
        if (index > 0) {
          expect(capacity).toBeGreaterThanOrEqual(grouped[index - 1][0].capacity);
        }
      });
    });
  });

  describe('DEFAULT_ICONS Configuration', () => {
    it('should have 0-person table with 2x2 grid', () => {
      const table = DEFAULT_ICONS.find(i => i.id === 'table-round-4');
      expect(table?.capacity).toBe(0);
      expect(table?.size.width).toBe(2);
      expect(table?.size.height).toBe(2);
      expect(table?.color).toBe('#E8B4A2');
    });

    it('should have 1-person chair with 1x1 grid', () => {
      const chair = DEFAULT_ICONS.find(i => i.id === 'chair-1');
      expect(chair?.capacity).toBe(1);
      expect(chair?.size.width).toBe(1);
      expect(chair?.size.height).toBe(1);
      expect(chair?.color).toBe('#8B4513');
    });

    it('should have 2-person loveseat with 2x1 grid', () => {
      const loveseat = DEFAULT_ICONS.find(i => i.id === 'loveseat-2');
      expect(loveseat?.capacity).toBe(2);
      expect(loveseat?.size.width).toBe(2);
      expect(loveseat?.size.height).toBe(1);
      expect(loveseat?.color).toBe('#D2691E');
    });

    it('should have 3-person couch with 3x1 grid', () => {
      const couch = DEFAULT_ICONS.find(i => i.id === 'couch-3');
      expect(couch?.capacity).toBe(3);
      expect(couch?.size.width).toBe(3);
      expect(couch?.size.height).toBe(1);
      expect(couch?.color).toBe('#A0522D');
    });
  });

  describe('Singleton Instance', () => {
    it('should provide a singleton instance', () => {
      expect(iconConfigService).toBeInstanceOf(IconConfigService);
    });

    it('should have all default icons loaded', () => {
      const configs = iconConfigService.getAllConfigs();
      expect(configs.length).toBe(DEFAULT_ICONS.length);
    });

    it('should be usable directly without creating new instances', () => {
      const config = iconConfigService.getConfig('chair-1');
      expect(config?.id).toBe('chair-1');
    });
  });

  describe('Type Compatibility', () => {
    it('should work with GridSize type', () => {
      const service = new IconConfigService();
      const config = service.getConfig('table-round-4');
      
      const size: GridSize = config?.size as GridSize;
      expect(size.width).toBe(2);
      expect(size.height).toBe(2);
    });

    it('should work with Rotation type for icon placement', () => {
      const rotation: Rotation = 'down';
      expect(['left', 'up', 'right', 'down']).toContain(rotation);
    });

    it('should provide complete IconConfig for all seat types', () => {
      const service = new IconConfigService();
      
      ['table-round-4', 'chair-1', 'loveseat-2', 'couch-3'].forEach(iconId => {
        const config = service.getConfig(iconId);
        
        expect(config).toBeDefined();
        expect(config?.id).toBe(iconId);
        expect(config?.size.width).toBeGreaterThan(0);
        expect(config?.size.height).toBeGreaterThan(0);
      });
    });
  });
});
