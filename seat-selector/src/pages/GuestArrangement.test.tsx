import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GuestArrangement from './GuestArrangement';

describe('GuestArrangement Page', () => {
  it('should render the GuestArrangement page', () => {
    render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Guest Arrangement')).toBeDefined();
  });

  it('should display the header with Back to Canvas button', () => {
    render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    const backButton = screen.getByRole('button', { name: /back to canvas/i });
    expect(backButton).toBeDefined();
  });

  it('should display the Guest List Panel sidebar', () => {
    render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/guest list panel/i)).toBeDefined();
  });

  it('should display the Grid Canvas area (display mode)', () => {
    render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/grid canvas.*display mode/i)).toBeDefined();
  });

  it('should display footer controls', () => {
    render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/0 \/ 0 filled/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /clear all/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined();
  });

  it('should have a three-section layout (header, main, footer)', () => {
    const { container } = render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    const header = container.querySelector('.arrangement-header');
    const main = container.querySelector('.arrangement-main');
    const footer = container.querySelector('.arrangement-footer');
    
    expect(header).toBeDefined();
    expect(main).toBeDefined();
    expect(footer).toBeDefined();
  });

  it('should have a guest list panel sidebar within main', () => {
    const { container } = render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    const guestListPanel = container.querySelector('.guest-list-panel');
    expect(guestListPanel).toBeDefined();
  });

  it('should have a grid canvas within main', () => {
    const { container } = render(
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    );
    
    const gridCanvas = container.querySelector('.grid-canvas');
    expect(gridCanvas).toBeDefined();
  });
});
