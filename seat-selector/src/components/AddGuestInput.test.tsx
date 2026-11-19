import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddGuestInput } from './AddGuestInput';

const renderInput = () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<AddGuestInput onSubmit={onSubmit} onCancel={onCancel} />);
  const input = screen.getByRole('textbox', { name: /guest name/i });
  return { input, onSubmit, onCancel };
};

describe('AddGuestInput', () => {
  it('submits the trimmed name when the name is valid', () => {
    const { input, onSubmit } = renderInput();

    fireEvent.change(input, { target: { value: '  John Smith  ' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('John Smith');
  });

  it('does not submit an empty name and shows a validation message', () => {
    const { onSubmit } = renderInput();

    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toBe('Guest name is required');
  });

  it('does not submit a whitespace-only name and shows a validation message', () => {
    const { input, onSubmit } = renderInput();

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toBe('Guest name cannot be only whitespace');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('clears the validation message when the user edits the name', () => {
    const { input } = renderInput();

    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByRole('alert')).toBeDefined();

    fireEvent.change(input, { target: { value: 'A' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('calls onCancel when Escape is pressed', () => {
    const { input, onCancel, onSubmit } = renderInput();

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const { onCancel } = renderInput();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
