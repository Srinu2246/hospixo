'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { DateRangeOption } from '@/features/dashboard/enums';
import { colors } from '@/lib/theme/mui/colors';

import { DashboardDateRangeDropdown } from './DashboardDateRangeDropdown';

export interface DashboardHeaderProps {
  title: string;
  scopeEntityLabel?: string;
  scopeOptions?: string[];
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
  onExportClick?: () => void;
  topBanner?: React.ReactNode;
  dateFrom: Date;
  dateTo: Date;
  onDateRangeChange: (range: { dateFrom: Date; dateTo: Date }) => void;
  onDatePresetSelect: (preset: DateRangeOption) => void;
  activeDatePreset: DateRangeOption | null;
}

/**
 * Dashboard title row: optional scope picker, date range, export.
 * Level is fixed by role — no org/company/branch testing switcher.
 */
export function DashboardHeader({
  title,
  scopeEntityLabel = 'Companies',
  scopeOptions = ['All Companies'],
  selectedScope = 'All Companies',
  onScopeChange,
  onExportClick,
  topBanner,
  dateFrom,
  dateTo,
  onDateRangeChange,
  onDatePresetSelect,
  activeDatePreset,
}: Readonly<DashboardHeaderProps>) {
  const [scopeAnchor, setScopeAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {scopeOptions.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
            {scopeEntityLabel}:
          </Typography>
          <ButtonBase
            onClick={(e) => setScopeAnchor(e.currentTarget)}
            sx={{
              px: 1.5,
              py: 0.65,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {selectedScope}
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
          </ButtonBase>

          <Menu
            anchorEl={scopeAnchor}
            open={Boolean(scopeAnchor)}
            onClose={() => setScopeAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '10px',
                  minWidth: 180,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              },
            }}
          >
            {scopeOptions.map((opt) => (
              <MenuItem
                key={opt}
                selected={opt === selectedScope}
                onClick={() => {
                  onScopeChange?.(opt);
                  setScopeAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem', fontWeight: opt === selectedScope ? 700 : 500 }}
              >
                {opt}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ) : null}

      {topBanner ? <Box sx={{ width: '100%' }}>{topBanner}</Box> : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.375rem', sm: '1.625rem' },
            color: 'text.primary',
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <DashboardDateRangeDropdown
            dateFrom={dateFrom}
            dateTo={dateTo}
            activeDatePreset={activeDatePreset}
            onDateRangeChange={onDateRangeChange}
            onDatePresetSelect={onDatePresetSelect}
          />

          <ActionButton
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onExportClick}
            sx={{
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              px: 2,
              py: 0.85,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.1)' : '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid',
              borderColor: '#93C5FD',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.2)' : '#DBEAFE',
                borderColor: '#60A5FA',
              },
            }}
          >
            Export Data
          </ActionButton>
        </Box>
      </Box>
    </Box>
  );
}
