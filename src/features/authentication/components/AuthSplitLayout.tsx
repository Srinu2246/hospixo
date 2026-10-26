'use client';

import Image from 'next/image';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import logoLight from '@/assets/app/logo-light.svg';
import { screen } from '@/lib/theme/mui/breakpoints';
import { colors } from '@/lib/theme/mui/colors';

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

export interface AuthSplitLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthSplitLayout({ children, footer }: Readonly<AuthSplitLayoutProps>) {
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
          {children}
          {footer ? (
            <Typography
              sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem', mt: 3 }}
            >
              {footer}
            </Typography>
          ) : null}
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
