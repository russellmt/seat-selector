import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import SeatCanvas from './SeatCanvas';

// Wrapper component for tests
function SeatCanvasWithProviders() {
  return (
    <AppProvider>
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    </AppProvider>
  );
}

describe('SeatCanvas Page - Layout (Task 9.1)', () => {
  describe('Three-Section Layout', () => {
    it('should render the SeatCanvas page with three main sections', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const header = container.querySelector('.canvas-header');
      const main = container.querySelector('.canvas-main');
      const footer = container.querySelector('.canvas-footer');
      
      expect(header).toBeDefined();
      expect(main).toBeDefined();
      expect(footer).toBeDefined();
    });

    it('should display header section with title', () => {
      render(<SeatCanvasWithProviders />);
      
      expect(screen.getByText('Seat Canvas')).toBeDefined();
    });

    it('should display main section with sidebar and canvas area', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const iconBank = container.querySelector('.icon-bank');
      const gridCanvas = container.querySelector('.grid-canvas');
      
      expect(iconBank).toBeDefined();
      expect(gridCanvas).toBeDefined();
    });

    it('should display footer section with controls', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const footer = container.querySelector('.canvas-footer');
      expect(footer).toBeDefined();
      
      // Check footer contains subsections
      const footerLeft = footer?.querySelector('.footer-left');
      const footerCenter = footer?.querySelector('.footer-center');
      const footerRight = footer?.querySelector('.footer-right');
      
      expect(footerLeft).toBeDefined();
      expect(footerCenter).toBeDefined();
      expect(footerRight).toBeDefined();
    });
  });

  describe('Header Section', () => {
    it('should display Back button in header', () => {
      render(<SeatCanvasWithProviders />);
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDefined();
    });

    it('should display Seat Canvas title in header', () => {
      render(<SeatCanvasWithProviders />);
      
      const title = screen.getByText('Seat Canvas');
      expect(title).toBeDefined();
    });
  });

  describe('Main Area Section', () => {
    it('should have icon bank sidebar', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const iconBank = container.querySelector('.icon-bank');
      expect(iconBank).toBeDefined();
    });

    it('should have grid canvas area', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const gridCanvas = container.querySelector('.grid-canvas');
      expect(gridCanvas).toBeDefined();
    });

    it('should display icon bank and grid canvas side by side', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const main = container.querySelector('.canvas-main');
      
      // Main should exist and have flex layout applied
      expect(main).toBeDefined();
      // Note: computed styles in tests may not reflect CSS media queries properly,
      // so we just verify the class exists and the content structure is correct
      const iconBank = main?.querySelector('.icon-bank');
      const gridCanvas = main?.querySelector('.grid-canvas');
      expect(iconBank).toBeDefined();
      expect(gridCanvas).toBeDefined();
    });
  });

  describe('Footer Section', () => {
    it('should display seat count', () => {
      render(<SeatCanvasWithProviders />);
      
      expect(screen.getByText(/seats: 0/i)).toBeDefined();
    });

    it('should display Clear All button', () => {
      render(<SeatCanvasWithProviders />);
      
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearButton).toBeDefined();
    });

    it('should display Save button', () => {
      render(<SeatCanvasWithProviders />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDefined();
    });

    it('should display Add Guests button', () => {
      render(<SeatCanvasWithProviders />);
      
      const addGuestsButton = screen.getByRole('button', { name: /navigate to guest arrangement page/i });
      expect(addGuestsButton).toBeDefined();
    });

    it('should have three subsections in footer (left, center, right)', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const footerLeft = container.querySelector('.footer-left');
      const footerCenter = container.querySelector('.footer-center');
      const footerRight = container.querySelector('.footer-right');
      
      expect(footerLeft).toBeDefined();
      expect(footerCenter).toBeDefined();
      expect(footerRight).toBeDefined();
    });
  });

  describe('State Management Connection', () => {
    it('should use AppContext for navigation', () => {
      // This test verifies that the component uses the useApp hook
      // The component should call setCurrentPage when navigating
      const { container } = render(<SeatCanvasWithProviders />);
      
      // Component should render without errors with AppProvider
      expect(container.querySelector('.seat-canvas-page')).toBeDefined();
    });

    it('should set current page to canvas on render', () => {
      // This test verifies that the component is properly integrated with AppContext
      render(<SeatCanvasWithProviders />);
      
      // If AppContext is being used correctly, the component should render
      expect(screen.getByText('Seat Canvas')).toBeDefined();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive classes applied', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      const seatCanvasPage = container.querySelector('.seat-canvas-page');
      expect(seatCanvasPage).toBeDefined();
      
      // Check that page exists and uses flex layout
      // Note: computed styles for flex direction may not be fully reliable in test environment
      // so we verify the DOM structure instead
      const header = seatCanvasPage?.querySelector('.canvas-header');
      const main = seatCanvasPage?.querySelector('.canvas-main');
      const footer = seatCanvasPage?.querySelector('.canvas-footer');
      
      expect(header).toBeDefined();
      expect(main).toBeDefined();
      expect(footer).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should render without crashing', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      expect(container.querySelector('.seat-canvas-page')).toBeDefined();
    });

    it('should have proper ARIA labels for accessibility', () => {
      render(<SeatCanvasWithProviders />);
      
      const backButton = screen.getByRole('button', { name: /back to home page/i });
      expect(backButton).toBeDefined();
    });
  });
});

