import { z } from 'zod';

// ============================================================================
// 1. Regular Expression Patterns
// ============================================================================

/** Person names: letters, spaces, apostrophes, and hyphens only. */
export const PERSON_NAME_REGEX = /^[a-zA-Z\s'-]+$/;

/** Phone numbers: numeric digits only. */
export const PHONE_NUMBER_REGEX = /^\d+$/;

/** Usernames: alphanumeric characters, dots, hyphens, and underscores only. */
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

// ============================================================================
// 2. Centralized App-Wide Field Schemas
// ============================================================================

/**
 * Global Person Name Schema
 * - Trimmed whitespace
 * - 1 to 50 characters (prevents DB column overflow)
 * - Letters, spaces, hyphens, and apostrophes only (no numbers or symbols)
 */
export const personNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name cannot exceed 50 characters')
  .regex(PERSON_NAME_REGEX, 'Name can only contain letters');

/**
 * Global Phone Number Schema
 * - Trimmed whitespace
 * - 6 to 15 numeric digits (ITU-T E.164 international standard)
 * - Digits only (no letters or symbols)
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Please enter a valid phone number')
  .max(15, 'Phone number cannot exceed 15 digits')
  .regex(PHONE_NUMBER_REGEX, 'Phone number must contain only numbers');

/**
 * Global Email Schema
 * - Trimmed whitespace (handles copy-paste trailing spaces)
 * - Max 254 characters (RFC 5321 length standard)
 * - Valid RFC email format
 */
export const emailSchema = z
  .string()
  .trim()
  .max(254, 'Email cannot exceed 254 characters')
  .email('Please enter a valid email address');

/**
 * Global Username Schema
 * - Trimmed whitespace
 * - 3 to 30 characters
 * - Letters, numbers, dots, hyphens, and underscores only (no spaces or emojis)
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(USERNAME_REGEX, 'Username can only contain letters, numbers, dots, and hyphens');

/**
 * Global Password Complexity Schema
 * - 8 to 72 characters (Bcrypt safe boundary)
 * - At least 1 uppercase letter
 * - At least 1 numeric digit
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[0-9]/, 'Password must include at least one digit')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');
