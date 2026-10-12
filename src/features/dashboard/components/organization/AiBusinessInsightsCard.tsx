'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import { ORG_AI_INSIGHTS } from '@/lib/mocks/dashboard/dashboard.mocks';

export function AiBusinessInsightsCard() {
  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '12px',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.03)' : '#F8FAFF'),
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon sx={{ fontSize: 18, color: colors.primary.default }} />
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: colors.primary.default }}>
          AI Business Insights
        </Typography>
      </Box>

      {/* Insights Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {ORG_AI_INSIGHTS.map((insight) => (
          <Box
            key={insight.id}
            sx={{
              p: 1.75,
              borderRadius: '10px',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: 'text.primary',
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {insight.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                Confidence:{' '}
                <Box component="span" sx={{ color: '#16A34A', fontWeight: 700 }}>
                  {insight.confidence}%
                </Box>
              </Typography>

              <ActionButton
                variant="text"
                size="small"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  p: 0,
                  minWidth: 'auto',
                  color: colors.primary.default,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Apply Detail
              </ActionButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
