'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { routes } from '@/config/routes';
import { inviteAcceptPageContent } from '@/features/auth/config/invite-accept';
import { AuthSplitLayout } from '@/features/auth/components/login-split-layout';
import { AuthMuiField } from '@/features/auth/components/forms/shared/auth-mui-field';
import { AuthMuiPasswordField } from '@/features/auth/components/forms/shared/auth-mui-password-field';
import { useAcceptInvitationMutation } from '@/features/auth/hooks/use-public-invitation-mutations';
import {
  authFormStackSx,
  authSubmitButtonSx,
  authTextFieldSx,
  authFooterLinkSx,
} from '@/features/auth/lib/auth-mui-form-styles';
import { validateInviteTokenForSubmit } from '@/features/auth/lib/validate-invite-token';

type InviteAcceptFormProps = Readonly<{
  token: string;
}>;

export function InviteAcceptForm({ token }: InviteAcceptFormProps) {
  const router = useRouter();
  const copy = inviteAcceptPageContent;
  const acceptMutation = useAcceptInvitationMutation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pending = acceptMutation.isPending;
  const hasInvalidLink = !token;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tokenError = validateInviteTokenForSubmit(token);
    if (tokenError) {
      setError(tokenError);
      return;
    }

    if (!firstName.trim() || password.length < 8) {
      setError(copy.errors.validation);
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.errors.passwordMismatch);
      return;
    }

    setError(null);

    acceptMutation.mutate(
      {
        token,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
      },
      {
        onSuccess: () => {
          router.push(`${routes.auth.login}?accepted=1`);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : copy.errors.fallback);
        },
      },
    );
  }

  return (
    <AuthSplitLayout
      title={copy.title}
      description={copy.description}
      footer={
        <>
          {copy.footerPrefix}{' '}
          <Link href={routes.auth.login} style={{ textDecoration: 'none' }}>
            <Box component="span" sx={authFooterLinkSx}>
              {copy.footerLinkLabel}
            </Box>
          </Link>
        </>
      }
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack sx={authFormStackSx}>
          {hasInvalidLink ? (
            <Alert severity="error" role="alert" sx={{ borderRadius: '8px' }}>
              {copy.errors.missingToken}
            </Alert>
          ) : null}

          <AuthMuiField id="first_name" label={copy.fields.firstName.label}>
            <TextField
              id="first_name"
              hiddenLabel
              placeholder={copy.fields.firstName.placeholder}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (error) setError(null);
              }}
              autoComplete="given-name"
              required
              disabled={hasInvalidLink || pending}
              error={Boolean(error) && !firstName.trim()}
              fullWidth
              size="small"
              sx={authTextFieldSx}
            />
          </AuthMuiField>

          <AuthMuiField id="last_name" label={copy.fields.lastName.label}>
            <TextField
              id="last_name"
              hiddenLabel
              placeholder={copy.fields.lastName.placeholder}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={hasInvalidLink || pending}
              fullWidth
              size="small"
              sx={authTextFieldSx}
            />
          </AuthMuiField>

          <AuthMuiPasswordField
            id="password"
            label={copy.fields.password.label}
            placeholder={copy.fields.password.placeholder}
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (error) setError(null);
            }}
            autoComplete="new-password"
            required
            disabled={hasInvalidLink || pending}
            error={Boolean(error) && password.length < 8}
          />

          <AuthMuiPasswordField
            id="confirm_password"
            label={copy.fields.confirmPassword.label}
            placeholder={copy.fields.confirmPassword.placeholder}
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              if (error) setError(null);
            }}
            autoComplete="new-password"
            required
            disabled={hasInvalidLink || pending}
            error={passwordsMismatch || (Boolean(error) && password !== confirmPassword)}
            helperText={passwordsMismatch ? copy.errors.passwordMismatch : undefined}
          />

          {error ? (
            <Alert severity="error" role="alert" sx={{ borderRadius: '8px' }}>
              {error}
            </Alert>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={hasInvalidLink || pending}
            sx={authSubmitButtonSx}
          >
            {pending ? copy.submitting : copy.submit}
          </Button>
        </Stack>
      </Box>
    </AuthSplitLayout>
  );
}
