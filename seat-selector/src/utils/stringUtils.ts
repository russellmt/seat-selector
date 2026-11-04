/**
 * String utility functions for guest name and title validation
 * Provides validation, initials extraction, and other string operations
 */

/**
 * Validation result object
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Extracts initials from a guest name (max 2 characters)
 * Takes the first letter of each word, up to 2 letters total
 *
 * Examples:
 * - "John Smith" -> "JS"
 * - "Alice" -> "A"
 * - "Mary Jane Watson" -> "MW" (only first 2 words)
 *
 * @param name - the guest's name
 * @returns the initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Validates a guest name
 * Requirements:
 * - Must not be empty
 * - Must not be only whitespace
 * - Can contain letters, numbers, spaces, and special characters
 *
 * @param name - the guest name to validate
 * @returns validation result with valid flag and optional error message
 */
export function validateGuestName(name: string): ValidationResult {
  // Check if name is provided
  if (!name) {
    return {
      valid: false,
      error: 'Guest name is required',
    };
  }

  // Check if name is only whitespace
  if (!name.trim()) {
    return {
      valid: false,
      error: 'Guest name cannot be only whitespace',
    };
  }

  // Valid name
  return {
    valid: true,
  };
}

/**
 * Validates a title
 * Requirements:
 * - Must not exceed 32 characters
 * - Can be empty (optional field)
 * - Can contain any characters
 *
 * @param title - the title to validate
 * @returns validation result with valid flag and optional error message
 */
export function validateTitle(title: string): ValidationResult {
  // Check if title exceeds maximum length
  if (title.length > 32) {
    return {
      valid: false,
      error: `Title cannot exceed 32 characters (currently ${title.length} characters)`,
    };
  }

  // Valid title (including empty titles)
  return {
    valid: true,
  };
}

/**
 * Trims and normalizes a string by removing extra whitespace
 * Useful for cleaning user input before validation
 *
 * @param str - the string to normalize
 * @returns the normalized string
 */
export function normalizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Checks if a string is empty or only contains whitespace
 *
 * @param str - the string to check
 * @returns true if string is empty or whitespace-only
 */
export function isBlankString(str: string): boolean {
  return !str || !str.trim();
}

/**
 * Truncates a string to a maximum length, optionally adding ellipsis
 *
 * @param str - the string to truncate
 * @param maxLength - the maximum length
 * @param addEllipsis - whether to add "..." at the end (default: false)
 * @returns the truncated string
 */
export function truncateString(str: string, maxLength: number, addEllipsis: boolean = false): string {
  if (str.length <= maxLength) {
    return str;
  }

  const truncated = str.substring(0, maxLength);
  return addEllipsis ? truncated + '...' : truncated;
}
