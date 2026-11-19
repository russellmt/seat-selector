import React, { useId, useState } from "react";
import { validateGuestName } from "../utils";
import "./AddGuestInput.css";

/**
 * Props for the AddGuestInput component
 */
export interface AddGuestInputProps {
  /** Called with the trimmed guest name. Only called when the name is valid. */
  onSubmit: (name: string) => void;

  /** Called when the user cancels (Escape key or Cancel button) */
  onCancel: () => void;
}

/**
 * AddGuestInput Component
 *
 * Inline form for entering a new guest's name. The name is validated on submit:
 * an empty or whitespace-only name shows a validation message and does not
 * call `onSubmit`. Enter submits the form, and Escape cancels.
 *
 * **Validates: Requirements 21.3, 21.4, 21.5**
 *
 * @example
 * ```tsx
 * <AddGuestInput onSubmit={(name) => addGuest(name)} onCancel={() => setAdding(false)} />
 * ```
 */
export const AddGuestInput: React.FC<AddGuestInputProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = validateGuestName(name);
    if (!result.valid) {
      setError(result.error ?? "Guest name is invalid");
      return;
    }

    onSubmit(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form className="add-guest-input" onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        className="add-guest-input-field"
        value={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Guest name"
        aria-label="Guest name"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoFocus
      />

      {error && (
        <div id={errorId} className="add-guest-input-error" role="alert">
          {error}
        </div>
      )}

      <div className="add-guest-input-actions">
        <button type="submit" className="add-guest-input-submit">
          Add
        </button>
        <button type="button" className="add-guest-input-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddGuestInput;
