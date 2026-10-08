'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BarChart3, List } from 'lucide-react';

import { OutletSalesHoverCard } from '@/features/dashboard/components/company/shared';
import { companyLandingContent } from '@/features/dashboard/config/company';
import { formatCurrency } from '@/features/dashboard/lib/format';
import type { OutletSalesRow } from '@/features/dashboard/types';

type SalesByOutletSectionProps = Readonly<{
  rows: readonly OutletSalesRow[];
  activeKpiKey?: string | null;
}>;

type SalesTab = 'total-sales' | 'top-branches';
type SalesView = 'bar' | 'table';

export function SalesByOutletSection({ rows, activeKpiKey = null }: SalesByOutletSectionProps) {
  const [tab, setTab] = useState<SalesTab>('total-sales');
  const [view, setView] = useState<SalesView>('bar');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [prevActiveKpiKey, setPrevActiveKpiKey] = useState<string | null>(activeKpiKey);

  if (activeKpiKey !== prevActiveKpiKey) {
    setPrevActiveKpiKey(activeKpiKey);
    if (activeKpiKey) {
      setView('table');
      setTab(activeKpiKey === 'branch' ? 'top-branches' : 'total-sales');
      setActiveIndex(null);
    }
  }

  const { sectionTitle, tabs, chartLimit, tableColumns } = companyLandingContent.salesByOutlet;

  const chartRows = useMemo(() => {
    const sortedBySales = [...rows].sort((a, b) => b.sales - a.sales);

    if (tab === 'top-branches') {
      return sortedBySales.slice(0, chartLimit);
    }

    return rows;
  }, [rows, tab, chartLimit]);

  const maxSales = Math.max(...chartRows.map((row) => row.sales), 1);

  function handleTabChange(nextTab: SalesTab) {
    setTab(nextTab);
    setView(nextTab === 'top-branches' ? 'table' : 'bar');
    setActiveIndex(null);
  }

  return (
    <Card
      variant="outlined"
      id="sales-by-outlet"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        overflow: 'visible',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        {sectionTitle}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            gap: 0.5,
            p: 0.5,
            borderRadius: '0.5rem',
            bgcolor: 'action.hover',
          }}
        >
          <Button
            size="small"
            onClick={() => handleTabChange('total-sales')}
            sx={{
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              px: 1.75,
              py: 0.5,
              minWidth: 'auto',
              bgcolor: tab === 'total-sales' ? 'background.paper' : 'transparent',
              color: tab === 'total-sales' ? 'text.primary' : 'text.secondary',
              boxShadow: tab === 'total-sales' ? '0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              '&:hover': {
                bgcolor: tab === 'total-sales' ? 'background.paper' : 'action.selected',
              },
            }}
          >
            {tabs.chart}
          </Button>
          <Button
            size="small"
            onClick={() => handleTabChange('top-branches')}
            sx={{
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              px: 1.75,
              py: 0.5,
              minWidth: 'auto',
              bgcolor: tab === 'top-branches' ? 'background.paper' : 'transparent',
              color: tab === 'top-branches' ? 'text.primary' : 'text.secondary',
              boxShadow: tab === 'top-branches' ? '0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
              '&:hover': {
                bgcolor: tab === 'top-branches' ? 'background.paper' : 'action.selected',
              },
            }}
          >
            {tabs.table}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            border: 1,
            borderColor: 'divider',
            borderRadius: '0.5rem',
            overflow: 'hidden',
          }}
        >
          <IconButton
            size="small"
            onClick={() => setView('bar')}
            aria-label="Bar chart view"
            aria-pressed={view === 'bar'}
            sx={{
              borderRadius: 0,
              width: 32,
              height: 32,
              bgcolor:
                view === 'bar'
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(56, 189, 248, 0.16)'
                        : 'rgba(14, 165, 233, 0.12)'
                  : 'transparent',
              color: view === 'bar' ? 'info.main' : 'text.secondary',
              '&:hover': {
                bgcolor:
                  view === 'bar'
                    ? (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(56, 189, 248, 0.24)'
                          : 'rgba(14, 165, 233, 0.18)'
                    : 'action.hover',
              },
            }}
          >
            <BarChart3 size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setView('table')}
            aria-label="Table view"
            aria-pressed={view === 'table'}
            sx={{
              borderRadius: 0,
              width: 32,
              height: 32,
              bgcolor:
                view === 'table'
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(56, 189, 248, 0.16)'
                        : 'rgba(14, 165, 233, 0.12)'
                  : 'transparent',
              color: view === 'table' ? 'info.main' : 'text.secondary',
              '&:hover': {
                bgcolor:
                  view === 'table'
                    ? (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(56, 189, 248, 0.24)'
                          : 'rgba(14, 165, 233, 0.18)'
                    : 'action.hover',
              },
            }}
          >
            <List size={16} />
          </IconButton>
        </Box>
      </Box>

      {view === 'bar' ? (
        chartRows.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No branch sales data available.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${chartRows.length}, minmax(0, 1fr))`,
              alignItems: 'flex-end',
              gap: { xs: 1, sm: 2 },
              minHeight: 240,
              height: 260,
              pt: 6,
              pb: 1,
              overflow: 'visible',
            }}
          >
            {chartRows.map((row, index) => {
              const heightPixels = Math.max((row.sales / maxSales) * 180, 8);
              const isActive = activeIndex === index;
              const placement =
                chartRows.length <= 1 || index === 0
                  ? 'start'
                  : index === chartRows.length - 1
                    ? 'end'
                    : index === 1
                      ? 'start'
                      : index === chartRows.length - 2
                        ? 'end'
                        : 'center';

              return (
                <Box
                  key={row.outletId}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    aria-label={`${row.outletName} branch sales details`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      position: 'relative',
                      bgcolor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      p: 0,
                      overflow: 'visible',
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: '60%', sm: '48%' },
                        height: `${heightPixels}px`,
                        bgcolor: isActive
                          ? 'info.main'
                          : (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(56, 189, 248, 0.2)'
                                : 'rgba(14, 165, 233, 0.18)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease-in-out, background-color 0.15s',
                        '&:hover': {
                          bgcolor: 'info.main',
                        },
                      }}
                    />
                    {isActive ? <OutletSalesHoverCard row={row} placement={placement} /> : null}
                  </Box>
                  <Typography
                    variant="caption"
                    title={row.outletName}
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      mt: 1,
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      display: 'block',
                    }}
                  >
                    {row.outletName}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )
      ) : null}

      {view === 'table' ? (
        <TableContainer sx={{ borderRadius: '0.5rem', border: 1, borderColor: 'divider' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {chartRows.map((row) => (
                <TableRow key={row.outletId} hover>
                  <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {row.outletName}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{row.orders}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{formatCurrency(row.sales)}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>
                    {formatCurrency(row.netSales)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{formatCurrency(row.tax)}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>
                    {formatCurrency(row.discount)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{row.modified}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{row.reprinted}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>
                    {formatCurrency(row.waivedCharges)}
                  </TableCell>
                </TableRow>
              ))}
              {chartRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}
                  >
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Card>
  );
}
