'use client';

import { Box, Link as MuiLink, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { adminAuthPromoContent } from '@/constants/auth/promo';
import { siteConfig } from '@/constants/site';
import { adminChrome } from '@theme/adminChrome';

const { auth, surface } = adminChrome;

const promoBackground = [
  `radial-gradient(circle at 18% 18%, ${auth.heroGlow1}, transparent 38%)`,
  `radial-gradient(circle at 82% 0%, ${auth.heroGlow2}, transparent 32%)`,
  `linear-gradient(165deg, ${auth.heroGradient1} 0%, ${auth.heroGradient2} 52%, ${auth.heroGradient3} 100%)`,
].join(', ');

type AdminLoginSplitLayoutProps = Readonly<{
  title: string;
  description: string;
  children: ReactNode;
}>;

export default function AdminLoginSplitLayout({
  title,
  description,
  children,
}: AdminLoginSplitLayoutProps) {
  const promo = adminAuthPromoContent;
  const { width, height } = siteConfig.brand.logoDimensions;

  return (
    <Box
      sx={(theme) => ({
        display: 'grid',
        minHeight: '100vh',
        gridTemplateColumns: '1fr',
        [theme.breakpoints.up(960)]: {
          gridTemplateColumns: '2fr 3fr',
        },
      })}
    >
      <Box
        component="aside"
        aria-hidden
        sx={(theme) => ({
          display: 'none',
          position: 'relative',
          overflow: 'hidden',
          background: promoBackground,
          color: auth.heroForeground,
          [theme.breakpoints.up(960)]: {
            display: 'block',
          },
        })}
      >
        <Stack
          sx={{
            minHeight: '100%',
            p: 'clamp(1.75rem, 4vw, 2.5rem)',
          }}
        >
          <MuiLink
            component={Link}
            href="/login"
            aria-label="Hospixo home"
            underline="none"
            sx={{
              display: 'inline-flex',
              width: 'fit-content',
              borderRadius: 0.5,
              '&:focus-visible': {
                outline: `2px solid ${auth.heroForeground}`,
                outlineOffset: 2,
              },
              '& img': {
                width: 'auto',
                height: '1.5rem',
              },
            }}
          >
            <Image
              src={siteConfig.brand.logoLight}
              alt="Hospixo"
              width={width}
              height={height}
              priority
            />
          </MuiLink>

          <Stack
            sx={{
              flex: 1,
              justifyContent: 'center',
              gap: 2.5,
              py: 4,
            }}
          >
            <Typography
              component="p"
              sx={{
                m: 0,
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: auth.accent,
              }}
            >
              {promo.label}
            </Typography>
            <Typography
              component="h1"
              sx={{
                m: 0,
                fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
              }}
            >
              {promo.heading}
            </Typography>
            <Typography
              component="p"
              sx={{
                m: 0,
                maxWidth: '32rem',
                fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                lineHeight: 1.65,
                color: auth.heroForegroundMuted,
              }}
            >
              {promo.description}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            sx={{
              gap: 'clamp(2rem, 5vw, 4rem)',
              mt: 'auto',
              pt: 4,
            }}
          >
            {promo.stats.map((stat) => (
              <Stack key={stat.id} spacing={0.5}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: auth.heroForegroundFaint,
                  }}
                >
                  {stat.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box
        component="section"
        aria-labelledby="admin-login-heading"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 'clamp(1.5rem, 4vw, 3rem)',
          bgcolor: surface.card,
          color: surface.foreground,
        }}
      >
        <Box sx={{ width: 'min(100%, 25rem)' }}>
          <Box sx={{ mb: 3.5 }}>
            <Typography
              id="admin-login-heading"
              component="h2"
              sx={{
                m: 0,
                fontSize: 'clamp(1.75rem, 3vw, 2.125rem)',
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: surface.foreground,
              }}
            >
              {title}
            </Typography>
            <Typography
              component="p"
              sx={{
                mt: 1.5,
                mb: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.65,
                color: surface.mutedForeground,
              }}
            >
              {description}
            </Typography>
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
