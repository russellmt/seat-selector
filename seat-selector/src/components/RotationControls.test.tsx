import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Rotation } from '../types/Icon';
import { RotationControls } from './RotationControls';

describe('RotationControls Component', () => {
  // ============ Rendering Tests ============

  describe('Rendering', () => {
    it('should render all 4 directional buttons', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      expect(screen.getByLabelText('Rotate icon left')).toBeDefined();
      expect(screen.getByLabelText('Rotate icon up')).toBeDefined();
      expect(screen.getByLabelText('Rotate icon right')).toBeDefined();
      expect(screen.getByLabelText('Rotate icon down')).toBeDefined();
    });

    it('should render the cycle button (Next / R)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const cycleButton = screen.getByRole('button', {
        name: /Rotate icon to next direction/i,
      });
      expect(cycleButton).toBeDefined();
      expect(cycleButton.textContent).toContain('Next (R)');
    });

    it('should have proper ARIA attributes', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const container = screen.getByRole('group');
      expect(container).toBeDefined();
      expect(container.getAttribute('aria-label')).toBe('Icon rotation controls');

      const allButtons = screen.getAllByRole('button');
      allButtons.slice(0, 4).forEach((button) => {
        expect(button.getAttribute('aria-pressed')).toBeDefined();
      });
    });
  });

  // ============ Current Rotation Highlight Tests ============

  describe('Current Rotation Highlighting', () => {
    it('should highlight the currently selected rotation (down)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const downButton = screen.getByLabelText('Rotate icon down');
      expect(downButton.classList.contains('active')).toBe(true);

      expect(screen.getByLabelText('Rotate icon left').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon up').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon right').classList.contains('active')).toBe(false);
    });

    it('should highlight the currently selected rotation (left)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="left" onRotate={mockOnRotate} />
      );

      const leftButton = screen.getByLabelText('Rotate icon left');
      expect(leftButton.classList.contains('active')).toBe(true);

      expect(screen.getByLabelText('Rotate icon up').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon right').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon down').classList.contains('active')).toBe(false);
    });

    it('should highlight the currently selected rotation (up)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="up" onRotate={mockOnRotate} />
      );

      const upButton = screen.getByLabelText('Rotate icon up');
      expect(upButton.classList.contains('active')).toBe(true);

      expect(screen.getByLabelText('Rotate icon left').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon right').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon down').classList.contains('active')).toBe(false);
    });

    it('should highlight the currently selected rotation (right)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="right" onRotate={mockOnRotate} />
      );

      const rightButton = screen.getByLabelText('Rotate icon right');
      expect(rightButton.classList.contains('active')).toBe(true);

      expect(screen.getByLabelText('Rotate icon left').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon up').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon down').classList.contains('active')).toBe(false);
    });

    it('should update highlight when currentRotation prop changes', () => {
      const mockOnRotate = vi.fn();
      const { rerender } = render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      expect(screen.getByLabelText('Rotate icon down').classList.contains('active')).toBe(true);

      rerender(
        <RotationControls currentRotation="left" onRotate={mockOnRotate} />
      );

      expect(screen.getByLabelText('Rotate icon down').classList.contains('active')).toBe(false);
      expect(screen.getByLabelText('Rotate icon left').classList.contains('active')).toBe(true);
    });
  });

  // ============ Click Handler Tests ============

  describe('Click Handlers', () => {
    it('should call onRotate with "left" when left button is clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const leftButton = screen.getByLabelText('Rotate icon left');
      fireEvent.click(leftButton);

      expect(mockOnRotate).toHaveBeenCalledWith('left');
      expect(mockOnRotate).toHaveBeenCalledTimes(1);
    });

    it('should call onRotate with "up" when up button is clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const upButton = screen.getByLabelText('Rotate icon up');
      fireEvent.click(upButton);

      expect(mockOnRotate).toHaveBeenCalledWith('up');
      expect(mockOnRotate).toHaveBeenCalledTimes(1);
    });

    it('should call onRotate with "right" when right button is clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const rightButton = screen.getByLabelText('Rotate icon right');
      fireEvent.click(rightButton);

      expect(mockOnRotate).toHaveBeenCalledWith('right');
      expect(mockOnRotate).toHaveBeenCalledTimes(1);
    });

    it('should call onRotate with "down" when down button is clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="left" onRotate={mockOnRotate} />
      );

      const downButton = screen.getByLabelText('Rotate icon down');
      fireEvent.click(downButton);

      expect(mockOnRotate).toHaveBeenCalledWith('down');
      expect(mockOnRotate).toHaveBeenCalledTimes(1);
    });

    it('should allow clicking the same rotation button multiple times', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const downButton = screen.getByLabelText('Rotate icon down');
      
      fireEvent.click(downButton);
      fireEvent.click(downButton);
      fireEvent.click(downButton);

      expect(mockOnRotate).toHaveBeenCalledWith('down');
      expect(mockOnRotate).toHaveBeenCalledTimes(3);
    });
  });

  // ============ Cycle Button Tests ============

  describe('Cycle Button (Next / R)', () => {
    it('should cycle from down to left when cycle button clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const cycleButton = screen.getByRole('button', {
        name: /Rotate icon to next direction/i,
      });
      fireEvent.click(cycleButton);

      expect(mockOnRotate).toHaveBeenCalledWith('left');
    });

    it('should cycle from left to up when cycle button clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="left" onRotate={mockOnRotate} />
      );

      const cycleButton = screen.getByRole('button', {
        name: /Rotate icon to next direction/i,
      });
      fireEvent.click(cycleButton);

      expect(mockOnRotate).toHaveBeenCalledWith('up');
    });

    it('should cycle from up to right when cycle button clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="up" onRotate={mockOnRotate} />
      );

      const cycleButton = screen.getByRole('button', {
        name: /Rotate icon to next direction/i,
      });
      fireEvent.click(cycleButton);

      expect(mockOnRotate).toHaveBeenCalledWith('right');
    });

    it('should cycle from right to down when cycle button clicked', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="right" onRotate={mockOnRotate} />
      );

      const cycleButton = screen.getByRole('button', {
        name: /Rotate icon to next direction/i,
      });
      fireEvent.click(cycleButton);

      expect(mockOnRotate).toHaveBeenCalledWith('down');
    });
  });

  // ============ Keyboard Shortcut Tests ============

  describe('R Key Shortcut', () => {
    it('should call onRotate when R key is pressed (lowercase r)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      fireEvent.keyDown(window, { key: 'r' });

      expect(mockOnRotate).toHaveBeenCalledWith('left');
      expect(mockOnRotate).toHaveBeenCalledTimes(1);
    });

    it('should call onRotate when R key is pressed (uppercase R)', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      fireEvent.keyDown(window, { key: 'R' });

      expect(mockOnRotate).toHaveBeenCalledWith('left');
      expect(mockOnRotate).toHaveBeenCalledTimes(1);
    });

    it('should cycle correctly when R key pressed from different rotations', () => {
      const mockOnRotate = vi.fn();
      const { rerender } = render(
        <RotationControls currentRotation="left" onRotate={mockOnRotate} />
      );

      fireEvent.keyDown(window, { key: 'r' });
      expect(mockOnRotate).toHaveBeenLastCalledWith('up');

      rerender(
        <RotationControls currentRotation="up" onRotate={mockOnRotate} />
      );
      fireEvent.keyDown(window, { key: 'r' });
      expect(mockOnRotate).toHaveBeenLastCalledWith('right');

      rerender(
        <RotationControls currentRotation="right" onRotate={mockOnRotate} />
      );
      fireEvent.keyDown(window, { key: 'r' });
      expect(mockOnRotate).toHaveBeenLastCalledWith('down');
    });

    it('should not respond to other keys', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      fireEvent.keyDown(window, { key: 'a' });
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });

      expect(mockOnRotate).not.toHaveBeenCalled();
    });

    it('should prevent default when R key is pressed', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const event = new KeyboardEvent('keydown', { key: 'r' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  // ============ State Cycling Tests ============

  describe('State Cycling', () => {
    it('should cycle through all rotations: down → left → up → right → down', () => {
      const mockOnRotate = vi.fn();
      const rotations: Rotation[] = ['down', 'left', 'up', 'right'];
      const { rerender } = render(
        <RotationControls currentRotation={rotations[0]} onRotate={mockOnRotate} />
      );

      for (let i = 0; i < rotations.length; i++) {
        const cycleButton = screen.getByRole('button', {
          name: /Rotate icon to next direction/i,
        });
        fireEvent.click(cycleButton);

        const expectedNext = rotations[(i + 1) % rotations.length];
        expect(mockOnRotate).toHaveBeenNthCalledWith(i + 1, expectedNext);

        if (i < rotations.length - 1) {
          rerender(
            <RotationControls
              currentRotation={rotations[(i + 1) % rotations.length]}
              onRotate={mockOnRotate}
            />
          );
        }
      }

      expect(mockOnRotate).toHaveBeenCalledTimes(4);
    });

    it('should complete full cycle after 4 rotations', () => {
      const mockOnRotate = vi.fn();
      let currentRotation: Rotation = 'down';
      const { rerender } = render(
        <RotationControls currentRotation={currentRotation} onRotate={mockOnRotate} />
      );

      const rotations: Rotation[] = ['down', 'left', 'up', 'right', 'down'];

      for (let i = 0; i < 4; i++) {
        const cycleButton = screen.getByRole('button', {
          name: /Rotate icon to next direction/i,
        });
        fireEvent.click(cycleButton);

        currentRotation = rotations[i + 1];
        rerender(
          <RotationControls
            currentRotation={currentRotation}
            onRotate={mockOnRotate}
          />
        );
      }

      expect(
        screen.getByLabelText('Rotate icon down').classList.contains('active')
      ).toBe(true);
    });
  });

  // ============ ARIA and Accessibility Tests ============

  describe('Accessibility', () => {
    it('should have proper aria-pressed states for buttons', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const downButton = screen.getByLabelText('Rotate icon down');
      expect(downButton.getAttribute('aria-pressed')).toBe('true');

      const leftButton = screen.getByLabelText('Rotate icon left');
      expect(leftButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('should have title attributes on all buttons', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const leftButton = screen.getByLabelText('Rotate icon left');
      expect(leftButton.getAttribute('title')).toBeDefined();

      const upButton = screen.getByLabelText('Rotate icon up');
      expect(upButton.getAttribute('title')).toBeDefined();

      const rightButton = screen.getByLabelText('Rotate icon right');
      expect(rightButton.getAttribute('title')).toBeDefined();

      const downButton = screen.getByLabelText('Rotate icon down');
      expect(downButton.getAttribute('title')).toBeDefined();

      const cycleButton = screen.getByRole('button', {
        name: /Rotate icon to next direction/i,
      });
      expect(cycleButton.getAttribute('title')).toBeDefined();
    });

    it('should support focus navigation', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const leftButton = screen.getByLabelText('Rotate icon left');
      leftButton.focus();
      expect(document.activeElement).toBe(leftButton);
    });
  });

  // ============ Multiple Rotations Updates Test ============

  describe('Multiple Rotation Updates', () => {
    it('should correctly highlight rotation after multiple updates', () => {
      const mockOnRotate = vi.fn();
      const rotations: Rotation[] = ['down', 'left', 'up', 'right'];
      let currentIndex = 0;

      const { rerender } = render(
        <RotationControls
          currentRotation={rotations[currentIndex]}
          onRotate={mockOnRotate}
        />
      );

      for (const rotation of rotations) {
        expect(screen.getByLabelText(`Rotate icon ${rotation}`).classList.contains('active')).toBe(true);

        currentIndex = (currentIndex + 1) % rotations.length;
        rerender(
          <RotationControls
            currentRotation={rotations[currentIndex]}
            onRotate={mockOnRotate}
          />
        );
      }
    });
  });

  // ============ Edge Cases ============

  describe('Edge Cases', () => {
    it('should handle rapid successive clicks', () => {
      const mockOnRotate = vi.fn();
      render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      const leftButton = screen.getByLabelText('Rotate icon left');

      for (let i = 0; i < 10; i++) {
        fireEvent.click(leftButton);
      }

      expect(mockOnRotate).toHaveBeenCalledTimes(10);
      expect(mockOnRotate).toHaveBeenCalledWith('left');
    });

    it('should handle component mounting with different rotations', () => {
      const mockOnRotate = vi.fn();
      const rotations: Rotation[] = ['down', 'left', 'up', 'right'];

      for (const rotation of rotations) {
        const { unmount } = render(
          <RotationControls currentRotation={rotation} onRotate={mockOnRotate} />
        );

        expect(screen.getByLabelText(`Rotate icon ${rotation}`).classList.contains('active')).toBe(true);
        unmount();
      }
    });

    it('should properly cleanup event listeners on unmount', () => {
      const mockOnRotate = vi.fn();
      const { unmount } = render(
        <RotationControls currentRotation="down" onRotate={mockOnRotate} />
      );

      unmount();

      fireEvent.keyDown(window, { key: 'r' });
      expect(mockOnRotate).not.toHaveBeenCalled();
    });
  });
});
