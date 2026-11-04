import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from './ConfirmationDialog';

describe('ConfirmationDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Confirm Action')).toBeDefined();
      expect(
        screen.getByText('Are you sure you want to proceed?')
      ).toBeDefined();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Confirm Action')).toBeNull();
    });

    it('should display custom button text', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="Delete All"
          cancelText="Keep"
        />
      );
      expect(screen.getByText('Delete All')).toBeDefined();
      expect(screen.getByText('Keep')).toBeDefined();
    });

    it('should display default button text when not provided', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Confirm')).toBeDefined();
      expect(screen.getByText('Cancel')).toBeDefined();
    });
  });

  describe('Button Interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <ConfirmationDialog
          {...defaultProps}
          onConfirm={onConfirm}
          confirmText="Confirm"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmationDialog
          {...defaultProps}
          onCancel={onCancel}
          cancelText="Cancel"
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when overlay is clicked', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmationDialog {...defaultProps} onCancel={onCancel} />
      );

      const overlay = document.querySelector(
        '.confirmation-dialog-overlay'
      ) as HTMLElement;
      fireEvent.click(overlay);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when modal itself is clicked', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmationDialog {...defaultProps} onCancel={onCancel} />
      );

      const modal = document.querySelector(
        '.confirmation-dialog-modal'
      ) as HTMLElement;
      fireEvent.click(modal);
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onConfirm when Enter key is pressed', () => {
      const onConfirm = vi.fn();
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed', () => {
      const onCancel = vi.fn();
      render(<ConfirmationDialog {...defaultProps} onCancel={onCancel} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not respond to keyboard events when isOpen is false', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      render(
        <ConfirmationDialog
          {...defaultProps}
          isOpen={false}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have dangerous class when isDangerous is true', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          isDangerous={true}
          confirmText="Delete"
        />
      );

      const confirmButton = screen.getByText('Delete');
      expect(confirmButton.className).toContain('dangerous');
    });

    it('should not have dangerous class when isDangerous is false', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          isDangerous={false}
          confirmText="Confirm"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton.className).not.toContain('dangerous');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const overlay = document.querySelector('.confirmation-dialog-overlay');
      expect(overlay).not.toBeNull();

      const modal = document.querySelector('.confirmation-dialog-modal');
      expect(modal).not.toBeNull();
    });

    it('should have focusable buttons', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2);

      buttons.forEach((button) => {
        expect(button).toBeInstanceOf(HTMLButtonElement);
      });
    });
  });
});
