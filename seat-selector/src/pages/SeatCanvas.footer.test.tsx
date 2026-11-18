import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import SeatCanvas from './SeatCanvas';
import { createSeat } from '../types/Seat';

/**
 * Test helper: exposes buttons that add seats through the real AppContext,
 * so the footer count is exercised against actual state changes.
 */
function SeatAdder() {
  const { addSeat } = useApp();
  return (
    <>
      <button onClick={() => addSeat(createSeat('chair-1', { col: 1, row: 1 }, 'down'))}>
        add-seat-1
      </button>
      <button onClick={() => addSeat(createSeat('chair-1', { col: 3, row: 5 }, 'down'))}>
        add-seat-2
      </button>
    </>
  );
}

function renderSeatCanvas() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/canvas']}>
        <SeatAdder />
        <Routes>
          <Route path="/canvas" element={<SeatCanvas />} />
          <Route path="/arrangement" element={<p>Guest arrangement page</p>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('SeatCanvas footer controls (Task 16)', () => {
  it('updates the seat count as seats are added', () => {
    renderSeatCanvas();
    expect(screen.getByText('Seats: 0')).toBeDefined();

    fireEvent.click(screen.getByText('add-seat-1'));
    expect(screen.getByText('Seats: 1')).toBeDefined();

    fireEvent.click(screen.getByText('add-seat-2'));
    expect(screen.getByText('Seats: 2')).toBeDefined();
  });

  it('removes all seats only after the user confirms Clear All', () => {
    const { container } = renderSeatCanvas();
    fireEvent.click(screen.getByText('add-seat-1'));
    fireEvent.click(screen.getByText('add-seat-2'));
    expect(screen.getByText('Seats: 2')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /clear all seats from canvas/i }));
    // Dialog is open but nothing has been cleared yet
    expect(screen.getByText('Seats: 2')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));

    expect(screen.getByText('Seats: 0')).toBeDefined();
    expect(container.querySelector('.canvas-footer')).not.toBeNull();
  });

  it('keeps seats when Clear All is cancelled', () => {
    renderSeatCanvas();
    fireEvent.click(screen.getByText('add-seat-1'));

    fireEvent.click(screen.getByRole('button', { name: /clear all seats from canvas/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Seats: 1')).toBeDefined();
  });

  it('shows a disabled Save placeholder in the footer', () => {
    renderSeatCanvas();

    const save = screen.getByRole('button', { name: /save/i }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
  });

  it('navigates to the guest arrangement page from Add Guests', () => {
    renderSeatCanvas();

    fireEvent.click(screen.getByRole('button', { name: /navigate to guest arrangement page/i }));

    expect(screen.getByText('Guest arrangement page')).toBeDefined();
  });
});
