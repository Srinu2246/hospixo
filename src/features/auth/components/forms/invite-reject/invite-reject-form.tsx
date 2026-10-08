'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { routes } from '@/config/routes';
import { inviteRejectPageContent } from '@/features/auth/config/invite-reject';
import { AuthSplitLayout } from '@/features/auth/components/login-split-layout';
import { useRejectInvitationMutation } from '@/features/auth/hooks/use-public-invitation-mutations';
import {
  authFormStackSx,
  authSubmitButtonSx,
  authFooterLinkSx,
} from '@/features/auth/lib/auth-mui-form-styles';
import { validateInviteTokenForSubmit } from '@/features/auth/lib/validate-invite-token';

type InviteRejectFormProps = Readonly<{
  token: string;
}>;

export function InviteRejectForm({ token }: InviteRejectFormProps) {
  const router = useRouter();
  const copy = inviteRejectPageContent;
  const rejectMutation = useRejectInvitationMutation();
  const [error, setError] = useState<string | null>(null);

  const pending = rejectMutation.isPending;
  const hasInvalidLink = !token;
  const acceptHref = `${routes.auth.inviteAccept}?token=${encodeURIComponent(token)}`;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tokenError = validateInviteTokenForSubmit(token);
    if (tokenError) {
      setError(tokenError);
      return;
    }

    setError(null);

    rejectMutation.mutate(
      { token },
      {
        onSuccess: () => {
          router.push(`${routes.auth.login}?rejected=1`);
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
          <Link href={acceptHref} style={{ textDecoration: 'none' }}>
            <Box component="span" sx={authFooterLinkSx}>
              {copy.footerLinkLabel}
            </Box>
          </Link>
        </>
      }
    >
      <Box component="form" onSubmit={onSubmit}>
        <Stack sx={authFormStackSx}>
          {hasInvalidLink ? (
            <Alert severity="error" role="alert" sx={{ borderRadius: '8px' }}>
              {copy.errors.missingToken}
            </Alert>
          ) : null}

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
