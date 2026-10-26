'use client';

import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { StatusChip } from '@/components/shared/ui/StatusChip';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { colors } from '@/lib/theme/mui/colors';
import type { UserRoleItem, ScopeType } from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface UserRoleDataGridProps {
  users: UserRoleItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalRows: number;
  scope?: ScopeType;
  companyName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange: (newPage: number) => void;
  onOpenActionMenu: (e: React.MouseEvent<HTMLButtonElement>, user: UserRoleItem) => void;
}

export function UserRoleDataGrid({
  users,
  isLoading,
  page,
  pageSize,
  totalRows,
  scope,
  companyName,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onOpenActionMenu,
}: Readonly<UserRoleDataGridProps>) {
  const columns: DataGridColumn<UserRoleItem>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'NAME',
        minWidth: 220,
        render: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={row.avatar}
              alt={row.name}
              sx={{
                width: 32,
                height: 32,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(51, 84, 244, 0.25)'
                    : 'rgba(51, 84, 244, 0.12)',
                color: colors.primary.default,
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              {row.name.charAt(0)}
            </Avatar>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              {row.name}
            </Typography>
          </Box>
        ),
      },
      ...(scope === 'organization'
        ? [
            {
              field: 'company' as const,
              headerName: 'COMPANY',
              minWidth: 160,
              render: (row: UserRoleItem) => (
                <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}>
                  {row.company || companyName || '—'}
                </Typography>
              ),
            },
          ]
        : []),
      {
        field: 'email',
        headerName: 'EMAIL',
        minWidth: 230,
        render: (row) => (
          <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
            {row.email}
          </Typography>
        ),
      },
      {
        field: 'role',
        headerName: 'ROLE',
        minWidth: 150,
        render: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <StatusChip label={row.role} variantType="role" pill sx={{ ml: '3px' }} />
          </Box>
        ),
      },
      {
        field: 'branch',
        headerName: 'BRANCH',
        minWidth: 160,
        render: (row) => (
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            {row.branch}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'STATUS',
        minWidth: 130,
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        field: 'actions',
        headerName: '',
        align: 'right',
        width: 50,
        minWidth: 50,
        sortable: false,
        render: (row) => (
          <IconButton
            size="small"
            aria-label={`Actions for ${row.name}`}
            onClick={(e) => onOpenActionMenu(e, row)}
            sx={{
              color: colors.text.secondary,
              '&:hover': {
                color: 'text.primary',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [onOpenActionMenu, scope, companyName],
  );

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        maxHeight: { xs: 400, md: 'calc(100vh - 350px)' },
        overflowY: 'auto',
        pr: 0.5,
        '&::-webkit-scrollbar': {
          width: 6,
          height: 6,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
          borderRadius: 3,
        },
      }}
    >
      <DataGrid
        columns={columns}
        rows={users}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        stickyHeader
        pagination
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        sortBy={sortBy}
        sortDirection={sortOrder}
        onSortChange={onSortChange}
        onPageChange={onPageChange}
        paginationEntityName="users"
        emptyTitle="No users found"
        emptySubtitle="No team members match your active search or filters."
        sx={{
          border: 'none',
          boxShadow: 'none',
          bgcolor: 'transparent',
          '& .MuiTableHead-root .MuiTableRow-root': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          },
          '& .MuiTableCell-head': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: colors.text.secondary,
            py: 1.25,
            px: 2,
          },
          '& .MuiTableCell-body': {
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            py: 1.5,
            px: 2,
          },
          '& .MuiTableRow-root:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : colors.surface.muted,
          },
        }}
      />
    </Box>
  );
}
