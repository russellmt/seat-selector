import { describe, it, expect } from 'vitest';
import type {
  UIState,
  DragState,
  PreviewState,
  ConfirmationDialog,
} from './UIState';
import type { GridPosition, Rotation } from './index';

describe('UIState Types', () => {
  describe('UIState Interface', () => {
    it('should allow valid UIState objects', () => {
      const gridPosition: GridPosition = { col: 5, row: 10 };
      const rotation: Rotation = 'down';

      const uiState: UIState = {
        selectedIconId: 'table-4',
        selectedRotation: rotation,
        selectedGuestId: null,
        hoverPosition: gridPosition,
        isDragging: false,
        dragStart: null,
      };

      expect(uiState.selectedIconId).toBe('table-4');
      expect(uiState.selectedRotation).toBe('down');
      expect(uiState.selectedGuestId).toBeNull();
      expect(uiState.hoverPosition).toEqual(gridPosition);
      expect(uiState.isDragging).toBe(false);
      expect(uiState.dragStart).toBeNull();
    });

    it('should support all rotation values', () => {
      const rotations: Rotation[] = ['left', 'up', 'right', 'down'];

      rotations.forEach((rotation) => {
        const uiState: UIState = {
          selectedIconId: 'chair',
          selectedRotation: rotation,
          selectedGuestId: 'guest-1',
          hoverPosition: null,
          isDragging: false,
          dragStart: null,
        };

        expect(uiState.selectedRotation).toBe(rotation);
      });
    });

    it('should allow selectedGuestId to be string or null', () => {
      const withGuestId: UIState = {
        selectedIconId: 'table',
        selectedRotation: 'up',
        selectedGuestId: 'guest-123',
        hoverPosition: null,
        isDragging: false,
        dragStart: null,
      };

      const withoutGuestId: UIState = {
        selectedIconId: 'table',
        selectedRotation: 'up',
        selectedGuestId: null,
        hoverPosition: null,
        isDragging: false,
        dragStart: null,
      };

      expect(withGuestId.selectedGuestId).toBe('guest-123');
      expect(withoutGuestId.selectedGuestId).toBeNull();
    });
  });

  describe('DragState Interface', () => {
    it('should allow valid DragState objects', () => {
      const startPos: GridPosition = { col: 0, row: 0 };
      const currentPos: GridPosition = { col: 5, row: 5 };

      const dragState: DragState = {
        startPosition: startPos,
        currentPosition: currentPos,
        mouseButton: 'left',
      };

      expect(dragState.startPosition).toEqual(startPos);
      expect(dragState.currentPosition).toEqual(currentPos);
      expect(dragState.mouseButton).toBe('left');
    });

    it('should support left and right mouse buttons', () => {
      const pos: GridPosition = { col: 3, row: 3 };

      const leftClickDrag: DragState = {
        startPosition: pos,
        currentPosition: pos,
        mouseButton: 'left',
      };

      const rightClickDrag: DragState = {
        startPosition: pos,
        currentPosition: pos,
        mouseButton: 'right',
      };

      expect(leftClickDrag.mouseButton).toBe('left');
      expect(rightClickDrag.mouseButton).toBe('right');
    });

    it('should allow different start and current positions', () => {
      const dragState: DragState = {
        startPosition: { col: 0, row: 0 },
        currentPosition: { col: 10, row: 10 },
        mouseButton: 'left',
      };

      expect(dragState.startPosition.col).toBe(0);
      expect(dragState.startPosition.row).toBe(0);
      expect(dragState.currentPosition.col).toBe(10);
      expect(dragState.currentPosition.row).toBe(10);
    });
  });

  describe('PreviewState Interface', () => {
    it('should allow icon preview type', () => {
      const iconPreview: PreviewState = {
        type: 'icon',
        position: { col: 5, row: 5 },
        opacity: 0.5,
      };

      expect(iconPreview.type).toBe('icon');
      expect(iconPreview.opacity).toBe(0.5);
    });

    it('should allow guest preview type', () => {
      const guestPreview: PreviewState = {
        type: 'guest',
        position: { col: 3, row: 3 },
        opacity: 0.25,
      };

      expect(guestPreview.type).toBe('guest');
      expect(guestPreview.opacity).toBe(0.25);
    });

    it('should allow null type for no preview', () => {
      const noPreview: PreviewState = {
        type: null,
        position: null,
        opacity: 0,
      };

      expect(noPreview.type).toBeNull();
      expect(noPreview.position).toBeNull();
    });

    it('should support opacity values from 0 to 1', () => {
      const opacityValues = [0, 0.25, 0.5, 0.6, 1];

      opacityValues.forEach((opacity) => {
        const preview: PreviewState = {
          type: 'icon',
          position: { col: 0, row: 0 },
          opacity,
        };

        expect(preview.opacity).toBe(opacity);
      });
    });

    it('should allow null position', () => {
      const preview: PreviewState = {
        type: 'icon',
        position: null,
        opacity: 0.5,
      };

      expect(preview.position).toBeNull();
    });
  });

  describe('ConfirmationDialog Interface', () => {
    it('should allow valid ConfirmationDialog objects', () => {
      const confirmCallback = () => console.log('confirmed');
      const cancelCallback = () => console.log('cancelled');

      const dialog: ConfirmationDialog = {
        isOpen: true,
        title: 'Confirm Action',
        message: 'Are you sure?',
        onConfirm: confirmCallback,
        onCancel: cancelCallback,
      };

      expect(dialog.isOpen).toBe(true);
      expect(dialog.title).toBe('Confirm Action');
      expect(dialog.message).toBe('Are you sure?');
      expect(dialog.onConfirm).toBe(confirmCallback);
      expect(dialog.onCancel).toBe(cancelCallback);
    });

    it('should support open and closed states', () => {
      const openDialog: ConfirmationDialog = {
        isOpen: true,
        title: 'Delete',
        message: 'Confirm deletion?',
        onConfirm: () => {},
        onCancel: () => {},
      };

      const closedDialog: ConfirmationDialog = {
        isOpen: false,
        title: 'Delete',
        message: 'Confirm deletion?',
        onConfirm: () => {},
        onCancel: () => {},
      };

      expect(openDialog.isOpen).toBe(true);
      expect(closedDialog.isOpen).toBe(false);
    });

    it('should support callbacks as arrow functions', () => {
      let confirmCalled = false;
      let cancelCalled = false;

      const dialog: ConfirmationDialog = {
        isOpen: true,
        title: 'Test',
        message: 'Test message',
        onConfirm: () => {
          confirmCalled = true;
        },
        onCancel: () => {
          cancelCalled = true;
        },
      };

      dialog.onConfirm();
      dialog.onCancel();

      expect(confirmCalled).toBe(true);
      expect(cancelCalled).toBe(true);
    });

    it('should allow complex messages', () => {
      const dialog: ConfirmationDialog = {
        isOpen: true,
        title: 'Clear All Seats',
        message:
          'This will remove all seats from the canvas. This action cannot be undone.',
        onConfirm: () => {},
        onCancel: () => {},
      };

      expect(dialog.message).toContain('cannot be undone');
    });
  });
});
