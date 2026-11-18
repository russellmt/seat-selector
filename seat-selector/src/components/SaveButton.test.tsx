import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveButton, SAVE_PHASE_1_TOOLTIP } from './SaveButton';

describe('SaveButton (Phase 1 placeholder)', () => {
  it('renders a Save button that is disabled', () => {
    render(<SaveButton />);

    const button = screen.getByRole('button', { name: /save/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows a tooltip explaining the Phase 1 limitation on hover', async () => {
    const { container } = render(<SaveButton />);

    fireEvent.mouseOver(container.querySelector('span.d-inline-block') as HTMLElement);

    const tooltip = await waitFor(() => {
      const found = screen.getByRole('tooltip');
      return found;
    });
    expect(tooltip.textContent).toBe(SAVE_PHASE_1_TOOLTIP);
    expect(tooltip.textContent).toMatch(/phase 1/i);
  });

  it('keeps the tooltip reachable by keyboard focus on the wrapper', async () => {
    const { container } = render(<SaveButton />);

    fireEvent.focus(container.querySelector('span.d-inline-block') as HTMLElement);

    const tooltip = await waitFor(() => screen.getByRole('tooltip'));
    expect(tooltip.textContent).toBe(SAVE_PHASE_1_TOOLTIP);
  });
});
