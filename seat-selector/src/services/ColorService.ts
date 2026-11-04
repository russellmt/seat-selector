import type { Color } from '../types';
import { createColor, hslToRgb, rgbToHex, getContrastTextColor } from '../types';

/**
 * ColorService provides deterministic color generation for guests based on their names
 * Uses a hash-based seeding algorithm to ensure consistent color assignment across sessions
 */
export class ColorService {
  /**
   * Generates a deterministic color for a guest based on their name
   * Same name always produces the same color
   *
   * @param guestName - The guest's name
   * @returns A Color object with hex, RGB, and appropriate text color for contrast
   */
  generateColor(guestName: string): Color {
    const seed = this.hashName(guestName);

    // Extract H, S, L from seed using modulo arithmetic
    // Hue: (seed % 360) - gives 360 possible hue values
    // Saturation: ((seed >> 8) % 40) + 60 - gives 60-100% saturation
    // Lightness: ((seed >> 16) % 30) + 45 - gives 45-75% lightness
    const h = seed % 360;
    const s = ((seed >> 8) % 40) + 60;
    const l = ((seed >> 16) % 30) + 45;

    // Convert HSL to RGB
    const rgb = this.hslToRgb(h, s, l);

    // Convert RGB to hex
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Determine text color for contrast
    const textColor = getContrastTextColor(rgb.r, rgb.g, rgb.b);

    return createColor(hex, rgb.r, rgb.g, rgb.b, textColor);
  }

  /**
   * Creates a deterministic numeric seed from a guest name using a simple hash algorithm
   * Same name always produces the same seed
   *
   * @param name - The guest's name
   * @returns A numeric seed value (0-0xFFFFFF range, but can be larger)
   */
  hashName(name: string): number {
    let hash = 0;

    // Simple hash function: iterate through each character and accumulate
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      // Use bitwise left shift and add to create a more distributed hash
      hash = ((hash << 5) - hash) + char;
      // Convert to 32-bit integer to ensure consistency across JavaScript engines
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert negative hash to positive by using absolute value
    return Math.abs(hash);
  }

  /**
   * Converts HSL (Hue, Saturation, Lightness) to RGB (Red, Green, Blue)
   * HSL values: H (0-360), S (0-100), L (0-100)
   * Returns RGB values in range 0-255
   *
   * @param h - Hue (0-360)
   * @param s - Saturation (0-100)
   * @param l - Lightness (0-100)
   * @returns Object with r, g, b values (each 0-255)
   */
  hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    return hslToRgb(h, s, l);
  }

  /**
   * Determines the appropriate text color (white or black) for contrast with an RGB background
   * Uses relative luminance calculation based on WCAG AA standards
   *
   * @param rgb - RGB color object with r, g, b values (0-255 each)
   * @returns 'white' or 'black' for optimal contrast
   */
  getContrastTextColor(
    rgb: { r: number; g: number; b: number }
  ): 'white' | 'black' {
    return getContrastTextColor(rgb.r, rgb.g, rgb.b);
  }
}

/**
 * Singleton instance of ColorService for application-wide use
 */
export const colorService = new ColorService();
