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

  it('should display the "New Seat Config" button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const button = screen.getByRole('button', { name: /new seat config/i });
    expect(button).toBeDefined();
  });

  it('should display the "Load Existing Config" section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Load Existing Config')).toBeDefined();
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
