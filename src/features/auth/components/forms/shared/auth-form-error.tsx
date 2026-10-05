'use client';

import { AlertCircle } from 'lucide-react';

import sharedStyles from './auth-form-shared.module.css';

export function AuthFormError({ message }: Readonly<{ message: string }>) {
  return (
    <div className={sharedStyles.error} role="alert">
      <AlertCircle className={sharedStyles['error-icon']} aria-hidden />
      <p className={sharedStyles['error-message']}>{message}</p>
    </div>
  );
}
