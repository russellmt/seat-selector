import React from "react";
import type { Guest } from "../types/Guest";
import { getInitials } from "../utils";
import "./GuestInitialCircle.css";

/**
 * Size variants for the initial circle
 */
export type GuestInitialCircleSize = "small" | "medium" | "large";

/**
 * Diameter in pixels for each size variant
 */
const SIZE_PX: Record<GuestInitialCircleSize, number> = {
  small: 24,
  medium: 40,
  large: 56,
};

/**
 * Props for the GuestInitialCircle component
 */
export interface GuestInitialCircleProps {
  /** Guest whose initials and color are displayed */
  guest: Guest;

  /** Diameter variant (default: medium) */
  size?: GuestInitialCircleSize;
}

/**
 * GuestInitialCircle Component
 *
 * Renders a colored circle containing the guest's initials. The background uses
 * the guest's stored color, and the text uses that color's contrast value
 * ("white" or "black") so the initials stay readable.
 *
 * The circle is decorative (aria-hidden) because the guest's name is shown
 * alongside it and announced by assistive technology.
 *
 * **Validates: Requirements 20.4, 20.5, 20.6**
 */
export const GuestInitialCircle: React.FC<GuestInitialCircleProps> = ({
  guest,
  size = "medium",
}) => {
  const diameter = SIZE_PX[size];

  return (
    <div
      className={`guest-initial-circle guest-initial-circle-${size}`}
      aria-hidden="true"
      style={{
        width: diameter,
        height: diameter,
        fontSize: Math.round(diameter * 0.4),
        backgroundColor: guest.color.hex,
        color: guest.color.text,
      }}
    >
      {getInitials(guest.name)}
    </div>
  );
};

export default GuestInitialCircle;
