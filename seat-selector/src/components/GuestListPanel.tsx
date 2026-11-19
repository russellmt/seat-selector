import React, { useState } from "react";
import type { Guest } from "../types/Guest";
import { GuestInitialCircle } from "./GuestInitialCircle";
import { AddGuestInput } from "./AddGuestInput";
import "./GuestListPanel.css";

/**
 * Props for the GuestListPanel component
 */
export interface GuestListPanelProps {
  /** Guests to display, in the order they should appear */
  guests: Guest[];

  /**
   * Called with the trimmed name when the user submits a new guest.
   * When omitted, the "+" add button is not rendered.
   */
  onAddGuest?: (name: string) => void;
}

/**
 * GuestListPanel Component
 *
 * Displays the guest list in a 2-column grid that mirrors the IconBank layout
 * (2 columns, N rows, scrolling vertically). Each entry shows the guest's
 * initial circle and name. Entries appear in the order given by `guests`.
 *
 * Features:
 * - "+" button at the top that reveals an inline form for adding a guest
 * - 2-column grid with fixed-height rows, matching IconBank dimensions
 * - Scrollable container for long guest lists
 * - Color circle with initials per guest (via GuestInitialCircle)
 *
 * Selecting, editing, sorting, and reordering are implemented in later tasks.
 *
 * **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 21.1, 21.2**
 *
 * @example
 * ```tsx
 * <GuestListPanel guests={guests} onAddGuest={(name) => addGuest(...)} />
 * ```
 */
export const GuestListPanel: React.FC<GuestListPanelProps> = ({
  guests,
  onAddGuest,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleSubmit = (name: string) => {
    onAddGuest?.(name);
    setIsAdding(false);
  };

  return (
    <div className="guest-list" role="region" aria-label="Guest list">
      {onAddGuest && (
        <div className="guest-list-header">
          <button
            type="button"
            className="guest-list-add-button"
            aria-label="Add guest"
            aria-expanded={isAdding}
            onClick={() => setIsAdding((prev) => !prev)}
          >
            +
          </button>

          {isAdding && (
            <AddGuestInput
              onSubmit={handleSubmit}
              onCancel={() => setIsAdding(false)}
            />
          )}
        </div>
      )}

      <ul className="guest-list-grid">
        {guests.map((guest) => (
          <li key={guest.id} className="guest-item" title={guest.name}>
            <GuestInitialCircle guest={guest} size="medium" />
            <div className="guest-name">{guest.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuestListPanel;
