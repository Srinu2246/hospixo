'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

import styles from './password-input.module.css';

type PasswordInputProps = Readonly<{
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  invalid?: boolean;
  'aria-describedby'?: string;
}>;

export default function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete = 'current-password',
  required = false,
  className,
  invalid = false,
  'aria-describedby': ariaDescribedBy,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrap}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={cn(styles.input, invalid && styles.invalid, className)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
      />
      <button
        type="button"
        className={styles.toggle}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((show) => !show)}
      >
        {visible ? (
          <EyeOff className={styles.toggleIcon} aria-hidden />
        ) : (
          <Eye className={styles.toggleIcon} aria-hidden />
        )}
      </button>
    </div>
  );
}
