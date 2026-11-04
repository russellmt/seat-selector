import { describe, it, expect } from 'vitest';
import {
  // Grid constants
  GRID_SQUARE_SIZE_PX,
  GRID_LINE_COLOR,
  GRID_LINE_OPACITY,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  GRID_LINE_WIDTH,
  GRID_LINE_DASH_ARRAY,
  // Icon capacity constants
  TABLE_CAPACITY_CONFIG,
  CHAIR_CAPACITY_CONFIG,
  LOVESEAT_CAPACITY_CONFIG,
  COUCH_CAPACITY_CONFIG,
  CAPACITY_CONFIG_MAP,
  AVAILABLE_CAPACITIES,
  // Sort order constants
  SORT_ORDERS,
  DEFAULT_SORT_ORDER,
  SORT_ORDER_CYCLE,
  SORT_ORDER_LABELS,
} from '../index';

describe('Grid Constants', () => {
  it('should have GRID_SQUARE_SIZE_PX set to 24 pixels', () => {
    expect(GRID_SQUARE_SIZE_PX).toBe(24);
  });

  it('should have GRID_LINE_COLOR set to light blue', () => {
    expect(GRID_LINE_COLOR).toBe('#87CEEB');
  });

  it('should have GRID_LINE_OPACITY set to 0.3', () => {
    expect(GRID_LINE_OPACITY).toBe(0.3);
  });

  it('should have DEFAULT_CANVAS_WIDTH set to 1920 pixels', () => {
    expect(DEFAULT_CANVAS_WIDTH).toBe(1920);
  });

  it('should have DEFAULT_CANVAS_HEIGHT set to 1080 pixels', () => {
    expect(DEFAULT_CANVAS_HEIGHT).toBe(1080);
  });

  it('should have GRID_LINE_WIDTH set to 1 pixel', () => {
    expect(GRID_LINE_WIDTH).toBe(1);
  });

  it('should have GRID_LINE_DASH_ARRAY set for dash pattern', () => {
    expect(GRID_LINE_DASH_ARRAY).toBe('2,2');
  });

  it('GRID_LINE_OPACITY should be between 0 and 1', () => {
    expect(GRID_LINE_OPACITY).toBeGreaterThanOrEqual(0);
    expect(GRID_LINE_OPACITY).toBeLessThanOrEqual(1);
  });

  it('GRID_SQUARE_SIZE_PX should approximate 0.75 cm at 96 DPI', () => {
    // At 96 DPI: 1 inch = 96 pixels, 1 cm ≈ 0.3937 inches
    // 0.75 cm ≈ 0.2953 inches ≈ 28.3 pixels
    // 24 pixels is a reasonable approximation for 0.75 cm at standard zoom
    expect(GRID_SQUARE_SIZE_PX).toBeGreaterThan(20);
    expect(GRID_SQUARE_SIZE_PX).toBeLessThan(30);
  });
});

