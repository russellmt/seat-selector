import type { GridPosition, Rotation } from './index';

/**
 * Represents the UI state of the application during seat canvas interactions
 * Tracks which icon/rotation is selected, drag state, hover position, and guest selection
 *
 * **Validates: Requirements 6.1, 43.1**
 */
export interface UIState {
  /** Currently selected icon ID from the icon bank */
  selectedIconId: string;

  /** Current rotation state for the selected icon (left, up, right, down) */
  selectedRotation: Rotation;

  /** Currently selected guest ID (null if no guest selected) */
  selectedGuestId: string | null;

  /** Current mouse position on the grid (used for hover preview) */
  hoverPosition: GridPosition | null;

  /** Whether a drag operation is currently in progress */
  isDragging: boolean;

  /** Starting position of a drag operation (null if not dragging) */
  dragStart: GridPosition | null;
}

/**
 * Represents the state of an active drag operation
 * Tracks the start position, current position, and which mouse button initiated the drag
 *
 * **Validates: Requirements 6.1, 43.1**
 */
export interface DragState {
  /** The grid position where the drag started */
  startPosition: GridPosition;

  /** The current grid position during drag (updates as mouse moves) */
  currentPosition: GridPosition;

  /** Which mouse button initiated the drag ('left' for place, 'right' for delete) */
  mouseButton: 'left' | 'right';
}

/**
 * Represents the state of the hover/preview rendered on the canvas
 * Tracks what type of preview is shown, where it's positioned, and its opacity
 *
 * **Validates: Requirements 6.1, 43.1**
 */
export interface PreviewState {
  /** Type of preview: 'icon' for seat placement preview, 'guest' for guest assignment preview */
  type: 'icon' | 'guest' | null;

  /** Grid position where the preview is displayed (null if not hovering) */
  position: GridPosition | null;

  /** Opacity of the preview (0-1 range, typically 0.25-0.6) */
  opacity: number;
}

/**
 * Represents the configuration for a confirmation dialog modal
 * Used for destructive operations like clearing seats or deleting guests
 *
 * **Validates: Requirements 6.1, 43.1, 43.2, 43.3**
 */
export interface ConfirmationDialog {
  /** Whether the dialog is currently visible */
  isOpen: boolean;

  /** The title displayed at the top of the dialog */
  title: string;

  /** The message body of the dialog */
  message: string;

  /** Callback function when user confirms the action */
  onConfirm: () => void;

  /** Callback function when user cancels the action */
  onCancel: () => void;
}
