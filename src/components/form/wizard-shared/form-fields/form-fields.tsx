'use client';

import {
  useId,
  useRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import styles from './form-fields.module.css';
import { useAutoFocus } from './use-auto-focus';

interface FormFieldProps {
  label: string;
  required?: boolean;
  /** When false, hides the "Optional" suffix on non-required fields (filters, etc.). */
  showOptional?: boolean;
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

function fieldOptionalSuffix(required: boolean | undefined, showOptional: boolean | undefined) {
  if (required) {
    return <span className={styles.required}>*</span>;
  }
  if (showOptional === false) {
    return null;
  }
  return <span className={styles.optional}>Optional</span>;
}

export function TextField({
  label,
  required,
  showOptional,
  className,
  error,
  hint,
  id: idProp,
  autoFocus,
  ...props
}: FormFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `${inputId}-error`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined;

  useAutoFocus(inputRef, Boolean(autoFocus));

  return (
    <label className={`${styles.field} ${className ?? ''}`}>
      <span className={styles.label}>
        {label}
        {fieldOptionalSuffix(required, showOptional)}
      </span>

      <input
        ref={inputRef}
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      {error ? <FieldError id={errorId} message={error} /> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  required,
  showOptional,
  className,
  error,
  id: idProp,
  ...props
}: FormFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const textareaId = idProp ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <label className={`${styles.field} ${className ?? ''}`}>
      <span className={styles.label}>
        {label}
        {fieldOptionalSuffix(required, showOptional)}
      </span>

      <textarea
        id={textareaId}
        className={`${styles.textarea} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? <FieldError id={errorId} message={error} /> : null}
    </label>
  );
}

type SelectOption = Readonly<{ value: string; label: string }>;

type SelectFieldProps = FormFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    options: readonly SelectOption[] | readonly string[];
    placeholder?: string;
    onValueChange?: (value: string) => void;
  };

export function SelectField({
  label,
  required,
  showOptional,
  className,
  error,
  hint,
  id: idProp,
  options,
  placeholder,
  onValueChange,
  onChange,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = idProp ?? generatedId;
  const errorId = `${selectId}-error`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined;

  const normalizedOptions: SelectOption[] = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );

  return (
    <label className={`${styles.field} ${className ?? ''}`}>
      <span className={styles.label}>
        {label}
        {fieldOptionalSuffix(required, showOptional)}
      </span>

      <select
        id={selectId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      {error ? <FieldError id={errorId} message={error} /> : null}
    </label>
  );
}

export { styles as companyFormStyles };
