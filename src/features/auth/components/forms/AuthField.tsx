import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Box, Stack, Typography } from '@mui/material';

import { authFieldLabelSx } from '@/features/auth/styles/authFieldStyles';
import { colors } from '@/lib/theme/mui/colors';

type AuthFieldProps = Readonly<{
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}>;

export function AuthField({ label, htmlFor, hint, children }: AuthFieldProps) {
  return (
    <Stack spacing={0.6}>
      <Typography component="label" htmlFor={htmlFor} sx={authFieldLabelSx}>
        {label}
      </Typography>
      {children}
      {hint ? (
        <Typography
          sx={{ m: 0, fontSize: '0.75rem', lineHeight: 1.5, color: colors.text.secondary }}
        >
          {hint}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function AuthFormError({ message }: Readonly<{ message: string }>) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }} role="alert">
      <ErrorOutlineIcon
        sx={{ width: 16, height: 16, flexShrink: 0, mt: 0.15, color: colors.danger.default }}
        aria-hidden
      />
      <Typography
        sx={{ m: 0, fontSize: '0.8125rem', lineHeight: 1.5, color: colors.danger.default }}
      >
        {message}
      </Typography>
    </Stack>
  );
}

export function AuthFormDivider({ label }: Readonly<{ label: string }>) {
  return (
    <Stack direction="row" spacing={1.1} sx={{ my: 0.5, alignItems: 'center' }} aria-hidden>
      <Box sx={{ flex: 1, height: '1px', backgroundColor: colors.border.default }} />
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: colors.text.secondary,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', backgroundColor: colors.border.default }} />
    </Stack>
  );
}
