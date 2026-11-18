import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { ConfirmationDialog } from './ConfirmationDialog';

/**
 * Props for the ClearAllButton component
 */
export interface ClearAllButtonProps {
  /** Called only after the user confirms the clear operation */
  onConfirm: () => void;
}

/**
 * ClearAllButton Component (Seat Canvas)
 *
 * Renders a "Clear All" button. Clicking it opens a confirmation dialog.
 * Only a confirmed action calls onConfirm, which removes every seat from the canvas.
 *
 * **Validates: Requirements 14.1, 14.2, 14.3**
 */
export const ClearAllButton: React.FC<ClearAllButtonProps> = ({ onConfirm }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onConfirm();
  };

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        aria-label="Clear all seats from canvas"
        className="me-2"
        onClick={() => setIsConfirmOpen(true)}
      >
        Clear All
      </Button>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Clear all seats?"
        message="This removes every seat from the canvas and clears any guest assignments. This cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default ClearAllButton;
