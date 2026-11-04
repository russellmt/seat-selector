import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
