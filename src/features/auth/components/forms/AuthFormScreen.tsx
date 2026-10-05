'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import type { z } from 'zod';

import { AuthSplitLayout } from '@/features/auth/components/AuthSplitLayout';
import { AuthFormError } from '@/features/auth/components/forms/AuthField';
import {
  authLinkSx,
  authPrimaryButtonSx,
  authTextFieldSx,
} from '@/features/auth/styles/authFieldStyles';

type AuthFormScreenProps<S extends z.ZodType<FieldValues, FieldValues>> = Readonly<{
  title: string;
  description: string;
  footer?: React.ReactNode;
  cardSx?: Record<string, unknown>;
  schema: S;
  defaultValues: DefaultValues<z.infer<S>>;
  submitLabel: string;
  backHref?: string;
  backLabel?: string;
  serverError?: string;
  onSubmit: (values: z.infer<S>) => Promise<void> | void;
  children: (helpers: {
    register: ReturnType<typeof useForm<z.infer<S>>>['register'];
    errors: ReturnType<typeof useForm<z.infer<S>>>['formState']['errors'];
  }) => React.ReactNode;
}>;

export function AuthFormScreen<S extends z.ZodType<FieldValues, FieldValues>>({
  title,
  description,
  footer,
  cardSx,
  schema,
  defaultValues,
  submitLabel,
  backHref,
  backLabel,
  serverError,
  onSubmit,
  children,
}: AuthFormScreenProps<S>) {
  type FormValues = z.infer<S>;
  const [submitError, setSubmitError] = useState<string | undefined>(serverError);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // @hookform/resolvers + Zod v4 typing gap — runtime validation is correct.
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues,
  });

  const displayError = submitError ?? (Object.values(errors)[0]?.message as string | undefined);

  return (
    <AuthSplitLayout title={title} description={description} footer={footer} cardSx={cardSx}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          setSubmitError(undefined);
          try {
            await onSubmit(values);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Something went wrong. Please try again.';
            setSubmitError(message);
          }
        })}
      >
        <Stack spacing={2}>
          {children({ register, errors })}

          {displayError ? <AuthFormError message={displayError} /> : null}

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={authPrimaryButtonSx}
          >
            {submitLabel}
          </Button>

          {backHref && backLabel ? (
            <Box sx={{ textAlign: 'center', mt: 0.2 }}>
              <Box component={Link} href={backHref} sx={authLinkSx}>
                {backLabel}
              </Box>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </AuthSplitLayout>
  );
}

type AuthTextFieldProps = Readonly<{
  id: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  errorMessage?: string;
}>;

export function AuthTextField({
  id,
  registration,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  errorMessage,
}: AuthTextFieldProps) {
  return (
    <TextField
      id={id}
      fullWidth
      type={type}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete={autoComplete}
      error={Boolean(errorMessage)}
      slotProps={{
        input: {
          'aria-invalid': Boolean(errorMessage),
        },
      }}
      sx={authTextFieldSx}
      {...registration}
    />
  );
}

export function AuthScreenFooterLink({
  prefix,
  href,
  label,
}: Readonly<{
  prefix: string;
  href: string;
  label: string;
}>) {
  return (
    <>
      {prefix}{' '}
      <Link href={href} style={{ color: 'inherit', fontWeight: 600 }}>
        {label}
      </Link>
    </>
  );
}
