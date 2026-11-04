/**
 * Color Type Definitions
 * Defines color representation with hex, RGB, and contrast-aware text color
 */

/**
 * Color represents a color value with multiple formats and contrast information
 * - hex: CSS hex color string (e.g., '#FF0000')
 * - rgb: RGB components (0-255 each)
 * - text: 'white' or 'black' for contrast with this color
 */
export interface Color {
  hex: string;                // hex color value (e.g., '#FF0000')
  rgb: {
    r: number;  // red component (0-255)
    g: number;  // green component (0-255)
    b: number;  // blue component (0-255)
  };
  text: 'white' | 'black';    // text color for contrast
}

/**
 * Creates a Color object from hex and rgb values
 * @param hex - hex color string (e.g., '#FF0000')
 * @param r - red component (0-255)
 * @param g - green component (0-255)
 * @param b - blue component (0-255)
 * @param text - text color for contrast ('white' or 'black')
 * @returns a new Color object
 */
export function createColor(
  hex: string,
  r: number,
  g: number,
  b: number,
  text: 'white' | 'black' = 'black',
): Color {
  return {
    hex,
    rgb: { r, g, b },
    text,
  };
}

/**
 * Converts RGB to HSL format for color manipulation
 * @param r - red component (0-255)
 * @param g - green component (0-255)
 * @param b - blue component (0-255)
 * @returns object with h (0-360), s (0-100), l (0-100)
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to RGB format
 * @param h - hue (0-360)
 * @param s - saturation (0-100)
 * @param l - lightness (0-100)
 * @returns object with r, g, b (each 0-255)
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts RGB to hex format
 * @param r - red component (0-255)
 * @param g - green component (0-255)
 * @param b - blue component (0-255)
 * @returns hex color string (e.g., '#FF0000')
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (val: number) => {
    const hex = Math.round(val).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculates the relative luminance of an RGB color (WCAG formula)
 * Used to determine if white or black text provides better contrast
 * @param r - red component (0-255)
 * @param g - green component (0-255)
 * @param b - blue component (0-255)
 * @returns luminance value (0-1)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Apply gamma correction
  const rs = rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4);
  const gs = gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4);
  const bs = bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4);

  // WCAG relative luminance formula
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determines the best text color (white or black) for contrast with a given RGB color
 * @param r - red component (0-255)
 * @param g - green component (0-255)
 * @param b - blue component (0-255)
 * @returns 'white' or 'black'
 */
export function getContrastTextColor(r: number, g: number, b: number): 'white' | 'black' {
  const luminance = calculateLuminance(r, g, b);
  // Use black text on light backgrounds, white on dark backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}
