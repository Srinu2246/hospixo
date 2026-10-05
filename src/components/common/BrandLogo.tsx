import Link from 'next/link';
import { Box, Typography } from '@mui/material';

import { colors } from '@/lib/theme/mui/colors';

type BrandLogoProps = Readonly<{
  tone?: 'default' | 'light';
  href?: string;
}>;

export function BrandLogo({ tone = 'default', href = '/' }: BrandLogoProps) {
  const isLight = tone === 'light';

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        width: 'fit-content',
        '&:focus-visible': {
          outline: `2px solid ${isLight ? colors.auth.hero.foreground : colors.auth.accent}`,
          outlineOffset: 2,
          borderRadius: 0.5,
        },
      }}
      aria-label="Hospixo"
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          background: `linear-gradient(135deg, ${colors.auth.accent}, ${colors.primary.dark})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.auth.accentForeground,
          fontWeight: 700,
          fontSize: '1.125rem',
        }}
      >
        H
      </Box>
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em',
          color: isLight ? colors.auth.hero.foreground : colors.text.primary,
        }}
      >
        Hospixo
      </Typography>
    </Box>
  );
}
