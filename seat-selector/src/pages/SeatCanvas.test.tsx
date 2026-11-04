import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SeatCanvas from './SeatCanvas';

describe('SeatCanvas Page', () => {
  it('should render the SeatCanvas page', () => {
    render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Seat Canvas')).toBeDefined();
  });

  it('should display the header with Back to Home button', () => {
    render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    const backButton = screen.getByRole('button', { name: /back to home/i });
    expect(backButton).toBeDefined();
  });

  it('should display the Icon Bank sidebar', () => {
    render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/icon bank/i)).toBeDefined();
  });

  it('should display the Grid Canvas area', () => {
    render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/grid canvas/i)).toBeDefined();
  });

  it('should display footer controls', () => {
    render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/seats: 0/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /clear all/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add guests/i })).toBeDefined();
  });

  it('should have a three-section layout (header, main, footer)', () => {
    const { container } = render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    const header = container.querySelector('.canvas-header');
    const main = container.querySelector('.canvas-main');
    const footer = container.querySelector('.canvas-footer');
    
    expect(header).toBeDefined();
    expect(main).toBeDefined();
    expect(footer).toBeDefined();
  });

  it('should have an icon bank sidebar within main', () => {
    const { container } = render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    const iconBank = container.querySelector('.icon-bank');
    expect(iconBank).toBeDefined();
  });

  it('should have a grid canvas within main', () => {
    const { container } = render(
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    );
    
    const gridCanvas = container.querySelector('.grid-canvas');
    expect(gridCanvas).toBeDefined();
  });
});
