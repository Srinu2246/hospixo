'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import { ORG_NEEDS_ATTENTION } from '@/lib/mocks/dashboard/dashboard.mocks';

export function NeedsAttentionCard() {
  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '12px',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        height: '100%',
      }}
    >
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
        Needs Attention
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {ORG_NEEDS_ATTENTION.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              py: 0.75,
              borderBottom: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: item.type === 'budget' || item.type === 'sync' ? '#EF4444' : '#F59E0B',
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>
                  {item.message}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                  {item.timestamp}
                </Typography>
              </Box>
            </Box>

            <ActionButton
              variant="outlined"
              size="small"
              sx={{
                fontSize: '0.6875rem',
                borderRadius: '6px',
                px: 1.25,
                py: 0.25,
                minWidth: 'auto',
                borderColor: colors.border.default,
                color: 'text.primary',
              }}
            >
              View
            </ActionButton>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
