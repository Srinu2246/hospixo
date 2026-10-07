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
import { ArrowRight, Building2, RefreshCw, Store, Users } from 'lucide-react';

import {
  EntityListMetricsRow,
  EntityListToolbar,
  type StatusFilterTab,
} from '@/components/common/entity-list';
import { useCompaniesList } from '../hooks/use-companies-list';
import type { CompanyListItem } from '../types';

type StatusFilter = StatusFilterTab;

export function CompaniesListPage() {
  const { data: companies = [], isLoading, isError, error, refetch } = useCompaniesList();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const metrics = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return companies.filter((company) => {
      if (statusFilter !== 'all' && company.status !== statusFilter) {
        return false;
      }
      if (query) {
        const matchesName = company.name.toLowerCase().includes(query);
        const matchesCode = company.code?.toLowerCase().includes(query);
        const matchesType = company.businessType?.toLowerCase().includes(query);
        return matchesName || matchesCode || matchesType;
      }
      return true;
    });
  }, [companies, searchQuery, statusFilter]);

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
          Organisation · Companies
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
              All Companies
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              Overview of all registered companies and their branches in your organization
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
        totalLabel="Total Companies"
        activeLabel="Active Companies"
        inactiveLabel="Inactive Companies"
        totalIcon={Building2}
        isLoading={isLoading}
      />

      {/* Search & Filter Toolbar */}
      <EntityListToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search companies by name or code..."
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
          {error instanceof Error ? error.message : 'Unable to load companies list.'}
        </Alert>
      ) : null}

      {/* Companies Table */}
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
                  Business Type
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
                  Branches
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
                  Users
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
                      <Skeleton width={100} height={24} />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={60} height={24} />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={50} height={24} />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={70} height={24} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, px: 1.5 }}>
                      <Skeleton width={110} height={32} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Building2 size={36} style={{ opacity: 0.3 }} />
                      <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        No companies found
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                      >
                        {searchQuery
                          ? 'Try adjusting your search criteria.'
                          : 'No companies are currently registered.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <CompanyRow key={company.id} company={company} />
                ))
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

function CompanyRow({ company }: Readonly<{ company: CompanyListItem }>) {
  const router = useRouter();
  const companyDashboardHref = `/company?company_id=${encodeURIComponent(String(company.id))}`;

  return (
    <TableRow
      hover
      onClick={() => router.push(companyDashboardHref)}
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
            <Building2 size={16} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component={Link}
              href={companyDashboardHref}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
                textDecoration: 'none',
                display: 'block',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
              }}
            >
              {company.name}
            </Typography>
            {company.code ? (
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Code: {company.code}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {company.businessType ?? 'Hospitality'}
        </Typography>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Chip
          component={Link}
          href={companyDashboardHref}
          onClick={(e) => {
            e.stopPropagation();
          }}
          clickable
          icon={<Store size={13} />}
          label={`${company.branchCount} branches`}
          size="small"
          sx={{
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: 'action.hover',
            borderColor: 'divider',
            borderWidth: 1,
            borderStyle: 'solid',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
        />
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
          <Users size={14} />
          <span>{company.userCount}</span>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Chip
          label={company.status}
          size="small"
          sx={{
            borderRadius: '9999px',
            textTransform: 'capitalize',
            fontWeight: 600,
            fontSize: '0.75rem',
            ...(company.status === 'active'
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
          href={companyDashboardHref}
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
