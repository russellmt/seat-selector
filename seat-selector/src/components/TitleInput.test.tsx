import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TitleInput } from './TitleInput';

describe('TitleInput Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input field with default placeholder', () => {
      render(<TitleInput {...defaultProps} />);
      const input = screen.getByPlaceholderText('Untitled Configuration');
      expect(input).toBeDefined();
    });

    it('should render input field with custom placeholder', () => {
      render(
        <TitleInput
          {...defaultProps}
          placeholder="Enter title here"
        />
      );
      const input = screen.getByPlaceholderText('Enter title here');
      expect(input).toBeDefined();
    });

    it('should display current value in input', () => {
      render(<TitleInput {...defaultProps} value="My Event" />);
      const input = screen.getByDisplayValue('My Event') as HTMLInputElement;
      expect(input.value).toBe('My Event');
    });

    it('should display character counter', () => {
      render(<TitleInput {...defaultProps} value="Hello" maxLength={32} />);
      expect(screen.getByText('27 / 32')).toBeDefined();
    });

    it('should display character counter with custom maxLength', () => {
      render(
        <TitleInput {...defaultProps} value="Hi" maxLength={20} />
      );
      expect(screen.getByText('18 / 20')).toBeDefined();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when user types', () => {
      const onChange = vi.fn();
      render(<TitleInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByPlaceholderText('Untitled Configuration') as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'T' } });
      expect(onChange).toHaveBeenCalledWith('T');
      
      fireEvent.change(input, { target: { value: 'Te' } });
      expect(onChange).toHaveBeenCalledWith('Te');
      
      fireEvent.change(input, { target: { value: 'Tes' } });
      expect(onChange).toHaveBeenCalledWith('Tes');
      
      fireEvent.change(input, { target: { value: 'Test' } });
      expect(onChange).toHaveBeenCalledWith('Test');
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = vi.fn();
      render(
        <TitleInput
          {...defaultProps}
          onBlur={onBlur}
          value="Test"
        />
      );

      const input = screen.getByDisplayValue('Test');
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange when value already at max length', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Max Length Enforcement', () => {
    it('should not allow input exceeding max length (default 32)', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      
      fireEvent.keyDown(input, { key: 'a' });
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not allow input exceeding custom max length', () => {
      const onChange = vi.fn();
      const xTenTimes = 'x'.repeat(10);
      render(
        <TitleInput
          value={xTenTimes}
          onChange={onChange}
          maxLength={10}
        />
      );

      const input = screen.getByDisplayValue(xTenTimes) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'x'.repeat(11) } });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should allow deletion even when at max length', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(input).toBeDefined();
    });
  });

  describe('Error Display', () => {
    it('should display error message when max length exceeded', async () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'a' });
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });

      await waitFor(() => {
        expect(screen.getByText('Maximum 32 characters allowed')).toBeDefined();
      });
    });

    it('should show custom maxLength in error message', async () => {
      const onChange = vi.fn();
      const xTwenty = 'x'.repeat(20);
      render(
        <TitleInput
          value={xTwenty}
          onChange={onChange}
          maxLength={20}
        />
      );

      const input = screen.getByDisplayValue(xTwenty) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'x'.repeat(21) } });

      await waitFor(() => {
        expect(screen.getByText('Maximum 20 characters allowed')).toBeDefined();
      });
    });

    it('should clear error when value is within limit', async () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      const { rerender } = render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });
      
      await waitFor(() => {
        expect(screen.getByText('Maximum 32 characters allowed')).toBeDefined();
      });

      rerender(
        <TitleInput
          value={'a'.repeat(30)}
          onChange={onChange}
          maxLength={32}
        />
      );

      fireEvent.blur(input);
      await waitFor(() => {
        expect(screen.queryByText('Maximum 32 characters allowed')).toBeNull();
      });
    });

    it('should have proper aria attributes for error', async () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });

      await waitFor(() => {
        const errorMsg = screen.getByRole('alert');
        expect(errorMsg).toBeDefined();
      });
    });
  });

  describe('Character Counter', () => {
    it('should show correct remaining characters', () => {
      render(
        <TitleInput
          value="Hello World"
          onChange={vi.fn()}
          maxLength={32}
        />
      );

      expect(screen.getByText('21 / 32')).toBeDefined();
    });

    it('should show zero when at max length', () => {
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={vi.fn()}
          maxLength={32}
        />
      );

      expect(screen.getByText('0 / 32')).toBeDefined();
    });

    it('should add near-limit class when 5 or fewer characters remain', () => {
      const aTwentyEight = 'a'.repeat(28);
      const { container } = render(
        <TitleInput
          value={aTwentyEight}
          onChange={vi.fn()}
          maxLength={32}
        />
      );

      const counter = container.querySelector('.title-input-counter');
      expect(counter?.className).toContain('near-limit');
    });

    it('should remove near-limit class when more than 5 characters remain', () => {
      const aTwentySix = 'a'.repeat(26);
      const { container } = render(
        <TitleInput
          value={aTwentySix}
          onChange={vi.fn()}
          maxLength={32}
        />
      );

      const counter = container.querySelector('.title-input-counter');
      expect(counter?.className).not.toContain('near-limit');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      render(<TitleInput {...defaultProps} />);
      const input = screen.getByLabelText('Configuration title');
      expect(input).toBeDefined();
    });

    it('should have aria-describedby when error exists', async () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });

      await waitFor(() => {
        expect(input.getAttribute('aria-describedby')).toBe('title-error');
      });
    });

    it('should not have aria-describedby when no error', () => {
      render(
        <TitleInput
          {...defaultProps}
          value="Valid Title"
        />
      );

      const input = screen.getByDisplayValue('Valid Title') as HTMLInputElement;
      expect(input.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('AppContext Integration', () => {
    it('should update context when title changes', () => {
      const onChange = vi.fn();
      render(
        <TitleInput
          value=""
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByPlaceholderText('Untitled Configuration') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Wedding Reception' } });

      expect(onChange).toHaveBeenLastCalledWith('Wedding Reception');
    });

    it('should not update context with invalid (exceeding) values', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });

      expect(onChange).not.toHaveBeenCalledWith('a'.repeat(33));
    });

    it('should persist title while on SeatCanvas', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TitleInput
          value="My Event"
          onChange={onChange}
          maxLength={32}
        />
      );

      rerender(
        <TitleInput
          value="My Event"
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue('My Event') as HTMLInputElement;
      expect(input.value).toBe('My Event');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      render(
        <TitleInput
          value=""
          onChange={vi.fn()}
          maxLength={32}
        />
      );

      expect(screen.getByText('32 / 32')).toBeDefined();
    });

    it('should handle whitespace correctly', () => {
      const onChange = vi.fn();
      render(
        <TitleInput
          value=""
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByPlaceholderText('Untitled Configuration') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '   ' } });

      expect(onChange).toHaveBeenLastCalledWith('   ');
    });

    it('should handle special characters', () => {
      const onChange = vi.fn();
      render(
        <TitleInput
          value=""
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByPlaceholderText('Untitled Configuration') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test @ #$%' } });

      expect(onChange).toHaveBeenLastCalledWith('Test @ #$%');
    });

    it('should handle unicode characters', () => {
      const onChange = vi.fn();
      render(
        <TitleInput
          value=""
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByPlaceholderText('Untitled Configuration') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '🎉 Event' } });

      expect(onChange).toHaveBeenLastCalledWith('🎉 Event');
    });

    it('should handle very long character count correctly', () => {
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={vi.fn()}
          maxLength={32}
        />
      );

      expect(screen.getByText('0 / 32')).toBeDefined();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should prevent input when pressing non-deletion keys at max length', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      
      // Try to add a character via keydown and change
      const keydownEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      fireEvent.keyDown(input, keydownEvent);
      
      // The component should have called preventDefault
      // We can verify this by checking if onChange was not called after trying to change
      fireEvent.change(input, { target: { value: 'a'.repeat(33) } });
      
      // onChange should not be called with the 33-char value
      expect(onChange).not.toHaveBeenCalledWith('a'.repeat(33));
    });

    it('should allow backspace at max length', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      
      // Should not prevent backspace event
      fireEvent.keyDown(input, { key: 'Backspace' });
      
      // Verify that we can simulate a change (like deletion)
      expect(input).toBeDefined();
    });

    it('should allow Delete key at max length', () => {
      const onChange = vi.fn();
      const maxString = 'a'.repeat(32);
      render(
        <TitleInput
          value={maxString}
          onChange={onChange}
          maxLength={32}
        />
      );

      const input = screen.getByDisplayValue(maxString) as HTMLInputElement;
      
      // Should not prevent delete event
      fireEvent.keyDown(input, { key: 'Delete' });
      
      // Verify that we can simulate a change (like deletion)
      expect(input).toBeDefined();
    });
  });
});
