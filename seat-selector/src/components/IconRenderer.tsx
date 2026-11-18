import React from 'react';
import type { IconConfig } from '../types/Icon';

/**
 * Props for the IconRenderer component
 */
export interface IconRendererProps {
  /** Icon configuration containing visual type and content/URL */
  icon: IconConfig;
  
  /** Width in pixels */
  width: number;
  
  /** Height in pixels */
  height: number;
  
  /** Optional CSS class name */
  className?: string;
  
  /** Optional style overrides */
  style?: React.CSSProperties;
}

/**
 * IconRenderer Component
 *
 * Renders an icon (SVG or image) with proper stretching to fill the specified dimensions.
 * Uses preserveAspectRatio="none" for SVG to stretch images/SVGs to match grid sizes.
 *
 * This component is reusable across the application:
 * - Icon Bank: renders icons in selection buttons
 * - Seat Canvas: renders placed seat icons
 * - Preview Renderer: renders hover previews
 *
 * Features:
 * - Consistent rendering logic across all uses
 * - Proper stretching for non-square grid footprints (e.g., 2x1 loveseat)
 * - Support for both inline SVG and external image URLs
 * - Maintains aspect ratio handling consistently
 *
 * @example
 * ```tsx
 * // Render a chair icon (1x1) at 24px x 24px
 * <IconRenderer
 *   icon={chairIcon}
 *   width={24}
 *   height={24}
 * />
 *
 * // Render a loveseat icon (2x1) at 48px x 24px
 * <IconRenderer
 *   icon={loveseatIcon}
 *   width={48}
 *   height={24}
 * />
 * ```
 */
export const IconRenderer: React.FC<IconRendererProps> = ({
  icon,
  width,
  height,
  className,
  style,
}) => {
  const viewBoxString = `0 0 ${icon.size.width} ${icon.size.height}`;

  return (
    <>
      {/* SVG icon rendering */}
      {icon.visual.type === 'svg' && (
        <svg
          width={width}
          height={height}
          viewBox={viewBoxString}
          preserveAspectRatio="none"
          className={className}
          style={style}
          dangerouslySetInnerHTML={{ __html: icon.visual.content }}
        />
      )}

      {/* Image icon rendering - use background-image for proper stretching */}
      {icon.visual.type === 'image' && (
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundImage: `url('${icon.visual.url}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            display: 'block',
            ...style,
          }}
          className={className}
        />
      )}
    </>
  );
};

export default IconRenderer;
