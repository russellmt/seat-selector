/**
 * Helper functions for IconConfig migration
 * These utilities help with backward compatibility and type safety
 */
import { normalizeIconConfig } from './Icon';
import type { IconConfig, IconConfigInput } from './Icon';

/**
 * Create an IconConfig with automatic SVG normalization
 * Handles both old (svg: string) and new (visual: { type, content/url }) formats
 */
export function createIconConfig(input: IconConfigInput | IconConfig): IconConfig {
  return normalizeIconConfig(input);
}

/**
 * Create an array of IconConfigs with automatic normalization
 * Useful for migrating test data and defaults
 */
export function createIconConfigs(inputs: (IconConfigInput | IconConfig)[]): IconConfig[] {
  return inputs.map(normalizeIconConfig);
}

/**
 * SVG icon helper - creates icon config with SVG content
 */
export function createSvgIcon(
  id: string,
  name: string,
  capacity: number,
  size: { width: number; height: number },
  content: string,
  color: string,
): IconConfig {
  return {
    id,
    name,
    capacity,
    size,
    color,
    visual: { type: 'svg', content },
  };
}

/**
 * Image icon helper - creates icon config with image URL
 */
export function createImageIcon(
  id: string,
  name: string,
  capacity: number,
  size: { width: number; height: number },
  url: string,
  color: string,
): IconConfig {
  return {
    id,
    name,
    capacity,
    size,
    color,
    visual: { type: 'image', url },
  };
}
