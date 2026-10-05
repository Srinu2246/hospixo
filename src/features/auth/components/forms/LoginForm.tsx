'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthSplitLayout } from '@/features/auth/components/AuthSplitLayout';
import {
  AuthField,
  AuthFormDivider,
  AuthFormError,
} from '@/features/auth/components/forms/AuthField';
import { PasswordField } from '@/features/auth/components/forms/PasswordField';
import { loginPageContent } from '@/features/auth/config/login';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema';
import {
  authLinkSx,
  authPrimaryButtonSx,
  authTextFieldSx,
} from '@/features/auth/styles/authFieldStyles';
import { AUTH_ROUTES } from '@/lib/constants/routes';

type LoginFormProps = Readonly<{
  serverError?: string;
  defaultDomain?: string;
  defaultEmail?: string;
}>;

export function LoginForm({ serverError, defaultDomain = '', defaultEmail = '' }: LoginFormProps) {
  const copy = loginPageContent.form;
  const authSubmit = useAuthSubmit();
  const [submitError, setSubmitError] = useState<string | undefined>(serverError);
  const hasAuthError = Boolean(submitError);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      domain: defaultDomain,
      email: defaultEmail,
      password: '',
    },
  });

  const displayError = submitError ?? (Object.values(errors)[0]?.message as string | undefined);

  return (
    <AuthSplitLayout
      title={copy.title}
      description={copy.description}
      footer={
        <>
          {copy.footerPrefix} <a href={copy.contactUrl}>{copy.footerLinkLabel}</a>
        </>
      }
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          setSubmitError(undefined);
          try {
            await authSubmit.login(values);
          } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Sign in failed.');
          }
        })}
      >
        <Stack spacing={2}>
          <Stack spacing={0.6}>
            <AuthField label={copy.domainLabel} htmlFor="domain">
              <TextField
                id="domain"
                fullWidth
                placeholder={copy.domainPlaceholder}
                autoComplete="organization"
                error={Boolean(errors.domain) || hasAuthError}
                slotProps={{ input: { 'aria-invalid': hasAuthError } }}
                sx={authTextFieldSx}
                {...register('domain')}
              />
            </AuthField>
            <AuthField label={copy.emailLabel} htmlFor="email">
              <TextField
                id="email"
                fullWidth
                type="email"
                placeholder={copy.emailPlaceholder}
                autoComplete="username"
                error={Boolean(errors.email) || hasAuthError}
                slotProps={{ input: { 'aria-invalid': hasAuthError } }}
                sx={authTextFieldSx}
                {...register('email')}
              />
            </AuthField>
          </Stack>

          <AuthField label={copy.passwordLabel} htmlFor="password">
            <PasswordField
              id="password"
              placeholder={copy.passwordPlaceholder}
              error={errors.password}
              registration={register('password')}
            />
          </AuthField>

          {displayError ? <AuthFormError message={displayError} /> : null}

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={authPrimaryButtonSx}
          >
            {copy.submitLabel}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 0.2 }}>
            <Box component={Link} href={AUTH_ROUTES.forgotPassword} sx={authLinkSx}>
              {copy.forgotPasswordLabel}
            </Box>
          </Box>

          <AuthFormDivider label={copy.dividerLabel} />

          <Stack
            direction="row"
            sx={{
              width: '90%',
              mx: 'auto',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box component={Link} href={AUTH_ROUTES.otpLogin} sx={authLinkSx}>
              {copy.otpLabel}
            </Box>
            <Box component="a" href={process.env.NEXT_PUBLIC_SSO_LOGIN_URL ?? '#'} sx={authLinkSx}>
              {copy.ssoLabel}
            </Box>
          </Stack>
        </Stack>
      </Box>
    </AuthSplitLayout>
  );
}
