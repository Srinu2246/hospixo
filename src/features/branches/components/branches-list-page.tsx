'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ArrowRight, MapPin, RefreshCw, Store } from 'lucide-react';

import {
  EntityListMetricsRow,
  EntityListToolbar,
  type StatusFilterTab,
} from '@/components/common/entity-list';
import { useBranchesList } from '../hooks/use-branches-list';
import type { BranchListItem } from '../types';

type StatusFilter = StatusFilterTab;

type BranchesListPageProps = Readonly<{
  companyId?: string;
  scope?: 'organisation' | 'company';
}>;

export function BranchesListPage({
  companyId,
  scope = 'organisation',
}: BranchesListPageProps = {}) {
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBranchesList(companyId, scope);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const metrics = useMemo(() => {
    const total = branches.length;
    const active = branches.filter((b) => b.status === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [branches]);

  const filteredBranches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return branches.filter((branch) => {
      if (statusFilter !== 'all' && branch.status !== statusFilter) {
        return false;
      }
      if (query) {
        const matchesName = branch.name.toLowerCase().includes(query);
        const matchesCode = branch.code?.toLowerCase().includes(query);
        const matchesCity = branch.city?.toLowerCase().includes(query);
        const matchesCompany = branch.companyName?.toLowerCase().includes(query);
        return matchesName || matchesCode || matchesCity || matchesCompany;
      }
      return true;
    });
  }, [branches, searchQuery, statusFilter]);

  const breadcrumbPrefix = scope === 'company' ? 'Company · Branches' : 'Organisation · Branches';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto',
        width: '100%',
        maxWidth: '100%',
        minHeight: '100%',
        gap: 1.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc'),
        px: { xs: 1.5, sm: 2, md: 2.5 },
        pt: { xs: 1.25, sm: 1.5 },
        pb: { xs: 8, md: 10 },
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {breadcrumbPrefix}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              All Branches
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              Overview of all branch locations and their operational statuses
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => void refetch()}
            startIcon={<RefreshCw size={15} />}
            sx={{
              borderRadius: '0.5rem',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* KPI Metric Cards */}
      <EntityListMetricsRow
        metrics={metrics}
        totalLabel="Total Branches"
        activeLabel="Active Branches"
        inactiveLabel="Inactive Branches"
        totalIcon={Store}
        isLoading={isLoading}
      />

      {/* Search & Filter Toolbar */}
      <EntityListToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search branches by name, code, or city..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={{
          all: metrics.total,
          active: metrics.active,
          inactive: metrics.inactive,
        }}
      />

      {/* Error state */}
      {isError ? (
        <Alert
          severity="error"
          sx={{ borderRadius: '0.75rem', flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Unable to load branches list.'}
        </Alert>
      ) : null}

      {/* Branches Table */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: '0.75rem',
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          flexShrink: 0,
        }}
      >
        <TableContainer
          sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'visible' }}
        >
          <Table sx={{ width: '100%', minWidth: { xs: 560, md: '100%' } }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Branch
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Company
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Location / City
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={180} height={24} />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={120} height={24} />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={100} height={24} />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={70} height={24} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={110} height={32} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Store size={36} style={{ opacity: 0.3 }} />
                      <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        No branches found
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        {searchQuery
                          ? 'Try adjusting your search criteria.'
                          : 'No branches are currently registered.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBranches.map((branch) => <BranchRow key={branch.id} branch={branch} />)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Bottom spacer for viewport clearance */}
      <Box sx={{ height: { xs: 32, md: 48 }, flexShrink: 0 }} aria-hidden />
    </Box>
  );
}

function BranchRow({ branch }: Readonly<{ branch: BranchListItem }>) {
  const router = useRouter();
  const branchParams = new URLSearchParams({ outlet: String(branch.id) });
  if (branch.companyId) {
    branchParams.set('company_id', String(branch.companyId));
  }
  const branchDashboardHref = `/branch?${branchParams.toString()}`;

  return (
    <TableRow
      hover
      onClick={() => router.push(branchDashboardHref)}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <TableCell sx={{ py: 1, px: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'rgba(2, 132, 199, 0.08)',
              color: 'info.main',
              flexShrink: 0,
            }}
          >
            <Store size={16} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                component={Link}
                href={branchDashboardHref}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  textDecoration: 'none',
                  display: 'block',
                  '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                }}
              >
                {branch.name}
              </Typography>
              {branch.isDefault ? (
                <Chip
                  label="Default"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    bgcolor: 'action.selected',
                  }}
                />
              ) : null}
            </Box>
            {branch.code ? (
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Code: {branch.code}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {branch.companyName ?? (branch.companyId ? `Company #${branch.companyId}` : '—')}
        </Typography>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          <MapPin size={14} />
          <span>{branch.city ?? 'Not specified'}</span>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Chip
          label={branch.status}
          size="small"
          sx={{
            borderRadius: '9999px',
            textTransform: 'capitalize',
            fontWeight: 600,
            fontSize: '0.75rem',
            ...(branch.status === 'active'
              ? {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(22, 163, 74, 0.1)',
                  color: 'success.main',
                }
              : {
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                }),
          }}
        />
      </TableCell>

      <TableCell align="center" sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Button
          component={Link}
          href={branchDashboardHref}
          size="small"
          variant="outlined"
          endIcon={<ArrowRight size={14} />}
          sx={{
            borderRadius: '0.5rem',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
              color: 'primary.main',
            },
          }}
        >
          Dashboard
        </Button>
      </TableCell>
    </TableRow>
  );
}
