import React from 'react';

/**
 * Props for the SeatCountDisplay component
 */
export interface SeatCountDisplayProps {
  /** Total number of seat instances currently on the canvas */
  count: number;
}

/**
 * SeatCountDisplay Component
 *
 * Shows the total number of seats on the Seat Canvas footer.
 * The parent passes the live count, so the display updates whenever seats
 * are added or removed.
 *
 * **Validates: Requirements 15.1, 15.2, 15.3**
 */
export const SeatCountDisplay: React.FC<SeatCountDisplayProps> = ({ count }) => {
  return (
    <span className="seat-count-text" aria-live="polite">
      Seats: {count}
    </span>
  );
};

export default SeatCountDisplay;
