'use client';

import { forwardRef, useState, type FocusEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input, type InputProps } from '@/components/shared/form-fields/Input';
import { colors } from '@/lib/theme/mui/colors';

export interface PasswordCriterion {
  id: string;
  label: string;
  satisfied: boolean;
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'endIcon'> {
  /** Helpful hint shown when input is clean and empty (default: 8+ chars, 1 uppercase, 1 digit, 1 special char) */
  hint?: string;
  /** Whether to render live inline criteria checklist pills below input (default: true) */
  showCriteria?: boolean;
  /** Whether to show the eye toggle button (default: true) */
  showToggle?: boolean;
  /** Optional focus event handler */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
}

const PASSWORD_RULES = [
  { id: 'length', label: '8+ characters', test: (v: string) => v.length >= 8 },
  { id: 'uppercase', label: '1 uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'number', label: '1 number', test: (v: string) => /[0-9]/.test(v) },
  { id: 'special', label: '1 special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

/**
 * Shared Password Input Field
 *
 * Provides a standardized password input with an eye toggle, live criteria verification,
 * and immediate inline error feedback matching Hospixo Design System & AGENTS.md rules.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      label = 'PASSWORD',
      placeholder = 'Enter password',
      hint = 'Must be at least 8 characters with 1 uppercase, 1 digit, and 1 special character',
      showCriteria = true,
      showToggle = true,
      error = false,
      helperText,
      reserveHelperSpace,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      sx,
      ...props
    },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const stringValue = typeof value === 'string' ? value : '';
    const hasTyped = stringValue.length > 0;

    const criteria: PasswordCriterion[] = PASSWORD_RULES.map((rule) => ({
      id: rule.id,
      label: rule.label,
      satisfied: rule.test(stringValue),
    }));

    const allSatisfied = criteria.every((c) => c.satisfied);

    const handleFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
      setIsFocused(true);
      onFocus?.(e as unknown as FocusEvent<HTMLInputElement>);
    };

    const handleBlurCapture = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <Box
        onFocusCapture={handleFocusCapture}
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', ...((sx as object) || {}) }}
      >
        <Input
          ref={ref}
          label={label}
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={handleBlurCapture}
          error={error}
          helperText={error ? helperText : undefined}
          reserveHelperSpace={
            reserveHelperSpace ?? (Boolean(showCriteria && hint) ? false : undefined)
          }
          fullWidth
          endIcon={
            showToggle ? (
              <IconButton
                type="button"
                size="small"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                sx={{
                  color: 'text.secondary',
                  p: 0.5,
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            ) : undefined
          }
          {...props}
        />

        {/* Live Criteria Checklist / Inline Guidance */}
        {showCriteria ? (
          <Box sx={{ mt: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {/* Show criteria chips when user has typed or when focused */}
            {(hasTyped || isFocused) && !allSatisfied ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  alignItems: 'center',
                }}
              >
                {criteria.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.25,
                      borderRadius: '6px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      bgcolor: item.satisfied
                        ? 'rgba(16, 185, 129, 0.1)'
                        : hasTyped
                          ? 'rgba(239, 68, 68, 0.08)'
                          : (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : colors.surface.muted,
                      color: item.satisfied
                        ? colors.success.default
                        : hasTyped
                          ? colors.danger.default
                          : colors.text.secondary,
                      border: '1px solid',
                      borderColor: item.satisfied
                        ? 'rgba(16, 185, 129, 0.2)'
                        : hasTyped
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.satisfied ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : (
                      <X size={12} strokeWidth={2.5} />
                    )}
                    <span>{item.label}</span>
                  </Box>
                ))}
              </Box>
            ) : !error && !hasTyped && hint ? (
              /* When clean & empty, show subtle hint if no error */
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: colors.text.secondary,
                  display: 'block',
                }}
              >
                {hint}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  },
);
