'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { AlertTriangle, Check, Eye, EyeOff, Info } from 'lucide-react';

import logoLight from '@/assets/app/logo-light.svg';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import {
  accountFromCurrentUser,
  loginFormSchema,
  loginResultSchema,
  readLoginUser,
  type LoginFormValues,
  type LoginUser,
} from '@/lib/schemas/login/loginFormSchema';
import { homePathForRole, sessionFromLoginUser } from '@/lib/auth/session';
import { useApiMutation } from '@/lib/hooks/api/useApiMutation';
import { screen } from '@/lib/theme/mui/breakpoints';
import { colors } from '@/lib/theme/mui/colors';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useToastStore } from '@/stores/toastStore';

/**
 * Login
 * 1. Brand panel
 * 2. Sign in, including invalid, inactive, and no-branch states
 */

type AccountNotice = 'inactive' | 'no_branch_access';

const FEATURES = [
  {
    title: 'Multi-branch control',
    body: 'One dashboard, every location.',
  },
  {
    title: 'Smart procurement',
    body: 'Auto-track stock, vendors & approvals.',
  },
  {
    title: 'Role-based access',
    body: 'Right permissions, right people.',
  },
  {
    title: 'Enterprise security',
    body: 'Audit logs, MFA, cloud-ready.',
  },
] as const;

const INVALID_MESSAGE = 'Invalid email, mobile number, or password. Please try again.';
const INACTIVE_MESSAGE = 'Your account is inactive. Contact your administrator.';
const BRANCH_MESSAGE = 'Access denied. You do not have permission to this branch.';

export function LoginPage() {
  const [notice, setNotice] = useState<AccountNotice | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: {
          [screen.mobile]: '1fr',
          [screen.tablet]: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
        },
        bgcolor: colors.white.default,
      }}
    >
      <BrandPanel />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { [screen.mobile]: 2, [screen.tablet]: 3 },
          py: { [screen.mobile]: 3, [screen.tablet]: 4 },
          bgcolor: { [screen.mobile]: colors.white.default, [screen.tablet]: '#f7f7f7' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '28rem',
            bgcolor: colors.white.default,
            border: {
              [screen.mobile]: 'none',
              [screen.tablet]: `1px solid ${colors.border.light}`,
            },
            borderRadius: { [screen.mobile]: 0, [screen.tablet]: '8px' },
            boxShadow: {
              [screen.mobile]: 'none',
              [screen.tablet]: '0 12px 40px rgb(15 23 42 / 0.06)',
            },
            px: { [screen.mobile]: 0.5, [screen.tablet]: 4 },
            py: { [screen.mobile]: 1, [screen.tablet]: 4 },
          }}
        >
          {notice ? <AccountBanner status={notice} sx={{ mb: 2 }} /> : null}
          <SignInForm
            credentialError={credentialError}
            onAccountNotice={setNotice}
            onCredentialError={setCredentialError}
          />
        </Box>
      </Box>
    </Box>
  );
}

