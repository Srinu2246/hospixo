'use client';

import { AuthFormScreen, AuthTextField } from '@/features/auth/components/forms/AuthFormScreen';
import { AuthField } from '@/features/auth/components/forms/AuthField';
import { forgotPasswordContent } from '@/features/auth/config/forgot-password';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { forgotPasswordSchema } from '@/features/auth/schemas/forgotPasswordSchema';
import { AUTH_ROUTES } from '@/lib/constants/routes';

type ForgotPasswordFormProps = Readonly<{
  serverError?: string;
  defaultEmail?: string;
}>;

export function ForgotPasswordForm({ serverError, defaultEmail = '' }: ForgotPasswordFormProps) {
  const copy = forgotPasswordContent.request;
  const authSubmit = useAuthSubmit();

  return (
    <AuthFormScreen
      title={copy.title}
      description={copy.description}
      schema={forgotPasswordSchema}
      defaultValues={{ email: defaultEmail }}
      submitLabel={copy.submitLabel}
      backHref={AUTH_ROUTES.login}
      backLabel={copy.backLabel}
      serverError={serverError}
      onSubmit={authSubmit.forgotPassword}
    >
      {({ register, errors }) => (
        <AuthField label={copy.emailLabel} htmlFor="email">
          <AuthTextField
            id="email"
            type="email"
            registration={register('email')}
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            errorMessage={errors.email?.message}
          />
        </AuthField>
      )}
    </AuthFormScreen>
  );
}