describe('Icon Capacity Constants', () => {
  it('should have TABLE_CAPACITY_CONFIG with 2x2 footprint', () => {
    expect(TABLE_CAPACITY_CONFIG.width).toBe(2);
    expect(TABLE_CAPACITY_CONFIG.height).toBe(2);
  });

  it('should have CHAIR_CAPACITY_CONFIG with 1x1 footprint', () => {
    expect(CHAIR_CAPACITY_CONFIG.width).toBe(1);
    expect(CHAIR_CAPACITY_CONFIG.height).toBe(1);
  });

  it('should have LOVESEAT_CAPACITY_CONFIG with 2x1 footprint', () => {
    expect(LOVESEAT_CAPACITY_CONFIG.width).toBe(2);
    expect(LOVESEAT_CAPACITY_CONFIG.height).toBe(1);
  });

  it('should have COUCH_CAPACITY_CONFIG with 3x1 footprint', () => {
    expect(COUCH_CAPACITY_CONFIG.width).toBe(3);
    expect(COUCH_CAPACITY_CONFIG.height).toBe(1);
  });

  it('CAPACITY_CONFIG_MAP should map capacity 0 to table config', () => {
    expect(CAPACITY_CONFIG_MAP[0]).toEqual(TABLE_CAPACITY_CONFIG);
  });

  it('CAPACITY_CONFIG_MAP should map capacity 1 to chair config', () => {
    expect(CAPACITY_CONFIG_MAP[1]).toEqual(CHAIR_CAPACITY_CONFIG);
  });

  it('CAPACITY_CONFIG_MAP should map capacity 2 to loveseat config', () => {
    expect(CAPACITY_CONFIG_MAP[2]).toEqual(LOVESEAT_CAPACITY_CONFIG);
  });

  it('CAPACITY_CONFIG_MAP should map capacity 3 to couch config', () => {
    expect(CAPACITY_CONFIG_MAP[3]).toEqual(COUCH_CAPACITY_CONFIG);
  });

  it('AVAILABLE_CAPACITIES should contain all capacities in order', () => {
    expect(AVAILABLE_CAPACITIES).toEqual([0, 1, 2, 3]);
  });

  it('all capacity configs should have positive width and height', () => {
    [TABLE_CAPACITY_CONFIG, CHAIR_CAPACITY_CONFIG, LOVESEAT_CAPACITY_CONFIG, COUCH_CAPACITY_CONFIG].forEach(
      (config) => {
        expect(config.width).toBeGreaterThan(0);
        expect(config.height).toBeGreaterThan(0);
      }
    );
  });

  it('icon sizes should scale proportionally with capacity', () => {
    // Table (capacity 0): 2x2 = 4 squares
    expect(TABLE_CAPACITY_CONFIG.width * TABLE_CAPACITY_CONFIG.height).toBe(4);
    // Chair (capacity 1): 1x1 = 1 square
    expect(CHAIR_CAPACITY_CONFIG.width * CHAIR_CAPACITY_CONFIG.height).toBe(1);
    // Loveseat (capacity 2): 2x1 = 2 squares
    expect(LOVESEAT_CAPACITY_CONFIG.width * LOVESEAT_CAPACITY_CONFIG.height).toBe(2);
    // Couch (capacity 3): 3x1 = 3 squares
    expect(COUCH_CAPACITY_CONFIG.width * COUCH_CAPACITY_CONFIG.height).toBe(3);
  });
});

describe('Sort Order Constants', () => {
  it('should have SORT_ORDERS.ORIGINAL equal to "original"', () => {
    expect(SORT_ORDERS.ORIGINAL).toBe('original');
  });

  it('should have SORT_ORDERS.ALPHABETICAL_ASC equal to "alphabetical-asc"', () => {
    expect(SORT_ORDERS.ALPHABETICAL_ASC).toBe('alphabetical-asc');
  });

  it('should have SORT_ORDERS.ALPHABETICAL_DESC equal to "alphabetical-desc"', () => {
    expect(SORT_ORDERS.ALPHABETICAL_DESC).toBe('alphabetical-desc');
  });

  it('should have DEFAULT_SORT_ORDER set to original', () => {
    expect(DEFAULT_SORT_ORDER).toBe(SORT_ORDERS.ORIGINAL);
  });

  it('SORT_ORDER_CYCLE should contain all sort orders', () => {
    expect(SORT_ORDER_CYCLE).toContain(SORT_ORDERS.ORIGINAL);
    expect(SORT_ORDER_CYCLE).toContain(SORT_ORDERS.ALPHABETICAL_ASC);
    expect(SORT_ORDER_CYCLE).toContain(SORT_ORDERS.ALPHABETICAL_DESC);
  });

  it('SORT_ORDER_CYCLE should have exactly 3 entries', () => {
    expect(SORT_ORDER_CYCLE.length).toBe(3);
  });

  it('SORT_ORDER_CYCLE should start with ORIGINAL', () => {
    expect(SORT_ORDER_CYCLE[0]).toBe(SORT_ORDERS.ORIGINAL);
  });

  it('SORT_ORDER_LABELS should have labels for all sort orders', () => {
    expect(SORT_ORDER_LABELS[SORT_ORDERS.ORIGINAL]).toBeDefined();
    expect(SORT_ORDER_LABELS[SORT_ORDERS.ALPHABETICAL_ASC]).toBeDefined();
    expect(SORT_ORDER_LABELS[SORT_ORDERS.ALPHABETICAL_DESC]).toBeDefined();
  });

  it('SORT_ORDER_LABELS should contain appropriate text descriptions', () => {
    expect(typeof SORT_ORDER_LABELS[SORT_ORDERS.ORIGINAL]).toBe('string');
    expect(SORT_ORDER_LABELS[SORT_ORDERS.ORIGINAL].length).toBeGreaterThan(0);
    expect(SORT_ORDER_LABELS[SORT_ORDERS.ALPHABETICAL_ASC].length).toBeGreaterThan(0);
    expect(SORT_ORDER_LABELS[SORT_ORDERS.ALPHABETICAL_DESC].length).toBeGreaterThan(0);
  });
});

