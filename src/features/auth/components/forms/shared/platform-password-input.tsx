'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

import sharedStyles from './auth-form-shared.module.css';

type PlatformPasswordInputProps = Readonly<{
  id: string;
  name: string;
  className?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  invalid?: boolean;
}>;

export function PlatformPasswordInput({
  id,
  name,
  className,
  placeholder,
  autoComplete = 'current-password',
  required = false,
  invalid = false,
}: PlatformPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn(
        sharedStyles['password-wrap'],
        invalid && sharedStyles['password-wrap--invalid'],
      )}
    >
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={cn(sharedStyles.input, className)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className={sharedStyles['toggle-password']}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((show) => !show)}
      >
        {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </button>
    </div>
  );
}
