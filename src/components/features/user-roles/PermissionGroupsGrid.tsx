'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch, { type SwitchProps } from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled, type SxProps, type Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';
import type { PermissionCategory } from '@/lib/schemas/employees/user-roles/userRolesSchema';

/**
 * Custom iOS-style toggle switch matching the Hospixo Permissions design specification:
 * - Active: Vibrant royal blue pill (#3354F4) with white circular thumb
 * - Inactive: Light gray pill (#E2E8F0) with white circular thumb
 * - Smooth transition, 44x24 px dimensions, 20px thumb
 */
export const IosSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 44,
  height: 24,
  padding: 0,
  display: 'inline-flex',
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '200ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#FFFFFF',
      '& + .MuiSwitch-track': {
        backgroundColor: colors.primary.default || '#3354F4',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: colors.primary.default || '#3354F4',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 24 / 2,
    backgroundColor: theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 200,
    }),
  },
}));

export interface PermissionGroupsGridProps {
  categories: PermissionCategory[];
  onTogglePermission?: (categoryId: string, permissionId: string) => void;
  onToggleCategoryAll?: (categoryId: string, enableAll: boolean) => void;
  readOnly?: boolean;
  badgeMode?: 'enabled' | 'disabled';
  maxHeight?: number | string | Record<string, number | string>;
  sx?: SxProps<Theme>;
}

/**
 * Reusable two-column grid for permission category cards.
 * Features group master toggles, expandable permission items,
 * and dynamic enabled/disabled count badges matching Figma/UI screenshot.
 */
export function PermissionGroupsGrid({
  categories,
  onTogglePermission,
  onToggleCategoryAll,
  readOnly = false,
  badgeMode = 'enabled',
  maxHeight,
  sx,
}: Readonly<PermissionGroupsGridProps>) {
  // Category expanded state (default all expanded for high usability)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      initial[cat.id] = true;
    }
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Split into left and right columns
  const half = Math.ceil(categories.length / 2);
  const leftCategories = categories.slice(0, half);
  const rightCategories = categories.slice(half);

  const renderCategoryCard = (category: PermissionCategory, listKey: string) => {
    const isCategoryExpanded = expanded[category.id] ?? true;
    const totalCount = category.permissions.length;
    const enabledCount = category.permissions.filter((p) => p.enabled).length;
    const disabledCount = totalCount - enabledCount;
    const isAllEnabled = enabledCount === totalCount && totalCount > 0;

    let badgeLabel: string;
    let isSuccessBadge: boolean;

    if (badgeMode === 'disabled') {
      badgeLabel = disabledCount > 0 ? `${disabledCount} disabled` : 'All enabled';
      isSuccessBadge = disabledCount === 0;
    } else {
      badgeLabel = `${enabledCount} enabled`;
      isSuccessBadge = enabledCount > 0;
    }

    return (
      <Box
        key={listKey}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.darkMuted : '#FFFFFF',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease',
        }}
      >
        {/* Category Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 2.5 },
            py: 1.75,
            borderBottom: isCategoryExpanded ? '1px solid' : 'none',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              flex: 1,
              userSelect: 'none',
            }}
            onClick={() => toggleExpand(category.id)}
          >
            <IconButton
              size="small"
              sx={{
                p: 0.25,
                color: (theme) => (theme.palette.mode === 'dark' ? 'text.secondary' : '#334155'),
                transform: isCategoryExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {category.title}
            </Typography>

            {/* Pill Count Badge matching screenshot */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.25,
                borderRadius: '9999px',
                bgcolor: (theme) =>
                  isSuccessBadge
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : '#DCFCE7'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(148, 163, 184, 0.15)'
                      : '#F1F5F9',
                color: (theme) =>
                  isSuccessBadge
                    ? theme.palette.mode === 'dark'
                      ? '#4ADE80'
                      : '#15803D'
                    : theme.palette.mode === 'dark'
                      ? '#94A3B8'
                      : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              {badgeLabel}
            </Box>
          </Box>

          {/* Master Switch */}
          <IosSwitch
            disabled={readOnly}
            checked={isAllEnabled}
            onChange={(e) => onToggleCategoryAll?.(category.id, e.target.checked)}
          />
        </Box>

        {/* Expandable Permissions List */}
        <Collapse in={isCategoryExpanded}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {category.permissions.map((perm, pIndex) => (
              <Box
                key={perm.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: { xs: 2, sm: 2.5 },
                  py: 1.75,
                  borderTop: pIndex > 0 ? '1px solid' : 'none',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(248, 250, 252, 0.8)',
                  },
                }}
              >
                <Box sx={{ pr: 2 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'text.primary',
                      lineHeight: 1.35,
                    }}
                  >
                    {perm.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      color: colors.text.secondary,
                      mt: 0.25,
                      lineHeight: 1.35,
                    }}
                  >
                    {perm.description}
                  </Typography>
                </Box>

                <IosSwitch
                  disabled={readOnly}
                  checked={perm.enabled}
                  onChange={() => onTogglePermission?.(category.id, perm.id)}
                />
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2.5,
        ...(maxHeight ? { maxHeight, overflowY: 'auto', pr: 0.5 } : {}),
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
          borderRadius: 3,
        },
        ...((sx as object) || {}),
      }}
    >
      {/* Left Column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {leftCategories.map((category, index) =>
          renderCategoryCard(category, `left-${category.id}-${index}`),
        )}
      </Box>

      {/* Right Column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {rightCategories.map((category, index) =>
          renderCategoryCard(category, `right-${category.id}-${index}`),
        )}
      </Box>
    </Box>
  );
}
