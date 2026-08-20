/**
 * Kenya Revenue Authority (KRA) PIN validation utilities.
 * Format: one uppercase letter + 9 digits + one uppercase letter (e.g. A000000000W)
 * No API needed — pure regex.
 */

/** Official KRA PIN format regex */
export const KRA_PIN_REGEX = /^[A-Z]\d{9}[A-Z]$/;

/**
 * Validate a KRA PIN string.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateKraPin(pin: string): string | null {
  if (!pin || !pin.trim()) return null; // Optional field — skip if empty
  const trimmed = pin.trim().toUpperCase();
  if (!KRA_PIN_REGEX.test(trimmed)) {
    return "Invalid KRA PIN format. Expected format: A000000000W (1 letter + 9 digits + 1 letter)";
  }
  return null;
}

/**
 * React hook-friendly validator for use with form validation libraries.
 * Returns true if valid (or empty/optional), false if invalid.
 */
export function isValidKraPin(pin: string | null | undefined): boolean {
  if (!pin || !pin.trim()) return true; // Optional
  return KRA_PIN_REGEX.test(pin.trim().toUpperCase());
}

/**
 * Format a raw KRA PIN string to canonical uppercase form.
 */
export function formatKraPin(pin: string): string {
  return pin.trim().toUpperCase();
}
