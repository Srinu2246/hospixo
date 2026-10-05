'use client';

import { AuthFormScreen, AuthTextField } from '@/features/auth/components/forms/AuthFormScreen';
import { AuthField } from '@/features/auth/components/forms/AuthField';
import { otpLoginContent } from '@/features/auth/config/otp-login';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { otpLoginSchema } from '@/features/auth/schemas/otpLoginSchema';
import { AUTH_ROUTES } from '@/lib/constants/routes';

type OtpLoginFormProps = Readonly<{
  serverError?: string;
  defaultIdentifier?: string;
}>;

export function OtpLoginForm({ serverError, defaultIdentifier = '' }: OtpLoginFormProps) {
  const copy = otpLoginContent.request;
  const authSubmit = useAuthSubmit();

  return (
    <AuthFormScreen
      title={copy.title}
      description={copy.description}
      schema={otpLoginSchema}
      defaultValues={{ identifier: defaultIdentifier }}
      submitLabel={copy.submitLabel}
      backHref={AUTH_ROUTES.login}
      backLabel={copy.backLabel}
      serverError={serverError}
      onSubmit={authSubmit.sendOtp}
    >
      {({ register, errors }) => (
        <AuthField label={copy.identifierLabel} htmlFor="identifier">
          <AuthTextField
            id="identifier"
            registration={register('identifier')}
            placeholder={copy.identifierPlaceholder}
            autoComplete="username"
            errorMessage={errors.identifier?.message}
          />
        </AuthField>
      )}
    </AuthFormScreen>
  );
}
