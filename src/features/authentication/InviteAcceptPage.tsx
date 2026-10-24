'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { AuthSplitLayout } from '@/features/authentication/components/AuthSplitLayout';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import { useApiMutation } from '@/lib/hooks/api/useApiMutation';
import {
  acceptInvitationBodySchema,
  acceptInvitationFormSchema,
  acceptInvitationResultSchema,
  type AcceptInvitationFormValues,
} from '@/lib/schemas/auth/acceptInvitationSchema';
import { readInviteTokenFromSearch } from '@/lib/auth/readInviteToken';
import { screen } from '@/lib/theme/mui/breakpoints';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { useToastStore } from '@/stores/toastStore';

const INVALID_LINK_MESSAGE =
  'Invalid or missing invite link. Open the link from your invitation email.';
const ACCEPT_FAILED_MESSAGE = 'Unable to accept invitation.';

export interface InviteAcceptPageProps {
  token: string;
}

function inviteLinkError(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return INVALID_LINK_MESSAGE;
  const parsed = acceptInvitationFormSchema.shape.token.safeParse(trimmed);
  if (parsed.success) return null;
  return parsed.error.issues[0]?.message ?? INVALID_LINK_MESSAGE;
}

/**
 * Accept invitation — set name and password from email invite link (?token=…).
 */
export function InviteAcceptPage({ token }: Readonly<InviteAcceptPageProps>) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const acceptInvitation = useApiMutation<
    unknown,
    ReturnType<typeof acceptInvitationBodySchema.parse>
  >({
    path: ApiUrlsV1.invitations.accept,
    method: 'POST',
  });

  const [resolvedToken, setResolvedToken] = useState(token);
  const [tokenChecked, setTokenChecked] = useState(() => Boolean(token.trim()));
  const {
    control,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<z.input<typeof acceptInvitationFormSchema>, unknown, AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      token,
      firstName: '',
      lastName: '',
      password: '',
    },
  });

  const linkError = tokenChecked ? inviteLinkError(resolvedToken) : null;
  const firstName = watch('firstName');
  const lastName = watch('lastName') ?? '';
  const password = watch('password');
  const parsedForm = acceptInvitationFormSchema.safeParse({
    token: resolvedToken,
    firstName,
    lastName,
    password,
  });
  const formReady = parsedForm.success;
  const passwordIssue = parsedForm.success
    ? undefined
    : parsedForm.error.issues.find((issue) => issue.path[0] === 'password')?.message;
  const passwordHelper = password.length > 0 ? passwordIssue : errors.password?.message;
  const fieldsLocked = Boolean(linkError) || acceptInvitation.isPending;

  useEffect(() => {
    if (token.trim()) {
      setResolvedToken(token);
      setValue('token', token);
      setTokenChecked(true);
      return;
    }

    const fromLocation = readInviteTokenFromSearch(window.location.search);
    if (fromLocation) {
      setResolvedToken(fromLocation);
      setValue('token', fromLocation);
    }
    setTokenChecked(true);
  }, [setValue, token]);

  useEffect(() => {
    if (!tokenChecked || !linkError) return;
    showToast(linkError, 'error');
  }, [linkError, showToast, tokenChecked]);

  function reportError(message: string) {
    const text = message.replace(/Value error,\s*/gi, '').trim() || ACCEPT_FAILED_MESSAGE;
    setError('root', { message: text });
    showToast(text, 'error');
  }

  async function onSubmit(values: AcceptInvitationFormValues) {
    const blocked = inviteLinkError(values.token);
    if (blocked) {
      reportError(blocked);
      return;
    }

    try {
      const body = acceptInvitationBodySchema.parse({
        token: values.token,
        password: values.password,
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim() || null,
      });
      const raw = await acceptInvitation.mutateAsync(body);
      const result = acceptInvitationResultSchema.safeParse(raw);
      if (result.success && result.data.success === false) {
        reportError(result.data.message ?? ACCEPT_FAILED_MESSAGE);
        return;
      }
      router.push('/login?accepted=1');
    } catch (error) {
      reportError(getErrorMessage(error, ACCEPT_FAILED_MESSAGE));
    }
  }

  return (
    <AuthSplitLayout
      footer={
        <>
          Already have an account?{' '}
          <Box
            component={Link}
            href="/login"
            sx={{
              color: '#2563eb',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign in
          </Box>
        </>
      }
    >
      <Stack
        component="form"
        spacing={2.5}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!formReady || acceptInvitation.isPending) return;
          void onSubmit({
            token: resolvedToken,
            firstName,
            lastName,
            password,
          });
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { [screen.mobile]: '1.5rem', [screen.tablet]: '2rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Accept invitation
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              mt: 1.5,
              fontSize: { [screen.mobile]: '0.85rem', [screen.tablet]: '0.9375rem' },
              lineHeight: 1.65,
            }}
          >
            Create your password to join your team on Hospixo.
          </Typography>
        </Box>

        {linkError ? <AlertMessage variant="error" message={linkError} /> : null}

        {!linkError && errors.root?.message ? (
          <AlertMessage variant="error" message={errors.root.message} />
        ) : null}

        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Input
              id="invite-first-name"
              label="First name"
              placeholder="First name"
              autoComplete="given-name"
              required
              disabled={fieldsLocked}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              id="invite-last-name"
              label="Last name"
              placeholder="Last name"
              autoComplete="family-name"
              disabled={fieldsLocked}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              id="invite-password"
              label="Create password"
              type="password"
              placeholder="8+ characters, a number, and a symbol"
              autoComplete="new-password"
              required
              disabled={fieldsLocked}
              error={Boolean(passwordHelper)}
              helperText={passwordHelper}
              {...field}
            />
          )}
        />

        <ActionButton
          type="submit"
          size="large"
          fullWidth
          loading={acceptInvitation.isPending}
          disabled={!formReady}
          sx={{
            height: 48,
            borderRadius: { [screen.mobile]: '12px', [screen.desktop]: '10px' },
          }}
        >
          {acceptInvitation.isPending ? 'Creating account…' : 'Accept invitation'}
        </ActionButton>
      </Stack>
    </AuthSplitLayout>
  );
}
