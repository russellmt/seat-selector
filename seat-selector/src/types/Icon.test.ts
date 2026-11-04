import { describe, it, expect } from 'vitest';
import type { GridSize, IconConfig, Rotation } from './Icon';

describe('Icon Types', () => {
  describe('GridSize', () => {
    it('should allow valid GridSize objects', () => {
      const size: GridSize = {
        width: 2,
        height: 2
      };
      expect(size.width).toBe(2);
      expect(size.height).toBe(2);
    });

    it('should require width and height', () => {
      const size: GridSize = {
        width: 1,
        height: 1
      };
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
    });
  });

  describe('Rotation', () => {
    it('should accept left rotation', () => {
      const rotation: Rotation = 'left';
      expect(rotation).toBe('left');
    });

    it('should accept up rotation', () => {
      const rotation: Rotation = 'up';
      expect(rotation).toBe('up');
    });

    it('should accept right rotation', () => {
      const rotation: Rotation = 'right';
      expect(rotation).toBe('right');
    });

    it('should accept down rotation', () => {
      const rotation: Rotation = 'down';
      expect(rotation).toBe('down');
    });

    it('should have all four cardinal directions', () => {
      const rotations: Rotation[] = ['left', 'up', 'right', 'down'];
      expect(rotations.length).toBe(4);
      rotations.forEach(r => {
        expect(['left', 'up', 'right', 'down']).toContain(r);
      });
    });
  });

  describe('IconConfig', () => {
    it('should create a valid icon config', () => {
      const config: IconConfig = {
        id: 'test-icon',
        capacity: 1,
        size: { width: 1, height: 1 },
        name: 'Test Icon',
        svg: '<rect />',
        color: '#FF0000'
      };
      
      expect(config.id).toBe('test-icon');
      expect(config.capacity).toBe(1);
      expect(config.size.width).toBe(1);
      expect(config.size.height).toBe(1);
      expect(config.name).toBe('Test Icon');
      expect(config.svg).toBe('<rect />');
      expect(config.color).toBe('#FF0000');
    });

    it('should require all properties', () => {
      const config: IconConfig = {
        id: 'icon-1',
        capacity: 0,
        size: { width: 2, height: 2 },
        name: 'Table',
        svg: '<circle />',
        color: '#E8B4A2'
      };
      
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('capacity');
      expect(config).toHaveProperty('size');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('svg');
      expect(config).toHaveProperty('color');
    });

    it('should support multi-grid seat sizing', () => {
      const multiGridConfig: IconConfig = {
        id: 'couch-3',
        capacity: 3,
        size: { width: 3, height: 1 },
        name: 'Couch',
        svg: '<rect />',
        color: '#A0522D'
      };
      
      expect(multiGridConfig.size.width).toBe(3);
      expect(multiGridConfig.size.height).toBe(1);
    });

    it('should support varying capacity levels', () => {
      const configs: IconConfig[] = [
        {
          id: 'table-0',
          capacity: 0,
          size: { width: 2, height: 2 },
          name: 'Table',
          svg: '<circle />',
          color: '#E8B4A2'
        },
        {
          id: 'chair-1',
          capacity: 1,
          size: { width: 1, height: 1 },
          name: 'Chair',
          svg: '<rect />',
          color: '#8B4513'
        },
        {
          id: 'couch-3',
          capacity: 3,
          size: { width: 3, height: 1 },
          name: 'Couch',
          svg: '<rect />',
          color: '#A0522D'
        }
      ];

      expect(configs[0].capacity).toBe(0);
      expect(configs[1].capacity).toBe(1);
      expect(configs[2].capacity).toBe(3);
    });
  });
});