function BrandPanel() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: { [screen.mobile]: 'none', [screen.tablet]: 'flex' },
        minHeight: '100vh',
        px: { [screen.tablet]: 2, [screen.desktop]: 6 },
        py: { [screen.tablet]: 3, [screen.desktop]: 6 },
        color: colors.login.headline,
        background: `
          radial-gradient(circle at 20% 20%, rgb(37 99 235 / 0.22), transparent 35%),
          radial-gradient(circle at 80% 0%, rgb(59 130 246 / 0.12), transparent 30%),
          linear-gradient(160deg, #081326 0%, #0f172a 48%, #111827 100%)
        `,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 544,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Image src={logoLight} alt="Hospixo" width={108} height={24} priority />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 544 }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
            }}
          >
            Run every hotel operation from one place.
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.0625rem', lineHeight: 1.65 }}
          >
            Hospixo gives hospitality teams one system for inventory, finance, HR, and daily ops.
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {FEATURES.map((feature) => (
            <Stack
              key={feature.title}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'flex-start' }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 24,
                  height: 24,
                  mt: 0.1,
                  borderRadius: '50%',
                  bgcolor: colors.white.default,
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={14} strokeWidth={3} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {feature.title}
                </Typography>
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.875rem', mt: 0.25 }}
                >
                  {feature.body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Typography
          sx={{
            display: 'block',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            mt: 0,
            maxWidth: 480,
          }}
        >
          Trusted by growing hospitality teams to simplify operations and improve control.
        </Typography>
      </Box>
    </Box>
  );
}

function AccountBanner({ status, sx }: Readonly<{ status: AccountNotice; sx?: SxProps<Theme> }>) {
  const inactive = status === 'inactive';

  return (
    <Box
      role="alert"
      sx={[
        {
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.25,
          px: 2,
          py: 1.5,
          borderRadius: '10px',
          bgcolor: inactive ? colors.login.inactiveSurface : colors.login.branchSurface,
          borderLeft: '3px solid',
          borderLeftColor: inactive ? colors.login.inactiveBorder : colors.login.branchBorder,
          color: inactive ? colors.danger.dark : colors.warning.dark,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{ mt: 0.15, color: inactive ? colors.login.inactiveBorder : colors.login.branchBorder }}
      >
        {inactive ? <Info size={16} /> : <AlertTriangle size={16} />}
      </Box>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.45 }}>
        {inactive ? INACTIVE_MESSAGE : BRANCH_MESSAGE}
      </Typography>
    </Box>
  );
}

function SignInForm({
  credentialError,
  onAccountNotice,
  onCredentialError,
}: Readonly<{
  credentialError: string | null;
  onAccountNotice: (notice: AccountNotice | null) => void;
  onCredentialError: (message: string | null) => void;
}>) {
  const router = useRouter();
  const setSession = useSidebarStore((state) => state.setSession);
  const showToast = useToastStore((state) => state.show);
  const [showPassword, setShowPassword] = useState(false);
  const login = useApiMutation<unknown, LoginFormValues>({
    path: ApiUrlsV1.auth.login,
    method: 'POST',
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    onAccountNotice(null);
    onCredentialError(null);

    try {
      const raw = await login.mutateAsync(values);
      const result = loginResultSchema.parse(raw);
      if (!result.success || result.data?.mfa_required) {
        applyFailure(result.message ?? INVALID_MESSAGE, onAccountNotice, onCredentialError);
        return;
      }
      const account = await loadAccount(raw);
      const session = sessionFromLoginUser(account);
      setSession(session);
      if (result.message) {
        showToast(result.message, 'success');
      }
      router.push(homePathForRole(session.role));
    } catch (error) {
      const message = error instanceof Error ? error.message : INVALID_MESSAGE;
      applyFailure(message, onAccountNotice, onCredentialError);
    }
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
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
          Welcome back to Hospixo
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            mt: 1.5,
            fontSize: { [screen.mobile]: '0.85rem', [screen.tablet]: '0.9375rem' },
            lineHeight: 1.65,
          }}
        >
          Sign in to manage your hospitality operations, teams, branches, inventory, billing, and
          daily workflows.
        </Typography>
      </Box>

      <Controller
        name="identifier"
        control={control}
        render={({ field }) => (
          <Input
            id="login-identifier"
            label="Email or Username"
            placeholder="Enter your email or username"
            autoFocus
            error={Boolean(errors.identifier)}
            helperText={errors.identifier?.message}
            value={field.value}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
        )}
      />

      <Box>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              error={Boolean(errors.password) || Boolean(credentialError)}
              helperText={errors.password?.message}
              value={field.value}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              endIcon={
                <IconButton
                  type="button"
                  size="small"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              }
            />
          )}
        />
        {credentialError ? (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start', mt: 0.75 }}>
            <Box sx={{ color: colors.danger.default, mt: '1px' }}>
              <Info size={14} />
            </Box>
            <Typography
              sx={{ color: colors.danger.default, fontSize: '0.8125rem', lineHeight: 1.4 }}
            >
              {credentialError}
            </Typography>
          </Stack>
        ) : null}
      </Box>

      <ActionButton
        type="submit"
        size="large"
        fullWidth
        loading={login.isPending}
        sx={{
          height: 48,
          borderRadius: { [screen.mobile]: '12px', [screen.desktop]: '10px' },
        }}
      >
        {login.isPending ? 'Signing in...' : 'Sign In'}
      </ActionButton>

      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          component="button"
          type="button"
          sx={{
            border: 0,
            bgcolor: 'transparent',
            p: 0,
            color: 'primary.main',
            font: 'inherit',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Forgot Password?
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ width: '100%', alignItems: 'center' }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            OR
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box
            component="button"
            type="button"
            sx={{
              border: 0,
              bgcolor: 'transparent',
              p: 0,
              color: 'primary.main',
              font: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in with OTP
          </Box>
          <Typography sx={{ color: 'text.disabled' }}>·</Typography>
          <Box
            component="button"
            type="button"
            sx={{
              border: 0,
              bgcolor: 'transparent',
              p: 0,
              color: 'primary.main',
              font: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in with SSO
          </Box>
        </Stack>
      </Stack>

      <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
        Don&apos;t have an account?{' '}
        <Box
          component="a"
          href="https://hospixo.com/contact"
          sx={{
            color: '#2563eb',
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Contact your administrator
        </Box>
      </Typography>
    </Stack>
  );
}

async function loadAccount(loginPayload: unknown): Promise<LoginUser> {
  const fromLogin = readLoginUser(loginPayload);
  try {
    return accountFromCurrentUser(await api.get(ApiUrlsV1.auth.me));
  } catch (error) {
    if (fromLogin) return fromLogin;
    throw error;
  }
}

function applyFailure(
  message: string,
  onAccountNotice: (notice: AccountNotice | null) => void,
  onCredentialError: (message: string | null) => void,
) {
  const normalized = message.toLowerCase();
  if (normalized.includes('inactive')) {
    onCredentialError(null);
    onAccountNotice('inactive');
    return;
  }
  if (normalized.includes('branch')) {
    onCredentialError(null);
    onAccountNotice('no_branch_access');
    return;
  }
  onAccountNotice(null);
  onCredentialError(message || INVALID_MESSAGE);
}
