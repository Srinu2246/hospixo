import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { AuthSplitLayout } from '@/features/auth/components/AuthSplitLayout';
import { forgotPasswordContent } from '@/features/auth/config/forgot-password';
import { authLinkSx } from '@/features/auth/styles/authFieldStyles';
import { AUTH_ROUTES } from '@/lib/constants/routes';
import { colors } from '@/lib/theme/mui/colors';

type ForgotPasswordSentProps = Readonly<{
  email: string;
}>;

export function ForgotPasswordSent({ email }: ForgotPasswordSentProps) {
  const copy = forgotPasswordContent.sent;

  return (
    <AuthSplitLayout title={copy.title} description="">
      <Stack spacing={2} sx={{ textAlign: 'center', pt: 1, alignItems: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: colors.auth.infoBg,
            color: colors.auth.accent,
          }}
          aria-hidden
        >
          <MailOutlineIcon />
        </Box>
        <Typography
          sx={{ m: 0, fontSize: '0.9375rem', lineHeight: 1.65, color: colors.text.secondary }}
        >
          {copy.descriptionPrefix} <strong>{email}</strong>, {copy.descriptionSuffix}
        </Typography>
        <Typography
          sx={{ m: 0, fontSize: '0.9375rem', lineHeight: 1.65, color: colors.text.secondary }}
        >
          {copy.spamHint}
        </Typography>
        <Box component={Link} href={AUTH_ROUTES.login} sx={authLinkSx}>
          {copy.backLabel}
        </Box>
        <Box component={Link} href={AUTH_ROUTES.forgotPassword} sx={authLinkSx}>
          {copy.resendLabel}
        </Box>
      </Stack>
    </AuthSplitLayout>
  );
}
