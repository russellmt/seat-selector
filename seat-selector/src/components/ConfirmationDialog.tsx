import React from 'react';
import './ConfirmationDialog.css';

/**
 * Props for the ConfirmationDialog component
 */
export interface ConfirmationDialogProps {
  /** Whether the dialog is currently open/visible */
  isOpen: boolean;

  /** The title of the dialog */
  title: string;

  /** The message content of the dialog */
  message: string;

  /** Text label for the confirm button (default: "Confirm") */
  confirmText?: string;

  /** Text label for the cancel button (default: "Cancel") */
  cancelText?: string;

  /** Whether this is a dangerous/destructive operation (shows red styling) */
  isDangerous?: boolean;

  /** Callback when the confirm button is clicked */
  onConfirm: () => void;

  /** Callback when the cancel button is clicked */
  onCancel: () => void;
}

/**
 * ConfirmationDialog Component
 *
 * A modal dialog component for confirming potentially destructive operations
 * such as clearing all seats, deleting guests, or randomizing assignments.
 *
 * Features:
 * - Modal overlay with semi-transparent background
 * - Clear title, message, and action buttons
 * - Optional "dangerous operation" styling (red buttons for destructive actions)
 * - Keyboard support (Enter to confirm, Escape to cancel)
 * - Prevents interaction with content behind the modal
 *
 * **Validates: Requirements 43.1, 43.2, 43.3**
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   isOpen={showConfirm}
 *   title="Clear All Seats?"
 *   message="This will remove all seats from the canvas. This action cannot be undone."
 *   isDangerous={true}
 *   confirmText="Clear All"
 *   cancelText="Cancel"
 *   onConfirm={() => handleClearAll()}
 *   onCancel={() => setShowConfirm(false)}
 * />
 * ```
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  // Handle keyboard events
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirmation-dialog-overlay" onClick={onCancel}>
      <div
        className="confirmation-dialog-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-dialog-header">
          <h2 className="confirmation-dialog-title">{title}</h2>
        </div>

        <div className="confirmation-dialog-body">
          <p className="confirmation-dialog-message">{message}</p>
        </div>

        <div className="confirmation-dialog-footer">
          <button
            className="confirmation-dialog-button confirmation-dialog-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`confirmation-dialog-button confirmation-dialog-confirm ${
              isDangerous ? 'dangerous' : ''
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
