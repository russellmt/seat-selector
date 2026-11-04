import React, { useState, useCallback } from 'react';
import './TitleInput.css';

/**
 * Props for the TitleInput component
 */
export interface TitleInputProps {
  /** Current value of the title input */
  value: string;

  /** Callback when the input value changes */
  onChange: (title: string) => void;

  /** Optional callback when the input loses focus */
  onBlur?: () => void;

  /** Maximum number of characters allowed (default: 32) */
  maxLength?: number;

  /** Placeholder text when input is empty (default: "Untitled Configuration") */
  placeholder?: string;
}

/**
 * TitleInput Component
 *
 * A controlled text input component for entering a seating configuration title.
 * Features include:
 * - Max 32 character limit with validation
 * - Real-time updates to AppContext
 * - Error display when limit is exceeded (prevents exceeding)
 * - Placeholder text for guidance
 * - Keyboard support (Enter to confirm)
 * - Focus management
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 *
 * @example
 * ```tsx
 * const [title, setTitle] = useState('');
 *
 * <TitleInput
 *   value={title}
 *   onChange={setTitle}
 *   maxLength={32}
 *   placeholder="Enter configuration title"
 * />
 * ```
 */
export const TitleInput: React.FC<TitleInputProps> = ({
  value,
  onChange,
  onBlur,
  maxLength = 32,
  placeholder = 'Untitled Configuration',
}) => {
  // Local state for error handling
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Enforce max length - don't allow exceeding
      if (newValue.length > maxLength) {
        setError(`Maximum ${maxLength} characters allowed`);
        return;
      }

      // Clear error if we're within limit
      if (error) {
        setError(null);
      }

      // Call onChange callback to update parent
      onChange(newValue);
    },
    [maxLength, onChange, error]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent further input if already at max length
      if (value.length >= maxLength && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
        setError(`Maximum ${maxLength} characters allowed`);
      }
    },
    [value.length, maxLength]
  );

  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur();
    }
    // Clear error on blur if value is valid
    if (value.length <= maxLength) {
      setError(null);
    }
  }, [value.length, maxLength, onBlur]);

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars <= 5 && remainingChars > 0;

  return (
    <div className="title-input-container">
      <input
        type="text"
        className="title-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label="Configuration title"
        aria-describedby={error ? 'title-error' : undefined}
      />

      {/* Character counter */}
      <div className={`title-input-counter ${isNearLimit ? 'near-limit' : ''}`}>
        {remainingChars} / {maxLength}
      </div>

      {/* Error message */}
      {error && (
        <div id="title-error" className="title-input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default TitleInput;
