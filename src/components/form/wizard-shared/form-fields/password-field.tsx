'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes } from 'react';

import styles from './form-fields.module.css';

interface PasswordFieldProps {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
  hint?: string;
  id?: string;
}

function FieldError({ id, message }: Readonly<{ id: string; message: string }>) {
  return (
    <span id={id} className={styles.error} role="alert">
      {message}
    </span>
  );
}

export function PasswordField({
  label,
  required,
  className,
  error,
  hint,
  id: idProp,
  autoComplete = 'new-password',
  disabled,
  ...props
}: PasswordFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined;
  const [visible, setVisible] = useState(false);

  return (
    <label className={`${styles.field} ${className ?? ''}`}>
      <span className={styles.label}>
        {label}
        {required ? (
          <span className={styles.required}>*</span>
        ) : (
          <span className={styles.optional}>Optional</span>
        )}
      </span>

      <div className={styles.passwordWrap}>
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${styles.passwordInput} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((show) => !show)}
        >
          {visible ? (
            <EyeOff className={styles.passwordToggleIcon} aria-hidden />
          ) : (
            <Eye className={styles.passwordToggleIcon} aria-hidden />
          )}
        </button>
      </div>
      {hint && !error ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      {error ? <FieldError id={errorId} message={error} /> : null}
    </label>
  );
}
