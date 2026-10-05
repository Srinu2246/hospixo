import CheckIcon from '@mui/icons-material/Check';
import { Box, Stack, Typography } from '@mui/material';

import { BrandLogo } from '@/components/common/BrandLogo';
import { authPromoContent } from '@/features/auth/config/promo';
import { colors } from '@/lib/theme/mui/colors';

type AuthSplitLayoutProps = Readonly<{
  children: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
  cardSx?: Record<string, unknown>;
}>;

const heroBackground = `
  radial-gradient(circle at 20% 20%, ${colors.auth.hero.glow1}, transparent 35%),
  radial-gradient(circle at 80% 0%, ${colors.auth.hero.glow2}, transparent 30%),
  linear-gradient(
    160deg,
    ${colors.auth.hero.gradient1} 0%,
    ${colors.auth.hero.gradient2} 48%,
    ${colors.auth.hero.gradient3} 100%
  )
`;

export function AuthSplitLayout({
  children,
  title,
  description,
  footer,
  cardSx,
}: AuthSplitLayoutProps) {
  const promo = authPromoContent;

  return (
    <Box
      sx={{
        display: 'grid',
        minHeight: '100vh',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
        },
      }}
    >
      <Box
        component="aside"
        aria-hidden
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'relative',
          overflow: 'hidden',
          background: heroBackground,
          color: colors.auth.hero.foreground,
        }}
      >
        <Stack
          sx={{
            minHeight: '100%',
            justifyContent: 'center',
            gap: { sm: 2, md: 4 },
            p: { sm: 2, md: 'clamp(2rem, 5vw, 4rem)' },
          }}
        >
          <BrandLogo tone="light" />

          <Stack spacing={2} sx={{ maxWidth: '34rem' }}>
            <Typography
              component="h1"
              sx={{
                m: 0,
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
              }}
            >
              {promo.heading}
            </Typography>
            <Typography
              sx={{
                m: 0,
                maxWidth: '32rem',
                fontSize: 'clamp(0.9375rem, 1.6vw, 1.0625rem)',
                lineHeight: 1.65,
                color: colors.auth.hero.foregroundMuted,
              }}
            >
              {promo.description}
            </Typography>
          </Stack>

          <Stack component="ul" spacing={2.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {promo.features.map((feature) => (
              <Stack
                component="li"
                key={feature.id}
                direction="row"
                spacing={1.1}
                sx={{ alignItems: 'flex-start' }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.auth.accent,
                    backgroundColor: colors.auth.hero.foreground,
                    border: `1px solid ${colors.auth.accent}`,
                  }}
                >
                  <CheckIcon sx={{ fontSize: '0.875rem' }} />
                </Box>
                <Box>
                  <Typography
                    sx={{ m: 0, fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      m: 0,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: colors.auth.hero.foregroundSubtle,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          <Typography
            sx={{
              m: 0,
              maxWidth: '30rem',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              color: colors.auth.hero.foregroundFaint,
            }}
          >
            {promo.footnote}
          </Typography>
        </Stack>
      </Box>

      <Box
        component="section"
        aria-labelledby="auth-form-heading"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: '100vh', sm: 'auto' },
          p: 'clamp(1.5rem, 4vw, 3rem)',
          backgroundColor: {
            xs: colors.background.default,
            sm: colors.auth.formPanel,
          },
        }}
      >
        <Box
          sx={{
            width: 'min(100%, 28rem)',
            border: { xs: 'none', md: `1px solid ${colors.border.default}` },
            borderRadius: 1,
            backgroundColor: colors.surface.default,
            boxShadow: {
              xs: 'none',
              md: '0 12px 40px rgb(15 23 42 / 0.06)',
            },
            p: { xs: 2, md: 'clamp(1.5rem, 4vw, 2rem)' },
            ...cardSx,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              id="auth-form-heading"
              component="h2"
              sx={{
                m: 0,
                fontSize: { xs: '1.5rem', md: 'clamp(1.625rem, 3vw, 2rem)' },
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: colors.text.primary,
              }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '0.85rem', md: '0.9375rem' },
                  lineHeight: 1.65,
                  color: colors.text.secondary,
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>

          {children}

          {footer ? (
            <Typography
              component="div"
              sx={{
                mt: 2.5,
                textAlign: 'center',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: colors.text.secondary,
                '& a': {
                  color: colors.auth.accent,
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                },
              }}
            >
              {footer}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
