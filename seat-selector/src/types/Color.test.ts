import { describe, it, expect } from 'vitest';
import {
  createColor,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  calculateLuminance,
  getContrastTextColor,
} from './Color';

describe('Color Types and Utilities', () => {
  describe('createColor', () => {
    it('should create a color with all properties', () => {
      const color = createColor('#FF0000', 255, 0, 0, 'white');

      expect(color.hex).toBe('#FF0000');
      expect(color.rgb.r).toBe(255);
      expect(color.rgb.g).toBe(0);
      expect(color.rgb.b).toBe(0);
      expect(color.text).toBe('white');
    });

    it('should default to black text', () => {
      const color = createColor('#FFFFFF', 255, 255, 255);
      expect(color.text).toBe('black');
    });

    it('should accept white and black text colors', () => {
      const colorWhite = createColor('#000000', 0, 0, 0, 'white');
      const colorBlack = createColor('#FFFFFF', 255, 255, 255, 'black');

      expect(colorWhite.text).toBe('white');
      expect(colorBlack.text).toBe('black');
    });
  });

  describe('rgbToHex', () => {
    it('should convert pure red', () => {
      const hex = rgbToHex(255, 0, 0);
      expect(hex).toBe('#FF0000');
    });

    it('should convert pure green', () => {
      const hex = rgbToHex(0, 255, 0);
      expect(hex).toBe('#00FF00');
    });

    it('should convert pure blue', () => {
      const hex = rgbToHex(0, 0, 255);
      expect(hex).toBe('#0000FF');
    });

    it('should convert black', () => {
      const hex = rgbToHex(0, 0, 0);
      expect(hex).toBe('#000000');
    });

    it('should convert white', () => {
      const hex = rgbToHex(255, 255, 255);
      expect(hex).toBe('#FFFFFF');
    });

    it('should pad hex values with leading zeros', () => {
      const hex = rgbToHex(1, 2, 3);
      expect(hex).toBe('#010203');
    });

    it('should handle middle-range values', () => {
      const hex = rgbToHex(128, 64, 192);
      expect(hex).toBe('#8040C0');
    });
  });

  describe('calculateLuminance', () => {
    it('should return 0 for black', () => {
      const lum = calculateLuminance(0, 0, 0);
      expect(lum).toBeCloseTo(0, 5);
    });

    it('should return 1 for white', () => {
      const lum = calculateLuminance(255, 255, 255);
      expect(lum).toBeCloseTo(1, 2);
    });

    it('should return lower luminance for dark colors', () => {
      const darkLum = calculateLuminance(64, 64, 64);
      const lightLum = calculateLuminance(192, 192, 192);
      expect(darkLum).toBeLessThan(lightLum);
    });

    it('should handle red', () => {
      const lum = calculateLuminance(255, 0, 0);
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  describe('getContrastTextColor', () => {
    it('should return white for dark colors', () => {
      const color = getContrastTextColor(0, 0, 0);
      expect(color).toBe('white');
    });

    it('should return black for light colors', () => {
      const color = getContrastTextColor(255, 255, 255);
      expect(color).toBe('black');
    });

    it('should return black for light gray', () => {
      const color = getContrastTextColor(200, 200, 200);
      expect(color).toBe('black');
    });

    it('should return white for dark gray', () => {
      const color = getContrastTextColor(50, 50, 50);
      expect(color).toBe('white');
    });

    it('should provide consistent results', () => {
      const color1 = getContrastTextColor(100, 150, 200);
      const color2 = getContrastTextColor(100, 150, 200);
      expect(color1).toBe(color2);
    });
  });

  describe('rgbToHsl and hslToRgb roundtrip', () => {
    it('should convert red correctly', () => {
      const hsl = rgbToHsl(255, 0, 0);
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('should convert gray correctly', () => {
      const hsl = rgbToHsl(128, 128, 128);
      expect(hsl.s).toBe(0); // gray has no saturation
      expect(hsl.l).toBeCloseTo(50, 0);
    });

    it('should roundtrip RGB to HSL to RGB', () => {
      const original = { r: 100, g: 150, b: 200 };
      const hsl = rgbToHsl(original.r, original.g, original.b);
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

      // Allow 1 unit tolerance due to rounding
      expect(Math.abs(rgb.r - original.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(rgb.g - original.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(rgb.b - original.b)).toBeLessThanOrEqual(1);
    });

    it('should roundtrip HSL to RGB to HSL', () => {
      const original = { h: 120, s: 50, l: 50 };
      const rgb = hslToRgb(original.h, original.s, original.l);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      // Allow small tolerance due to rounding
      expect(Math.abs(hsl.h - original.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsl.s - original.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsl.l - original.l)).toBeLessThanOrEqual(1);
    });
  });

  describe('Color range constraints', () => {
    it('should handle boundary RGB values', () => {
      const color1 = createColor('#000000', 0, 0, 0);
      const color2 = createColor('#FFFFFF', 255, 255, 255);

      expect(color1.rgb.r).toBe(0);
      expect(color2.rgb.b).toBe(255);
    });

    it('should handle boundary HSL values', () => {
      const rgb1 = hslToRgb(0, 0, 0); // black
      const rgb2 = hslToRgb(0, 0, 100); // white
      const rgb3 = hslToRgb(360, 100, 50); // red

      expect(rgb1.r).toBeLessThanOrEqual(10); // close to black
      expect(rgb2.r).toBeGreaterThanOrEqual(240); // close to white
      expect(rgb3.r).toBeGreaterThan(200); // red component dominant
    });
  });
});
