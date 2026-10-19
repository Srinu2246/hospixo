'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export interface UserRoleTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  selectedRole: string;
  selectedBranch: string;
  selectedStatus: string;
  onOpenFilter: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClearRole: () => void;
  onClearBranch: () => void;
  onClearStatus: () => void;
  onResetFilters: () => void;
}

export function UserRoleTableToolbar({
  searchQuery,
  onSearchChange,
  hasActiveFilters,
  activeFiltersCount,
  selectedRole,
  selectedBranch,
  selectedStatus,
  onOpenFilter,
  onClearRole,
  onClearBranch,
  onClearStatus,
  onResetFilters,
}: Readonly<UserRoleTableToolbarProps>) {
  return (
    <>
      {/* Table Toolbar: Global SearchBar + Filters Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 260 } }}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search users..."
            fullWidth
          />
        </Box>

        <ActionButton
          variant={hasActiveFilters ? 'primary' : 'outlined'}
          onClick={onOpenFilter}
          startIcon={<TuneOutlinedIcon fontSize="small" />}
          sx={{
            borderColor: (theme) =>
              hasActiveFilters
                ? undefined
                : theme.palette.mode === 'dark'
                  ? theme.palette.divider
                  : colors.border.default,
            minWidth: 100,
          }}
        >
          Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
        </ActionButton>
      </Box>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          {selectedRole && (
            <Chip
              label={`Role: ${selectedRole}`}
              size="small"
              onDelete={onClearRole}
              sx={{ borderRadius: '6px' }}
            />
          )}
          {selectedBranch && (
            <Chip
              label={`Branch: ${selectedBranch}`}
              size="small"
              onDelete={onClearBranch}
              sx={{ borderRadius: '6px' }}
            />
          )}
          {selectedStatus && (
            <Chip
              label={`Status: ${selectedStatus}`}
              size="small"
              onDelete={onClearStatus}
              sx={{ borderRadius: '6px' }}
            />
          )}
          <ActionButton variant="text" size="small" onClick={onResetFilters}>
            Clear All
          </ActionButton>
        </Box>
      )}
    </>
  );
}