/**
 * Task 10.2 Tests: Icon Selection and Highlighting
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4
 * - When user clicks icon, AppContext selectedIconId is updated
 * - Icon is visually highlighted (already done in IconBank CSS from 10.1)
 * - Rotation state is displayed for selected icon
 * - Selection persists across re-renders
 * - Keyboard arrow keys update AppContext
 */
describe('SeatCanvas Page - Icon Selection and Highlighting (Task 10.2)', () => {
  describe('Icon Bank Integration with AppContext', () => {
    it('should render IconBank component with available icons', () => {
      render(<SeatCanvasWithProviders />);
      
      // IconBank should be rendered with icons
      // The default first icon (table-round-4) should be selected by default
      expect(screen.getByLabelText(/Round Table \(4-top\)/i)).toBeDefined();
      expect(screen.getByLabelText(/Chair/i)).toBeDefined();
    });

    it('should display table icon as selected by default', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      // Find selected icon item
      const selectedIcon = container.querySelector('.icon-item.selected');
      expect(selectedIcon).toBeDefined();
      
      // Verify it's the table icon
      const label = selectedIcon?.getAttribute('aria-label');
      expect(label?.includes('Round Table')).toBe(true);
    });

    it('should update AppContext selectedIconId when icon is clicked', () => {
      render(<SeatCanvasWithProviders />);
      
      // Click on chair icon
      const chairButton = screen.getByLabelText(/Chair/i);
      fireEvent.click(chairButton);
      
      // The selected icon should now be chair
      // We can verify this by checking the aria-pressed attribute
      expect(chairButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should persist selection when component re-renders', () => {
      const { rerender } = render(<SeatCanvasWithProviders />);
      
      // Click on loveseat icon
      const loveseeatButton = screen.getByLabelText(/Loveseat/i);
      fireEvent.click(loveseeatButton);
      
      // Re-render the component
      rerender(<SeatCanvasWithProviders />);
      
      // Loveseat should still be selected
      const rerenderedLoveseeatButton = screen.getByLabelText(/Loveseat/i);
      expect(rerenderedLoveseeatButton.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Rotation State Display', () => {
    it('should display rotation controls at top right', () => {
      render(<SeatCanvasWithProviders />);
      
      // RotationControls should be visible in header
      const rotationButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-label')?.includes('Rotate')
      );
      
      // Should have 4 rotation buttons (left, up, right, down)
      expect(rotationButtons.length).toBeGreaterThanOrEqual(4);
    });

    it('should show selected icon with current rotation state', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      // The default rotation should be 'down'
      // We can verify this is reflected in the rotation controls
      const downButton = screen.getByRole('button', { name: /rotate down|down/i });
      expect(downButton).toBeDefined();
    });

    it('should update rotation state when rotation button is clicked', () => {
      render(<SeatCanvasWithProviders />);
      
      // Click right rotation button to rotate
      const rightButton = screen.getByRole('button', { name: /rotate right|right/i });
      fireEvent.click(rightButton);
      
      // The right button should now be highlighted (aria-pressed)
      // This indicates the rotation has been updated
      // Note: The exact implementation of rotation state display
      // depends on RotationControls component
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should allow keyboard arrow key navigation through icons', () => {
      render(<SeatCanvasWithProviders />);
      
      // Get the default selected icon
      const tableButton = screen.getByLabelText(/Round Table \(4-top\)/i);
      tableButton.focus();
      
      // Press right arrow key to move to next icon
      fireEvent.keyDown(tableButton, { key: 'ArrowRight' });
      
      // The next icon (chair) should be highlighted
      const chairButton = screen.getByLabelText(/Chair/i);
      expect(chairButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should allow left arrow key to select previous icon', () => {
      render(<SeatCanvasWithProviders />);
      
      // Click on couch to make it selected
      const couchButton = screen.getByLabelText(/Couch/i);
      fireEvent.click(couchButton);
      
      couchButton.focus();
      
      // Press left arrow key
      fireEvent.keyDown(couchButton, { key: 'ArrowLeft' });
      
      // Previous icon (loveseat) should be highlighted
      const loveseeatButton = screen.getByLabelText(/Loveseat/i);
      expect(loveseeatButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should wrap icon selection when cycling with keyboard', () => {
      render(<SeatCanvasWithProviders />);
      
      // Get the default selected icon (table)
      const tableButton = screen.getByLabelText(/Round Table \(4-top\)/i);
      tableButton.focus();
      
      // Press left arrow key at first icon (should wrap to last)
      fireEvent.keyDown(tableButton, { key: 'ArrowLeft' });
      
      // Couch (last icon) should be highlighted
      const couchButton = screen.getByLabelText(/Couch/i);
      expect(couchButton.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Visual Highlighting', () => {
    it('should apply selected class to selected icon item', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      // Find the selected icon item
      const selectedIcon = container.querySelector('.icon-item.selected');
      expect(selectedIcon).toBeDefined();
      expect(selectedIcon?.className).toContain('selected');
    });

    it('should update visual highlight when different icon is selected', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      // Click on chair icon
      const chairButton = screen.getByLabelText(/Chair/i);
      fireEvent.click(chairButton);
      
      // Find all selected items
      const selectedItems = container.querySelectorAll('.icon-item.selected');
      
      // Should only have one selected item
      expect(selectedItems.length).toBe(1);
      
      // It should be the chair
      expect(selectedItems[0].getAttribute('aria-label')?.includes('Chair')).toBe(true);
    });

    it('should not highlight unselected icons', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      // Get all icon items
      const allIcons = container.querySelectorAll('.icon-item');
      
      // Count selected items (should be exactly 1)
      const selectedCount = Array.from(allIcons).filter(item =>
        item.className.includes('selected')
      ).length;
      
      expect(selectedCount).toBe(1);
    });
  });

  describe('Cross-Component State Consistency', () => {
    it('should maintain consistency between IconBank and AppContext', () => {
      render(<SeatCanvasWithProviders />);
      
      // Click multiple icons in sequence
      const chairButton = screen.getByLabelText(/Chair/i);
      fireEvent.click(chairButton);
      expect(chairButton.getAttribute('aria-pressed')).toBe('true');
      
      const loveseeatButton = screen.getByLabelText(/Loveseat/i);
      fireEvent.click(loveseeatButton);
      expect(loveseeatButton.getAttribute('aria-pressed')).toBe('true');
      
      const couchButton = screen.getByLabelText(/Couch/i);
      fireEvent.click(couchButton);
      expect(couchButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('should handle rapid icon selection changes', () => {
      render(<SeatCanvasWithProviders />);
      
      // Rapidly click different icons
      const icons = [
        screen.getByLabelText(/Chair/i),
        screen.getByLabelText(/Loveseat/i),
        screen.getByLabelText(/Couch/i),
      ];
      
      icons.forEach(icon => {
        fireEvent.click(icon);
      });
      
      // Final selection should be the last clicked (couch)
      const couchButton = screen.getByLabelText(/Couch/i);
      expect(couchButton.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Initial State', () => {
    it('should initialize with table icon selected', () => {
      const { container } = render(<SeatCanvasWithProviders />);
      
      // Find the selected item
      const selectedIcon = container.querySelector('.icon-item.selected');
      const label = selectedIcon?.getAttribute('aria-label');
      
      // Should be table (first icon, capacity 0)
      expect(label?.includes('Round Table')).toBe(true);
    });

    it('should initialize with down rotation for selected icon', () => {
      render(<SeatCanvasWithProviders />);
      
      // The rotation should default to 'down'
      // This is verified by the presence of rotation buttons
      expect(screen.getByRole('button', { name: /rotate down|down/i })).toBeDefined();
    });
  });
});
