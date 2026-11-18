import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClearAllButton } from './ClearAllButton';

describe('ClearAllButton', () => {
  it('renders a Clear All button without opening the dialog', () => {
    render(<ClearAllButton onConfirm={vi.fn()} />);

    expect(screen.getByRole('button', { name: /clear all/i })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'Clear all seats?' })).toBeNull();
  });

  it('opens a confirmation dialog on click and does not clear yet', () => {
    const onConfirm = vi.fn();
    render(<ClearAllButton onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));

    expect(screen.getByRole('heading', { name: 'Clear all seats?' })).toBeDefined();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm once and closes the dialog when the user confirms', () => {
    const onConfirm = vi.fn();
    render(<ClearAllButton onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('heading', { name: 'Clear all seats?' })).toBeNull();
  });

  it('does not call onConfirm when the user cancels', () => {
    const onConfirm = vi.fn();
    render(<ClearAllButton onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Clear all seats?' })).toBeNull();
  });
});
