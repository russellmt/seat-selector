import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeatCountDisplay } from './SeatCountDisplay';

describe('SeatCountDisplay', () => {
  it('displays the total seat count', () => {
    render(<SeatCountDisplay count={7} />);

    expect(screen.getByText('Seats: 7')).toBeDefined();
  });

  it('displays zero when there are no seats', () => {
    render(<SeatCountDisplay count={0} />);

    expect(screen.getByText('Seats: 0')).toBeDefined();
  });

  it('updates the displayed count when the count prop changes', () => {
    const { rerender } = render(<SeatCountDisplay count={2} />);
    expect(screen.getByText('Seats: 2')).toBeDefined();

    rerender(<SeatCountDisplay count={3} />);
    expect(screen.getByText('Seats: 3')).toBeDefined();

    rerender(<SeatCountDisplay count={0} />);
    expect(screen.getByText('Seats: 0')).toBeDefined();
  });

  it('announces updates through a polite live region', () => {
    const { container } = render(<SeatCountDisplay count={1} />);

    const region = container.querySelector('.seat-count-text');
    expect(region?.getAttribute('aria-live')).toBe('polite');
  });
});
