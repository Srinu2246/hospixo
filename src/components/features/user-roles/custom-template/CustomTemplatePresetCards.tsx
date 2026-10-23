'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { colors } from '@/lib/theme/mui/colors';
import type { CustomTemplateFormValues } from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface PresetOption {
  id: CustomTemplateFormValues['preset'];
  title: string;
  description: string;
}

export const PRESET_OPTIONS: readonly PresetOption[] = [
  {
    id: 'full_read',
    title: 'Full Read Access',
    description: 'View all standard modules and reports.',
  },
  {
    id: 'standard_manager',
    title: 'Standard Manager',
    description: 'Balanced permissions for store tasks.',
  },
  {
    id: 'view_only',
    title: 'View Only',
    description: 'Restricted purely to operations.',
  },
  {
    id: 'custom',
    title: 'Custom Setup',
    description: 'Manually set permissions in the next step.',
  },
];

export interface CustomTemplatePresetCardsProps {
  selectedPreset: CustomTemplateFormValues['preset'];
  onSelectPreset: (presetId: CustomTemplateFormValues['preset']) => void;
}

export function CustomTemplatePresetCards({
  selectedPreset,
  onSelectPreset,
}: Readonly<CustomTemplatePresetCardsProps>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 2,
        mt: 0.5,
      }}
    >
      {PRESET_OPTIONS.map((opt) => {
        const isSelected = selectedPreset === opt.id;
        return (
          <Box
            key={opt.id}
            onClick={() => onSelectPreset(opt.id)}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: isSelected
                ? colors.primary.default
                : (theme) =>
                    theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: isSelected
                ? (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(25, 118, 210, 0.12)'
                      : 'rgba(25, 118, 210, 0.04)'
                : (theme) =>
                    theme.palette.mode === 'dark'
                      ? colors.surface.darkMuted
                      : colors.surface.default,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.5,
              '&:hover': {
                borderColor: isSelected ? colors.primary.default : colors.primary.light,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {opt.title}
              </Typography>
              {isSelected ? (
                <CheckCircleIcon sx={{ fontSize: 20, color: colors.primary.default }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: colors.text.secondary }} />
              )}
            </Box>

            <Typography
              sx={{
                fontSize: '0.75rem',
                color: colors.text.secondary,
                lineHeight: 1.4,
              }}
            >
              {opt.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
