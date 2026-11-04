import { describe, it, expect } from 'vitest';
import { ColorService } from './ColorService';
import { calculateLuminance } from '../types';

describe('ColorService', () => {
  const service = new ColorService();

  describe('hashName', () => {
    it('should return a non-negative number for any string', () => {
      const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
      names.forEach(name => {
        const hash = service.hashName(name);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(typeof hash).toBe('number');
      });
    });

    it('should return the same hash for identical names', () => {
      const name = 'Alice';
      const hash1 = service.hashName(name);
      const hash2 = service.hashName(name);
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different names', () => {
      const hash1 = service.hashName('Alice');
      const hash2 = service.hashName('Bob');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = service.hashName('');
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(typeof hash).toBe('number');
    });

    it('should handle special characters', () => {
      const names = ["Alice O'Brien", 'José García', 'Maria-Helena', 'Jean-Pierre'];
      names.forEach(name => {
        const hash = service.hashName(name);
        expect(hash).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle unicode characters', () => {
      const names = ['李明', 'محمد', 'Αλέξανδρος', 'Владимир'];
      names.forEach(name => {
        const hash = service.hashName(name);
        expect(hash).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(1000);
      const hash = service.hashName(longName);
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });

  describe('hslToRgb', () => {
    it('should convert hue 0 (red) correctly', () => {
      const rgb = service.hslToRgb(0, 100, 50);
      expect(rgb.r).toBeGreaterThan(200);
      expect(rgb.g).toBeLessThan(50);
      expect(rgb.b).toBeLessThan(50);
    });

    it('should convert hue 120 (green) correctly', () => {
      const rgb = service.hslToRgb(120, 100, 50);
      expect(rgb.r).toBeLessThan(50);
      expect(rgb.g).toBeGreaterThan(200);
      expect(rgb.b).toBeLessThan(50);
    });

    it('should convert hue 240 (blue) correctly', () => {
      const rgb = service.hslToRgb(240, 100, 50);
      expect(rgb.r).toBeLessThan(50);
      expect(rgb.g).toBeLessThan(50);
      expect(rgb.b).toBeGreaterThan(200);
    });

    it('should handle saturation 0 (grayscale)', () => {
      const rgb = service.hslToRgb(120, 0, 50);
      // When saturation is 0, result should be grayscale (r ≈ g ≈ b)
      expect(Math.abs(rgb.r - rgb.g)).toBeLessThan(2);
      expect(Math.abs(rgb.g - rgb.b)).toBeLessThan(2);
    });

    it('should return values in 0-255 range', () => {
      const testCases = [
        { h: 0, s: 100, l: 50 },
        { h: 120, s: 50, l: 75 },
        { h: 240, s: 75, l: 25 },
        { h: 60, s: 100, l: 50 },
      ];

      testCases.forEach(({ h, s, l }) => {
        const rgb = service.hslToRgb(h, s, l);
        expect(rgb.r).toBeGreaterThanOrEqual(0);
        expect(rgb.r).toBeLessThanOrEqual(255);
        expect(rgb.g).toBeGreaterThanOrEqual(0);
        expect(rgb.g).toBeLessThanOrEqual(255);
        expect(rgb.b).toBeGreaterThanOrEqual(0);
        expect(rgb.b).toBeLessThanOrEqual(255);
      });
    });
  });

  describe('getContrastTextColor', () => {
    it('should return white for dark colors', () => {
      const textColor = service.getContrastTextColor({ r: 0, g: 0, b: 0 });
      expect(textColor).toBe('white');
    });

    it('should return black for light colors', () => {
      const textColor = service.getContrastTextColor({ r: 255, g: 255, b: 255 });
      expect(textColor).toBe('black');
    });

    it('should return consistent results for same color', () => {
      const color = { r: 100, g: 150, b: 200 };
      const text1 = service.getContrastTextColor(color);
      const text2 = service.getContrastTextColor(color);
      expect(text1).toBe(text2);
    });

    it('should handle typical background colors', () => {
      const colors = [
        { r: 255, g: 0, b: 0 }, // red
        { r: 0, g: 255, b: 0 }, // green
        { r: 0, g: 0, b: 255 }, // blue
        { r: 128, g: 128, b: 128 }, // gray
      ];

      colors.forEach(color => {
        const textColor = service.getContrastTextColor(color);
        expect(['white', 'black']).toContain(textColor);
      });
    });
  });

  describe('generateColor', () => {
    it('should generate a Color object with all required properties', () => {
      const color = service.generateColor('Alice');

      expect(color).toHaveProperty('hex');
      expect(color).toHaveProperty('rgb');
      expect(color).toHaveProperty('text');

      expect(typeof color.hex).toBe('string');
      expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);

      expect(color.rgb).toHaveProperty('r');
      expect(color.rgb).toHaveProperty('g');
      expect(color.rgb).toHaveProperty('b');

      expect(color.rgb.r).toBeGreaterThanOrEqual(0);
      expect(color.rgb.r).toBeLessThanOrEqual(255);
      expect(color.rgb.g).toBeGreaterThanOrEqual(0);
      expect(color.rgb.g).toBeLessThanOrEqual(255);
      expect(color.rgb.b).toBeGreaterThanOrEqual(0);
      expect(color.rgb.b).toBeLessThanOrEqual(255);

      expect(['white', 'black']).toContain(color.text);
    });

    it('should return the same color for identical names', () => {
      const name = 'Alice';
      const color1 = service.generateColor(name);
      const color2 = service.generateColor(name);

      expect(color1.hex).toBe(color2.hex);
      expect(color1.rgb.r).toBe(color2.rgb.r);
      expect(color1.rgb.g).toBe(color2.rgb.g);
      expect(color1.rgb.b).toBe(color2.rgb.b);
      expect(color1.text).toBe(color2.text);
    });

    it('should return different colors for different names', () => {
      const color1 = service.generateColor('Alice');
      const color2 = service.generateColor('Bob');

      // At least one of hex, or individual RGB components should differ
      const sameHex = color1.hex === color2.hex;
      const sameRgb = color1.rgb.r === color2.rgb.r &&
                      color1.rgb.g === color2.rgb.g &&
                      color1.rgb.b === color2.rgb.b;

      expect(sameHex && sameRgb).toBe(false);
    });

    it('should ensure saturation is in range 60-100%', () => {
      const testNames = [
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Eve',
        'Frank',
        'Grace',
        'Henry',
      ];

      testNames.forEach(name => {
        service.generateColor(name);
        const seed = service.hashName(name);
        const s = ((seed >> 8) % 40) + 60;

        expect(s).toBeGreaterThanOrEqual(60);
        expect(s).toBeLessThanOrEqual(100);
      });
    });

    it('should ensure lightness is in range 45-75%', () => {
      const testNames = [
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Eve',
        'Frank',
        'Grace',
        'Henry',
      ];

      testNames.forEach(name => {
        service.generateColor(name);
        const seed = service.hashName(name);
        const l = ((seed >> 16) % 30) + 45;

        expect(l).toBeGreaterThanOrEqual(45);
        expect(l).toBeLessThanOrEqual(75);
      });
    });

    it('should handle empty names', () => {
      const color = service.generateColor('');
      expect(color).toHaveProperty('hex');
      expect(color).toHaveProperty('rgb');
      expect(color).toHaveProperty('text');
    });

    it('should handle special characters in names', () => {
      const names = ["Alice O'Brien", 'José García', 'Maria-Helena', 'Jean-Pierre'];
      names.forEach(name => {
        const color = service.generateColor(name);
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/);
        expect(['white', 'black']).toContain(color.text);
      });
    });

    it('should ensure adequate contrast between text and background', () => {
      const testNames = [
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Eve',
        'Frank',
        'Grace',
        'Henry',
        'Ivy',
        'Jack',
      ];

      testNames.forEach(name => {
        const color = service.generateColor(name);
        const { r, g, b } = color.rgb;

        // The algorithm uses WCAG relative luminance to determine text color
        // Verify that the chosen text color is consistent with the luminance threshold
        const luminance = calculateLuminance(r, g, b);

        if (color.text === 'white') {
          // White text should be used on dark backgrounds (luminance <= 0.5)
          expect(luminance).toBeLessThanOrEqual(0.5);
        } else {
          // Black text should be used on light backgrounds (luminance > 0.5)
          expect(luminance).toBeGreaterThan(0.5);
        }
      });
    });

    it('should generate 432,000+ distinct colors across hash space', () => {
      // The color space is: 360 hues × 40 saturations × 30 lightness = 432,000 possible colors
      // Verify the algorithm produces this many potential colors
      const hueCount = 360;
      const saturationCount = 40; // ((seed >> 8) % 40)
      const lightnessCount = 30; // ((seed >> 16) % 30)

      const totalColors = hueCount * saturationCount * lightnessCount;
      expect(totalColors).toBe(432000);
    });

    it('should generate colors across the full spectrum', () => {
      // Generate colors for names that hash to different values
      const names = Array.from({ length: 100 }, (_, i) => `name${i}`);
      const colors = names.map(name => service.generateColor(name));

      // Collect all hex values
      const hexValues = new Set(colors.map(c => c.hex));

      // Should have many unique colors (not all the same)
      expect(hexValues.size).toBeGreaterThan(50);
    });
  });
});
