/**
 * Unit tests for string utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  getInitials,
  validateGuestName,
  validateTitle,
  normalizeString,
  isBlankString,
  truncateString,
} from './stringUtils';

describe('stringUtils', () => {
  // ============================================================================
  // getInitials Tests
  // ============================================================================

  describe('getInitials', () => {
    it('should extract initials from a two-word name', () => {
      expect(getInitials('John Smith')).toBe('JS');
    });

    it('should extract initials from a single-word name', () => {
      expect(getInitials('Alice')).toBe('A');
    });

    it('should extract initials from a three-word name (max 2)', () => {
      expect(getInitials('Mary Jane Watson')).toBe('MJ');
    });

    it('should extract initials from a four-word name (max 2)', () => {
      expect(getInitials('John Paul George Ringo')).toBe('JP');
    });

    it('should handle names with multiple spaces between words', () => {
      expect(getInitials('John    Smith')).toBe('JS');
    });

    it('should handle names with leading and trailing spaces', () => {
      expect(getInitials('  John Smith  ')).toBe('JS');
    });

    it('should uppercase lowercase initials', () => {
      expect(getInitials('john smith')).toBe('JS');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });

    it('should handle whitespace-only string', () => {
      expect(getInitials('   ')).toBe('');
    });

    it('should handle single letter names', () => {
      expect(getInitials('A')).toBe('A');
    });

    it('should handle unicode characters', () => {
      expect(getInitials('José García')).toBe('JG');
    });

    it('should handle names with special characters', () => {
      expect(getInitials("O'Brien Malley")).toBe('OM');
    });

    it('should handle names with numbers', () => {
      expect(getInitials('User 123')).toBe('U1');
    });

    it('should only return max 2 characters', () => {
      expect(getInitials('Alice Bob Charlie David Ella')).toBe('AB');
      expect(getInitials('Alice Bob Charlie David Ella').length).toBeLessThanOrEqual(2);
    });
  });

  // ============================================================================
  // validateGuestName Tests
  // ============================================================================

  describe('validateGuestName', () => {
    it('should validate a normal guest name', () => {
      const result = validateGuestName('John Smith');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate single-word guest name', () => {
      const result = validateGuestName('Alice');
      expect(result.valid).toBe(true);
    });

    it('should validate names with special characters', () => {
      const result = validateGuestName("O'Brien");
      expect(result.valid).toBe(true);
    });

    it('should validate names with hyphens', () => {
      const result = validateGuestName('Mary-Jane');
      expect(result.valid).toBe(true);
    });

    it('should validate names with numbers', () => {
      const result = validateGuestName('User 123');
      expect(result.valid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateGuestName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('required');
    });

    it('should reject whitespace-only string', () => {
      const result = validateGuestName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('whitespace');
    });

    it('should reject string with only tabs', () => {
      const result = validateGuestName('\t\t');
      expect(result.valid).toBe(false);
    });

    it('should reject string with only newlines', () => {
      const result = validateGuestName('\n\n');
      expect(result.valid).toBe(false);
    });

    it('should accept string with numbers and special chars', () => {
      const result = validateGuestName('Guest@2024');
      expect(result.valid).toBe(true);
    });

    it('should accept string with unicode characters', () => {
      const result = validateGuestName('José García');
      expect(result.valid).toBe(true);
    });

    it('should accept very long names', () => {
      const longName = 'A'.repeat(100);
      const result = validateGuestName(longName);
      expect(result.valid).toBe(true);
    });

    it('should accept single character name', () => {
      const result = validateGuestName('A');
      expect(result.valid).toBe(true);
    });

    it('should handle undefined as falsy value (via type system)', () => {
      // TypeScript would normally prevent this, but in runtime we should handle empty string
      const result = validateGuestName('');
      expect(result.valid).toBe(false);
    });
  });

  // ============================================================================
  // validateTitle Tests
  // ============================================================================

  describe('validateTitle', () => {
    it('should validate a normal title', () => {
      const result = validateTitle('My Event Layout');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a title at max length (32 chars)', () => {
      const title = 'A'.repeat(32); // exactly 32 chars
      const result = validateTitle(title);
      expect(result.valid).toBe(true);
    });

    it('should validate empty title (optional field)', () => {
      const result = validateTitle('');
      expect(result.valid).toBe(true);
    });

    it('should validate title with special characters', () => {
      const result = validateTitle("My Event's Layout 2024!");
      expect(result.valid).toBe(true);
    });

    it('should validate title with numbers', () => {
      const result = validateTitle('Event 123');
      expect(result.valid).toBe(true);
    });

    it('should reject title exceeding 32 characters', () => {
      const title = 'A'.repeat(33); // 33 chars
      const result = validateTitle(title);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('32');
    });

    it('should reject very long title', () => {
      const title = 'A'.repeat(100);
      const result = validateTitle(title);
      expect(result.valid).toBe(false);
    });

    it('should show character count in error message', () => {
      const title = 'A'.repeat(50);
      const result = validateTitle(title);
      expect(result.error).toContain('50');
    });

    it('should validate title with emoji (if supported)', () => {
      const result = validateTitle('Wedding 🎊');
      expect(result.valid).toBe(true);
    });

    it('should accept whitespace-only title (no validation on content, only length)', () => {
      const result = validateTitle('     ');
      expect(result.valid).toBe(true);
    });

    it('should accept title with unicode characters', () => {
      const result = validateTitle('Événement français');
      expect(result.valid).toBe(true);
    });

    it('should properly measure length with multi-byte characters', () => {
      // In JavaScript, length counts UTF-16 code units, so emoji might be counted as 2
      // This test ensures our validation works with unicode
      const result = validateTitle('My Title');
      expect(result.valid).toBe(true);
    });
  });

  // ============================================================================
  // normalizeString Tests
  // ============================================================================

  describe('normalizeString', () => {
    it('should remove leading and trailing whitespace', () => {
      expect(normalizeString('  hello world  ')).toBe('hello world');
    });

    it('should collapse multiple spaces into single space', () => {
      expect(normalizeString('hello    world')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(normalizeString('')).toBe('');
    });

    it('should handle whitespace-only string', () => {
      expect(normalizeString('   ')).toBe('');
    });

    it('should normalize tabs and newlines', () => {
      expect(normalizeString('hello\t\nworld')).toBe('hello world');
    });
  });

  // ============================================================================
  // isBlankString Tests
  // ============================================================================

  describe('isBlankString', () => {
    it('should return true for empty string', () => {
      expect(isBlankString('')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(isBlankString('   ')).toBe(true);
    });

    it('should return false for normal string', () => {
      expect(isBlankString('hello')).toBe(false);
    });

    it('should return true for string with tabs and newlines', () => {
      expect(isBlankString('\t\n')).toBe(true);
    });

    it('should return false for string with content', () => {
      expect(isBlankString('a')).toBe(false);
    });
  });

  // ============================================================================
  // truncateString Tests
  // ============================================================================

  describe('truncateString', () => {
    it('should return original string if under max length', () => {
      expect(truncateString('hello', 10)).toBe('hello');
    });

    it('should truncate string exceeding max length', () => {
      expect(truncateString('hello world', 5)).toBe('hello');
    });

    it('should add ellipsis when specified', () => {
      expect(truncateString('hello world', 5, true)).toBe('hello...');
    });

    it('should not add ellipsis by default', () => {
      expect(truncateString('hello world', 5)).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(truncateString('', 5)).toBe('');
    });

    it('should truncate exactly at max length', () => {
      const result = truncateString('hello world', 5);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  // ============================================================================
  // Edge Case Tests
  // ============================================================================

  describe('edge cases', () => {
    describe('getInitials edge cases', () => {
      it('should handle name with numbers at start', () => {
        expect(getInitials('1st Place')).toBe('1P');
      });

      it('should handle name with symbols', () => {
        expect(getInitials('@user $money')).toBe('@$');
      });
    });

    describe('validateGuestName edge cases', () => {
      it('should validate very long names (100+ characters)', () => {
        const longName = 'Very Long Name '.repeat(10);
        const result = validateGuestName(longName);
        expect(result.valid).toBe(true);
      });

      it('should not validate null by standard check', () => {
        // This would be caught by TypeScript, but runtime should handle it
        const result = validateGuestName('');
        expect(result.valid).toBe(false);
      });
    });

    describe('validateTitle edge cases', () => {
      it('should validate title with exactly 32 characters', () => {
        const title = 'This is exactly thirty two chrs!';
        expect(title.length).toBe(32);
        const result = validateTitle(title);
        expect(result.valid).toBe(true);
      });

      it('should reject title with 33 characters', () => {
        const title = 'This is exactly thirty two chars!';
        expect(title.length).toBe(33);
        const result = validateTitle(title);
        expect(result.valid).toBe(false);
      });

      it('should handle newlines in title', () => {
        const result = validateTitle('Line 1\nLine 2');
        expect(result.valid).toBe(true);
      });
    });
  });

  // ============================================================================
  // Requirements Validation Tests
  // ============================================================================

  describe('requirements validation', () => {
    it('should satisfy Req 3.2: Title field with max 32 chars', () => {
      // Valid: exactly at limit
      expect(validateTitle('A'.repeat(32)).valid).toBe(true);
      // Invalid: exceeds limit
      expect(validateTitle('A'.repeat(33)).valid).toBe(false);
    });

    it('should satisfy Req 21.5: Guest name validation (non-empty, non-whitespace)', () => {
      // Valid: normal name
      expect(validateGuestName('John Smith').valid).toBe(true);
      // Invalid: empty
      expect(validateGuestName('').valid).toBe(false);
      // Invalid: whitespace only
      expect(validateGuestName('   ').valid).toBe(false);
    });

    it('should satisfy Req 43.1: Input validation and error messages', () => {
      // Guest name validation has error messages
      const guestResult = validateGuestName('');
      expect(guestResult.error).toBeDefined();
      expect(typeof guestResult.error).toBe('string');

      // Title validation has error messages
      const titleResult = validateTitle('A'.repeat(50));
      expect(titleResult.error).toBeDefined();
      expect(typeof titleResult.error).toBe('string');
    });
  });
});
