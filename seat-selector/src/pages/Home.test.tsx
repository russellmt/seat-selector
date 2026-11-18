import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

describe('Home Page', () => {
  it('should render the Home page', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Seat Selector')).toBeDefined();
  });

  it('should display the Seat Canvas navigation dropdown', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const navDropdown = screen.getByText('Seat Canvas');
    expect(navDropdown).toBeDefined();
  });

  it('should display the Guest Arrangement navigation dropdown', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const navDropdown = screen.getByText('Guest Arrangement');
    expect(navDropdown).toBeDefined();
  });

  it('should display a description', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/create custom seating arrangements/i)).toBeDefined();
  });
});
