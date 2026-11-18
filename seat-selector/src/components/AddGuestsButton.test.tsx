import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AddGuestsButton } from './AddGuestsButton';

function renderWithRoutes() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/canvas']}>
        <Routes>
          <Route path="/canvas" element={<AddGuestsButton />} />
          <Route path="/arrangement" element={<p>Guest arrangement page</p>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('AddGuestsButton', () => {
  it('renders an Add Guests button', () => {
    renderWithRoutes();

    expect(screen.getByRole('button', { name: /navigate to guest arrangement page/i })).toBeDefined();
    expect(screen.getByText('Add Guests')).toBeDefined();
  });

  it('navigates to the guest arrangement page on click', () => {
    renderWithRoutes();

    fireEvent.click(screen.getByRole('button', { name: /navigate to guest arrangement page/i }));

    expect(screen.getByText('Guest arrangement page')).toBeDefined();
  });
});
