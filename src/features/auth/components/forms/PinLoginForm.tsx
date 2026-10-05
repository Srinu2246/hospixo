'use client';

import {
  AuthFormScreen,
  AuthScreenFooterLink,
  AuthTextField,
} from '@/features/auth/components/forms/AuthFormScreen';
import { AuthField } from '@/features/auth/components/forms/AuthField';
import { pinLoginContent } from '@/features/auth/config/pin-login';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { pinLoginSchema } from '@/features/auth/schemas/pinLoginSchema';
import { AUTH_ROUTES } from '@/lib/constants/routes';

type PinLoginFormProps = Readonly<{
  serverError?: string;
  defaultBranchId?: string;
}>;

export function PinLoginForm({ serverError, defaultBranchId = '' }: PinLoginFormProps) {
  const copy = pinLoginContent;
  const authSubmit = useAuthSubmit();

  return (
    <AuthFormScreen
      title={copy.title}
      description={copy.description}
      footer={
        <AuthScreenFooterLink
          prefix={copy.footerPrefix}
          href={AUTH_ROUTES.login}
          label={copy.footerLinkLabel}
        />
      }
      schema={pinLoginSchema}
      defaultValues={{ branch_id: defaultBranchId, quick_pin: '' }}
      submitLabel={copy.submitLabel}
      serverError={serverError}
      onSubmit={authSubmit.pinLogin}
    >
      {({ register, errors }) => (
        <>
          <AuthField label={copy.branchLabel} htmlFor="branch_id">
            <AuthTextField
              id="branch_id"
              registration={register('branch_id')}
              placeholder={copy.branchPlaceholder}
              inputMode="numeric"
              errorMessage={errors.branch_id?.message}
            />
          </AuthField>
          <AuthField label={copy.pinLabel} htmlFor="quick_pin">
            <AuthTextField
              id="quick_pin"
              registration={register('quick_pin')}
              placeholder={copy.pinPlaceholder}
              inputMode="numeric"
              autoComplete="one-time-code"
              errorMessage={errors.quick_pin?.message}
            />
          </AuthField>
        </>
      )}
    </AuthFormScreen>
  );
}
