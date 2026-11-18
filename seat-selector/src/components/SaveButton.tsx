import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

/** Explains why saving is unavailable in Phase 1 */
export const SAVE_PHASE_1_TOOLTIP =
  "Saving is not available in Phase 1. Configurations are kept for this session only.";

/**
 * SaveButton Component (Seat Canvas, Phase 1 placeholder)
 *
 * Renders a visible "Save" button that is disabled in Phase 1.
 * A tooltip explains the limitation. The tooltip is attached to a wrapper
 * because disabled buttons do not receive pointer or focus events.
 *
 * **Validates: Requirements 17.1, 17.2, 17.3**
 */
export const SaveButton: React.FC = () => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="save-button-phase-1-tooltip">
          {SAVE_PHASE_1_TOOLTIP}
        </Tooltip>
      }
    >
      <span className="d-inline-block" tabIndex={0}>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled
          style={{ pointerEvents: "none" }}
          aria-label="Save configuration (not available in Phase 1)"
        >
          Save
        </Button>
      </span>
    </OverlayTrigger>
  );
};

export default SaveButton;