describe('Constants Requirements Validation', () => {
  describe('Requirement 2.1: Grid Display', () => {
    it('grid square size should approximate 0.75 cm at default zoom', () => {
      // 24 pixels at 96 DPI ≈ 0.75 cm
      expect(GRID_SQUARE_SIZE_PX).toBe(24);
    });
  });

  describe('Requirement 2.3: Grid Lines Visibility', () => {
    it('grid line color should be light blue', () => {
      expect(GRID_LINE_COLOR).toBe('#87CEEB');
    });

    it('grid line opacity should not interfere with visibility', () => {
      // 0.3 opacity (30%) is subtle enough to not interfere
      expect(GRID_LINE_OPACITY).toBe(0.3);
    });
  });

  describe('Requirement 4.2: Icon Organization by Capacity', () => {
    it('AVAILABLE_CAPACITIES should be ordered by increasing capacity', () => {
      for (let i = 0; i < AVAILABLE_CAPACITIES.length - 1; i++) {
        expect(AVAILABLE_CAPACITIES[i]).toBeLessThan(AVAILABLE_CAPACITIES[i + 1]);
      }
    });
  });

  describe('Requirement 4.4: Capacity Labels and Visual Indicators', () => {
    it('CAPACITY_CONFIG_MAP should provide sizing for all capacity types', () => {
      AVAILABLE_CAPACITIES.forEach((capacity) => {
        expect(CAPACITY_CONFIG_MAP[capacity]).toBeDefined();
        expect(CAPACITY_CONFIG_MAP[capacity].width).toBeGreaterThan(0);
        expect(CAPACITY_CONFIG_MAP[capacity].height).toBeGreaterThan(0);
      });
    });

    it('icon sizes should be in CAPACITY_CONFIG_MAP', () => {
      expect(CAPACITY_CONFIG_MAP).toHaveProperty('0');
      expect(CAPACITY_CONFIG_MAP).toHaveProperty('1');
      expect(CAPACITY_CONFIG_MAP).toHaveProperty('2');
      expect(CAPACITY_CONFIG_MAP).toHaveProperty('3');
    });
  });

  describe('Requirement 11: Icon Sizing by Seating Capacity', () => {
    it('0-person table should occupy 2x2 grid squares', () => {
      expect(CAPACITY_CONFIG_MAP[0].width).toBe(2);
      expect(CAPACITY_CONFIG_MAP[0].height).toBe(2);
    });

    it('1-person chair should occupy 1x1 grid squares', () => {
      expect(CAPACITY_CONFIG_MAP[1].width).toBe(1);
      expect(CAPACITY_CONFIG_MAP[1].height).toBe(1);
    });

    it('2-person loveseat should occupy 2x1 grid squares', () => {
      expect(CAPACITY_CONFIG_MAP[2].width).toBe(2);
      expect(CAPACITY_CONFIG_MAP[2].height).toBe(1);
    });

    it('3-person couch should occupy 3x1 grid squares', () => {
      expect(CAPACITY_CONFIG_MAP[3].width).toBe(3);
      expect(CAPACITY_CONFIG_MAP[3].height).toBe(1);
    });
  });
});
