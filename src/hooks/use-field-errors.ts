'use client';

import { useCallback, useState } from 'react';
import { z, type ZodType, type ZodTypeAny } from 'zod';

import { getZodSchemaFieldError, zodFieldErrors } from '@/lib/validation/parse-errors';

export function useFieldErrors<T extends string>() {
  const [errors, setErrors] = useState<Partial<Record<T, string>>>({});

  const validate = useCallback((schema: ZodType, data: unknown): boolean => {
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }
    setErrors(zodFieldErrors(result.error) as Partial<Record<T, string>>);
    return false;
  }, []);

  const clearError = useCallback((field: T) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const setFieldError = useCallback((field: T, message: string | null) => {
    setErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  }, []);

  /** Validate a single field from a Zod object schema while typing. */
  const validateField = useCallback(
    (schema: ZodTypeAny, field: T, value: unknown) => {
      const fieldSchema = schema instanceof z.ZodObject ? schema.shape[field as string] : undefined;

      if (!fieldSchema) {
        return true;
      }

      const result = fieldSchema.safeParse(value);
      setFieldError(field, result.success ? null : (result.error.issues[0]?.message ?? null));
      return result.success;
    },
    [setFieldError],
  );

  /**
   * Validate one field using the full schema (required for `.superRefine` and cross-field rules).
   */
  const validateSchemaField = useCallback(
    (schema: ZodType, data: unknown, field: T) => {
      const message = getZodSchemaFieldError(schema, data, field);
      setFieldError(field, message);
      return message === null;
    },
    [setFieldError],
  );

  return {
    errors,
    validate,
    clearError,
    clearErrors,
    setErrors,
    setFieldError,
    validateField,
    validateSchemaField,
  };
}

/** Immediate confirm-password mismatch check. */
export function confirmPasswordError(password: string, confirmPassword: string): string | null {
  if (!confirmPassword.trim()) {
    return null;
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
}
