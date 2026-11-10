import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSeatingConfiguration,
  createGuestArrangement,
  updateConfigurationLastModified,
} from './Configuration';
import { createSeat, createGridPosition } from './Seat';
import { createGuest } from './Guest';
import { createColor } from './Color';

describe('Configuration Types and Utilities', () => {
  describe('createSeatingConfiguration', () => {
    it('should create a configuration with default values', () => {
      const config = createSeatingConfiguration();

      expect(config.title).toBe('');
      expect(config.seats).toEqual([]);
      expect(config.createdAt).toBeInstanceOf(Date);
      expect(config.lastModified).toBeInstanceOf(Date);
    });

    it('should create a configuration with title', () => {
      const config = createSeatingConfiguration('My Event');

      expect(config.title).toBe('My Event');
      expect(config.seats).toEqual([]);
    });

    it('should create a configuration with seats', () => {
      const seat1 = createSeat('chair-1', createGridPosition(0, 0), 'down');
      const seat2 = createSeat('chair-1', createGridPosition(1, 0), 'down');
      const seats = [seat1, seat2];

      const config = createSeatingConfiguration('My Event', seats);

      expect(config.title).toBe('My Event');
      expect(config.seats).toEqual(seats);
      expect(config.seats.length).toBe(2);
    });

    it('should set createdAt and lastModified to current time', () => {
      const beforeTime = new Date();
      const config = createSeatingConfiguration('Test');
      const afterTime = new Date();

      expect(config.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(config.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(config.lastModified.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(config.lastModified.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should initialize createdAt and lastModified to the same time', () => {
      const config = createSeatingConfiguration();
      expect(config.createdAt.getTime()).toBe(config.lastModified.getTime());
    });
  });

  describe('createGuestArrangement', () => {
    beforeEach(() => {
      // Setup is done in each test
    });

    it('should create an arrangement with all properties', () => {
      const config = createSeatingConfiguration('My Event');
      const arrangement = createGuestArrangement('Wedding Reception', config);

      expect(arrangement.name).toBe('Wedding Reception');
      expect(arrangement.configuration).toEqual(config);
      expect(arrangement.guests).toEqual([]);
      expect(arrangement.assignments.size).toBe(0);
      expect(arrangement.sortOrder).toBe('original');
    });

    it('should create an arrangement with guests', () => {
      const config = createSeatingConfiguration('My Event');
      const color = createColor('#FF0000', 255, 0, 0);
      const guest1 = createGuest('John Smith', color);
      const guest2 = createGuest('Jane Doe', color);
      const guests = [guest1, guest2];

      const arrangement = createGuestArrangement('Wedding Reception', config, guests);

      expect(arrangement.guests).toEqual(guests);
      expect(arrangement.guests.length).toBe(2);
    });

    it('should accept custom sort order', () => {
      const config = createSeatingConfiguration('My Event');
      const arrangement = createGuestArrangement(
        'Wedding Reception',
        config,
        [],
        'alphabetical-asc',
      );

      expect(arrangement.sortOrder).toBe('alphabetical-asc');
    });

    it('should default to original sort order', () => {
      const config = createSeatingConfiguration('My Event');
      const arrangement = createGuestArrangement('Wedding Reception', config);

      expect(arrangement.sortOrder).toBe('original');
    });

    it('should create empty assignments map', () => {
      const config = createSeatingConfiguration('My Event');
      const arrangement = createGuestArrangement('Wedding Reception', config);

      expect(arrangement.assignments).toBeInstanceOf(Map);
      expect(arrangement.assignments.size).toBe(0);
    });
  });

  describe('updateConfigurationLastModified', () => {
    it('should create a new configuration with updated lastModified', async () => {
      const config1 = createSeatingConfiguration('Original');

      // Wait a bit to ensure different timestamp
      const delay = new Promise((resolve) => setTimeout(resolve, 10));
      await delay;

      const config2 = updateConfigurationLastModified(config1);

      expect(config2.title).toBe(config1.title);
      expect(config2.createdAt).toBe(config1.createdAt);
      expect(config2.lastModified.getTime()).toBeGreaterThanOrEqual(
        config1.lastModified.getTime(),
      );
    });

    it('should not mutate original configuration', () => {
      const config1 = createSeatingConfiguration('Original');
      const originalTime = config1.lastModified.getTime();

      updateConfigurationLastModified(config1);

      expect(config1.lastModified.getTime()).toBe(originalTime);
    });

    it('should preserve seats in configuration', () => {
      const seat1 = createSeat('chair-1', createGridPosition(0, 0), 'down');
      const seat2 = createSeat('chair-1', createGridPosition(1, 0), 'down');
      const config1 = createSeatingConfiguration('Test', [seat1, seat2]);

      const config2 = updateConfigurationLastModified(config1);

      expect(config2.seats).toEqual([seat1, seat2]);
      expect(config2.seats.length).toBe(2);
    });
  });

  describe('Type safety', () => {
    it('should enforce SortOrder type', () => {
      const config = createSeatingConfiguration('Test');
      const arrangement = createGuestArrangement('Test', config, [], 'alphabetical-asc');

      expect(['original', 'alphabetical-asc', 'alphabetical-desc']).toContain(
        arrangement.sortOrder,
      );
    });

    it('should maintain configuration immutability', () => {
      const seats = [createSeat('chair-1', createGridPosition(0, 0), 'down')];
      const config = createSeatingConfiguration('Test', seats);

      // Verify seats array wasn't mutated
      expect(config.seats).toEqual(seats);

      // Create new configuration and verify seats match
      const config2 = createSeatingConfiguration('Test 2', config.seats);
      expect(config2.seats[0].id).toBe(config.seats[0].id);
    });
  });
});
