'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ApartmentIcon from '@mui/icons-material/Apartment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import type { DashboardLevel } from '../../types/dashboard.types';

export interface DashboardHeaderProps {
  currentLevel: DashboardLevel;
  onLevelChange: (level: DashboardLevel) => void;
  title: string;
  scopeEntityLabel?: string;
  scopeOptions?: string[];
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
  onExportClick?: () => void;
  hideLevelSwitcher?: boolean;
  topBanner?: React.ReactNode;
}

export function DashboardHeader({
  currentLevel,
  onLevelChange,
  title,
  scopeEntityLabel = 'Companies',
  scopeOptions = ['All Companies'],
  selectedScope = 'All Companies',
  onScopeChange,
  onExportClick,
  hideLevelSwitcher = false,
  topBanner,
}: Readonly<DashboardHeaderProps>) {
  const [scopeAnchor, setScopeAnchor] = useState<null | HTMLElement>(null);
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [selectedDateRange, setSelectedDateRange] = useState('Today');

  const DATE_OPTIONS = [
    'Today',
    'Yesterday',
    'Last 7 Days (28 Jun - 4 Jul 2025)',
    'This Month',
    'Last Month',
    'Custom Range...',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* Level Selector Pills & Scope Header */}
      {!hideLevelSwitcher && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            pb: 1,
          }}
        >
          {/* Interactive Level Switcher */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: '10px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            }}
          >
            <ButtonBase
              onClick={() => onLevelChange('organization')}
              sx={{
                px: 2,
                py: 0.85,
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: currentLevel === 'organization' ? 700 : 500,
                bgcolor:
                  currentLevel === 'organization'
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                color:
                  currentLevel === 'organization' ? colors.primary.default : colors.text.secondary,
                boxShadow: currentLevel === 'organization' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <ApartmentIcon sx={{ fontSize: 18 }} />
              Organization Level
            </ButtonBase>

            <ButtonBase
              onClick={() => onLevelChange('company')}
              sx={{
                px: 2,
                py: 0.85,
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: currentLevel === 'company' ? 700 : 500,
                bgcolor:
                  currentLevel === 'company'
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                color: currentLevel === 'company' ? colors.primary.default : colors.text.secondary,
                boxShadow: currentLevel === 'company' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 18 }} />
              Company Level
            </ButtonBase>

            <ButtonBase
              onClick={() => onLevelChange('branch')}
              sx={{
                px: 2,
                py: 0.85,
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: currentLevel === 'branch' ? 700 : 500,
                bgcolor:
                  currentLevel === 'branch'
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                color: currentLevel === 'branch' ? colors.primary.default : colors.text.secondary,
                boxShadow: currentLevel === 'branch' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <LocationOnIcon sx={{ fontSize: 18 }} />
              Branch / Outlet Level
            </ButtonBase>
          </Box>

          {/* Scope Context Dropdown (Companies / Outlets) */}
          {scopeOptions.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}
              >
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
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
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
          )}
        </Box>
      )}

      {/* Optional Top Alert Banner (e.g. Low Stock Alert in Branch Dashboard) */}
      {topBanner && <Box sx={{ width: '100%' }}>{topBanner}</Box>}

      {/* Main Title & Action Bar */}
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

        {/* Date Filter & Export Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <ButtonBase
            onClick={(e) => setDateAnchor(e.currentTarget)}
            sx={{
              px: 1.75,
              py: 0.85,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'border-color 0.15s ease',
              '&:hover': {
                borderColor: colors.primary.default,
              },
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
            {selectedDateRange}
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
          </ButtonBase>

          <Menu
            anchorEl={dateAnchor}
            open={Boolean(dateAnchor)}
            onClose={() => setDateAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '10px',
                  minWidth: 220,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              },
            }}
          >
            {DATE_OPTIONS.map((range) => (
              <MenuItem
                key={range}
                onClick={() => {
                  setSelectedDateRange(range.replace(/\s*\(.*\)/, ''));
                  setDateAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                {range}
              </MenuItem>
            ))}
          </Menu>

          {/* Export Data Button */}
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
