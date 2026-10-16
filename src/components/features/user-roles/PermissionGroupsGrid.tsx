'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { SxProps, Theme } from '@mui/material/styles';

import { StatusChip } from '@/components/shared/ui/StatusChip';
import { colors } from '@/lib/theme/mui/colors';
import type { PermissionCategory } from '@/lib/schemas/employees/user-roles/userRolesSchema';

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
 * and dynamic enabled/disabled count badges.
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
    const isCategoryExpanded = Boolean(expanded[category.id]);
    const totalCount = category.permissions.length;
    const enabledCount = category.permissions.filter((p) => p.enabled).length;
    const disabledCount = totalCount - enabledCount;
    const isAllEnabled = enabledCount === totalCount && totalCount > 0;

    // Resolve badge label & variant
    let badgeLabel: string;
    let badgeVariant: 'success' | 'default';

    if (badgeMode === 'disabled') {
      badgeLabel = disabledCount > 0 ? `${disabledCount} disabled` : 'All enabled';
      badgeVariant = disabledCount > 0 ? 'default' : 'success';
    } else {
      badgeLabel = `${enabledCount} enabled`;
      badgeVariant = enabledCount > 0 ? 'success' : 'default';
    }

    return (
      <Box
        key={listKey}
        sx={{
          borderRadius: '10px',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.darkMuted : colors.surface.default,
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
            px: 2,
            py: 1.25,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flex: 1,
            }}
            onClick={() => toggleExpand(category.id)}
          >
            <IconButton size="small" sx={{ p: 0.25, color: colors.text.secondary }}>
              {isCategoryExpanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>

            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
              {category.title}
            </Typography>

            {/* Reusable Badge / StatusChip Component */}
            <StatusChip
              label={badgeLabel}
              variantType={badgeVariant}
              pill
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                fontWeight: 600,
                px: 0.75,
              }}
            />
          </Box>

          {/* Master Switch */}
          <Switch
            size="small"
            disabled={readOnly}
            checked={isAllEnabled}
            onChange={(e) => onToggleCategoryAll?.(category.id, e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: colors.primary.default,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                bgcolor: colors.primary.default,
              },
            }}
          />
        </Box>

        {/* Expandable Permissions List */}
        <Collapse in={isCategoryExpanded}>
          <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.5, gap: 1 }}>
            {category.permissions.map((perm) => (
              <Box
                key={perm.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.5,
                  px: 1,
                  borderRadius: '6px',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                  },
                }}
              >
                <Box sx={{ pr: 1.5 }}>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}
                  >
                    {perm.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                    {perm.description}
                  </Typography>
                </Box>

                <Switch
                  size="small"
                  disabled={readOnly}
                  checked={perm.enabled}
                  onChange={() => onTogglePermission?.(category.id, perm.id)}
                  sx={{
                    flexShrink: 0,
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.primary.default,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: colors.primary.default,
                    },
                  }}
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
        gap: 2,
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {leftCategories.map((category, index) =>
          renderCategoryCard(category, `left-${category.id}-${index}`),
        )}
      </Box>

      {/* Right Column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rightCategories.map((category, index) =>
          renderCategoryCard(category, `right-${category.id}-${index}`),
        )}
      </Box>
    </Box>
  );
}
