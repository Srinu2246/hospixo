'use client';

import { Shield } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { useAdminLoginMutation } from '@/hooks/auth/useAuthMutations';
import { isLoginSuccessResponse } from '@/services/auth';
import AdminLoginSplitLayout from '@/components/auth/AdminLoginSplitLayout';
import PasswordInput from '@shared/components/password-input/PasswordInput';
import { adminLoginContent } from '@/constants/auth/login';
import { siteConfig } from '@/constants/site';
import { cn } from '@/helpers/cn';
import type { LoginState } from '@/types/auth';

import styles from './login-form.module.css';

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, setState] = useState<LoginState>(initialState);
  const loginMutation = useAdminLoginMutation();
  const copy = adminLoginContent.form;
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;
  const pending = loginMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((previous) => ({
      ...previous,
      error: undefined,
      fieldErrors: undefined,
    }));

    const form = event.currentTarget;
    const formData = new FormData(form);

    loginMutation.mutate(formData, {
      onSuccess: ({ ok, payload }) => {
        if (ok && isLoginSuccessResponse(payload)) {
          window.location.assign(payload.redirectTo);
          return;
        }

        if (payload && !isLoginSuccessResponse(payload)) {
          setState(payload);
          return;
        }

        setState({
          error: adminLoginContent.errors.default,
          values: {
            email: String(formData.get('email') ?? '')
              .trim()
              .toLowerCase(),
          },
        });
      },
      onError: () => {
        setState({
          error: adminLoginContent.errors.unavailable,
          values: {
            email: String(formData.get('email') ?? '')
              .trim()
              .toLowerCase(),
          },
        });
      },
    });
  }

  return (
    <AdminLoginSplitLayout title={copy.title} description={copy.description}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            {copy.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            defaultValue={state.values?.email ?? ''}
            aria-invalid={Boolean(emailError) || undefined}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={cn(styles.input, emailError && styles.inputInvalid)}
            placeholder={copy.emailPlaceholder}
          />
          {emailError ? (
            <p id="email-error" role="alert" className={styles.fieldError}>
              {emailError}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            {copy.passwordLabel}
          </label>
          <PasswordInput
            id="password"
            name="password"
            placeholder={copy.passwordPlaceholder}
            required
            invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? 'password-error' : undefined}
          />
          {passwordError ? (
            <p id="password-error" role="alert" className={styles.fieldError}>
              {passwordError}
            </p>
          ) : null}
        </div>

        {state.error ? (
          <p role="alert" className={styles.error}>
            {state.error}
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'Signing in…' : copy.submitLabel}
        </button>

        <div className={styles.forgot}>
          <a
            href={`mailto:${siteConfig.links.supportEmail}?subject=Admin%20access%20assistance`}
            className={styles.forgotLink}
          >
            {copy.forgotPasswordLabel}
          </a>
        </div>

        <div className={styles.footer}>
          <span className={styles.securityBadge}>
            <Shield className={styles.securityIcon} aria-hidden />
            {copy.securityBadge}
          </span>
          <p className={styles.notice}>{copy.notice}</p>
        </div>
      </form>
    </AdminLoginSplitLayout>
  );
}
