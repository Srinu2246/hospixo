'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AlertTriangle, Check, Eye, EyeOff, Info } from 'lucide-react';

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
    title: 'Smart Procurement',
    body: 'Auto-track stock, vendors & approvals.',
  },
  {
    title: 'Role-based access',
    body: 'Right permissions, right people.',
  },
  {
    title: 'Enterprise security',
    body: 'Audit logs, MFA, cloud-ready',
  },
] as const;

const INVALID_MESSAGE = 'Invalid email, mobile number, or password. Please try again.';
const INACTIVE_MESSAGE =
  'Your account is inactive. Please contact your organization administrator.';
const BRANCH_MESSAGE = 'You do not have access to this branch. Please contact your admin.';

export function LoginPage() {
  const [notice, setNotice] = useState<AccountNotice | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: colors.white.default,
      }}
    >
      <BrandPanel />
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        {notice ? <AccountBanner status={notice} /> : null}

        <Box sx={{ width: '100%', maxWidth: 420 }}>
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
        width: { xs: '100%', md: '42%' },
        minHeight: { xs: 'auto', md: '100vh' },
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 7 },
        color: colors.login.headline,
        background: `linear-gradient(160deg, ${colors.login.panel} 0%, ${colors.login.panelGlow} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: { xs: 3, md: 6 } }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: colors.white.default,
              color: colors.primary.default,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '1.05rem',
            }}
          >
            N
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
            Hospixo
          </Typography>
        </Stack>

        <Typography
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', md: '2.15rem' },
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            maxWidth: 360,
            mb: 2,
          }}
        >
          Run every hotel operation from one place.
        </Typography>
        <Typography sx={{ color: colors.login.body, fontSize: '0.95rem', lineHeight: 1.6, mb: 4 }}>
          Hospixo gives hospitality teams one system for inventory, finance, HR, and daily ops.
        </Typography>

        <Stack spacing={2.25} sx={{ display: { xs: 'none', sm: 'flex' } }}>
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
                  width: 22,
                  height: 22,
                  mt: 0.15,
                  borderRadius: '50%',
                  bgcolor: colors.login.check,
                  color: colors.white.default,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={13} strokeWidth={3} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ color: colors.login.muted, fontSize: '0.875rem', mt: 0.25 }}>
                  {feature.body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Typography
          sx={{
            display: { xs: 'none', md: 'block' },
            color: colors.login.muted,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            mt: 7,
            maxWidth: 340,
          }}
        >
          Trusted by growing hospitality teams to simplify operations and improve control.
        </Typography>
      </Box>
    </Box>
  );
}

function AccountBanner({ status }: Readonly<{ status: AccountNotice }>) {
  const inactive = status === 'inactive';

  return (
    <Box
      role="alert"
      sx={{
        position: 'absolute',
        top: { xs: 16, md: 28 },
        left: { xs: 20, md: 36 },
        right: { xs: 20, md: 36 },
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
      }}
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
          sx={{ fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.03em' }}
        >
          Welcome back to Hospixo
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.55 }}>
          Sign in to manage your operations, teams, inventory, and workflows.
        </Typography>
      </Box>

      <Controller
        name="identifier"
        control={control}
        render={({ field }) => (
          <Input
            id="login-identifier"
            label="Email / Username"
            placeholder="Enter your email or Username"
            autoFocus
            error={Boolean(errors.identifier) || Boolean(credentialError)}
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
        sx={{ height: 48 }}
      >
        Sign in
      </ActionButton>

      <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
        Don&apos;t have an account?{' '}
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
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
