'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { AUTH_ROUTES } from '@/constants/routes';
import { AuthSplitLayout } from '@/features/auth/components/login-split-layout';
import { AuthFormError } from '@/features/auth/components/forms/shared/auth-form-error';
import { PlatformPasswordInput } from '@/features/auth/components/forms/shared/platform-password-input';
import sharedStyles from '@/features/auth/components/forms/shared/auth-form-shared.module.css';
import { loginPageContent } from '@/features/auth/config/login';
import { usePlatformLoginMutation } from '@/hooks/auth/useAuthMutations';
import { isPlatformLoginSuccess } from '@/services/platform-auth';
import { cn } from '@/utils/cn';
import type { PlatformLoginState } from '@/types/platform-login';

import styles from './login-form.module.css';

export function PlatformLoginForm() {
  const [state, setState] = useState<PlatformLoginState>({});
  const loginMutation = usePlatformLoginMutation();
  const copy = loginPageContent.form;
  const hasAuthError = Boolean(state.error);
  const pending = loginMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((previous) => ({ ...previous, error: undefined, fieldErrors: undefined }));

    loginMutation.mutate(new FormData(event.currentTarget), {
      onSuccess: ({ ok, payload }) => {
        if (ok && payload && isPlatformLoginSuccess(payload)) {
          window.location.assign(payload.redirectTo);
          return;
        }
        if (payload && !isPlatformLoginSuccess(payload)) {
          setState(payload as PlatformLoginState);
          return;
        }
        setState({ error: 'Unable to sign in. Please try again.' });
      },
      onError: () => {
        setState({ error: 'Sign-in is temporarily unavailable. Please try again later.' });
      },
    });
  }

  return (
    <AuthSplitLayout
      title={copy.title}
      description={copy.description}
      footer={
        <>
          {copy.footerPrefix} <a href="https://hospixo.com/contact">{copy.footerLinkLabel}</a>
        </>
      }
    >
      <form className={sharedStyles.form} onSubmit={handleSubmit} noValidate>
        <div className={sharedStyles.field}>
          <label className={sharedStyles.label} htmlFor="domain">
            {copy.domainLabel}
          </label>
          <input
            id="domain"
            name="domain"
            type="text"
            defaultValue={state.values?.domain ?? ''}
            className={cn(sharedStyles.input, hasAuthError && sharedStyles.invalid)}
            placeholder={copy.domainPlaceholder}
            autoComplete="organization"
            required
          />
          {state.fieldErrors?.domain ? <AuthFormError message={state.fieldErrors.domain} /> : null}

          <label className={sharedStyles.label} htmlFor="email">
            {copy.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={state.values?.email ?? ''}
            className={cn(sharedStyles.input, hasAuthError && sharedStyles.invalid)}
            placeholder={copy.emailPlaceholder}
            autoComplete="username"
            required
          />
          {state.fieldErrors?.email ? <AuthFormError message={state.fieldErrors.email} /> : null}
        </div>

        <div className={sharedStyles.field}>
          <label className={sharedStyles.label} htmlFor="password">
            {copy.passwordLabel}
          </label>
          <PlatformPasswordInput
            id="password"
            name="password"
            className={cn(sharedStyles.input, hasAuthError && sharedStyles.invalid)}
            placeholder={copy.passwordPlaceholder}
            required
            invalid={hasAuthError || Boolean(state.fieldErrors?.password)}
          />
          {state.fieldErrors?.password ? (
            <AuthFormError message={state.fieldErrors.password} />
          ) : null}
        </div>

        {state.error ? <AuthFormError message={state.error} /> : null}

        <button type="submit" className={sharedStyles.submit} disabled={pending}>
          {pending ? copy.submittingLabel : copy.submitLabel}
        </button>

        <div className={styles.forgot}>
          <Link href={AUTH_ROUTES.forgotPassword}>{copy.forgotPasswordLabel}</Link>
        </div>

        <div className={styles.divider} aria-hidden>
          <span className={styles['divider-line']} />
          <span className={styles['divider-label']}>{copy.dividerLabel}</span>
          <span className={styles['divider-line']} />
        </div>

        <div className={styles['alt-actions']}>
          <Link href={AUTH_ROUTES.otpLogin}>{copy.otpLabel}</Link>
          <Link href={AUTH_ROUTES.sso}>{copy.ssoLabel}</Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
