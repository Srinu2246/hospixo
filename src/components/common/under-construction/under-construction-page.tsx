'use client';

import { Construction } from 'lucide-react';
import { Box, Paper, Stack, Typography } from '@mui/material';

type UnderConstructionPageProps = Readonly<{
  title: string;
  subtitle?: string;
}>;

export function UnderConstructionPage({ title, subtitle }: UnderConstructionPageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 5,
        background: 'var(--muted)',
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, color: 'var(--foreground)' }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--muted-foreground)' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid var(--border)',
            borderRadius: 2,
            bgcolor: 'var(--card)',
          }}
        >
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'var(--muted)',
                color: 'var(--muted-foreground)',
              }}
            >
              <Construction size={24} aria-hidden />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
              Coming soon
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>
              We&apos;re still building this experience. When it&apos;s ready, you&apos;ll open it
              from the same place in the menu.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
