'use client';

import { useState } from 'react';
import type { ElementType, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import {
  Box,
  ButtonBase,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface DataGridColumn<T = object> {
  field: string; // Row property key
  headerName?: string; // Column header title
  label?: string; // Alias for headerName
  width?: number | string; // Column width
  minWidth?: number | string; // Minimum column width
  maxWidth?: number | string; // Maximum column width
  align?: 'left' | 'center' | 'right'; // Cell alignment (default: left)
  headerAlign?: 'left' | 'center' | 'right'; // Header alignment
  sortable?: boolean; // Enable sorting (default: true)
  valueGetter?: (row: T) => unknown; // Custom value accessor
  renderCell?: (params: { row: T; value: unknown; index: number }) => ReactNode; // Custom cell renderer
  render?: (row: T, index: number) => ReactNode; // Shorthand cell renderer
}

export interface DataGridProps<T = object> {
  columns: readonly DataGridColumn<T>[]; // Column definitions
  rows?: readonly T[]; // Row records
  data?: readonly T[]; // Alias for rows
  getRowId?: (row: T, index: number) => string | number; // Row unique key getter
  height?: number | string; // Container height (default: 100%)
  width?: number | string; // Container width (default: 100%)
  minWidth?: number | string; // Table min-width (default: 100%)
  onRowClick?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void; // Row click handler
  loading?: boolean; // Loading state flag
  isLoading?: boolean; // Alias for loading
  loadingRowCount?: number; // Skeleton row count (default: 5)
  emptyTitle?: string; // Empty state title
  emptySubtitle?: string; // Empty state description
  emptyIcon?: ElementType; // Empty state icon component
  emptyAction?: ReactNode; // Empty state action button
  stickyHeader?: boolean; // Pin table header on vertical scroll (default: true)
  dense?: boolean; // Compact cell padding (default: false)
  rowHeight?: number | string; // Row height override (e.g. 70)
  pagination?: boolean; // Enable pagination (default: false)
  page?: number; // Current page number (1-indexed)
  pageSize?: number; // Rows per page (default: 10)
  totalRows?: number; // Total rows for server-side pagination
  onPageChange?: (page: number) => void; // Page change callback
  onPageSizeChange?: (pageSize: number) => void; // Page size change callback
  rowsPerPageOptions?: readonly number[]; // Page size dropdown options
  paginationEntityName?: string; // Entity label in summary (default: 'reservations')
  paginationHideDisabledNav?: boolean; // Hide Prev/Next when disabled (default: false)
  sortBy?: string; // Controlled sort field
  sortDirection?: 'asc' | 'desc'; // Controlled sort direction
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void; // Sort change callback
  sx?: SxProps<Theme>; // Container Card/Paper styling
  tableSx?: SxProps<Theme>; // Inner Table styling
  ariaLabel?: string; // Accessible table label
}

type PaginationItem =
  | { type: 'page'; page: number } // Page number item
  | { type: 'ellipsis'; key: string }; // Ellipsis item

// Compute pagination items with a maximum of 3 number buttons and ellipses
function getPaginationItems(activePage: number, totalPages: number): PaginationItem[] {
  // If 3 or fewer pages, display all available page buttons without ellipsis
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: 'page',
      page: i + 1,
    }));
  }

  // When totalPages > 3, show exactly 3 number buttons
  // Case 1: First 2 pages (1, 2, ..., totalPages)
  if (activePage <= 2) {
    return [
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'ellipsis', key: 'dots-end' },
      { type: 'page', page: totalPages },
    ];
  }

  // Case 2: Last 2 pages (1, ..., totalPages - 1, totalPages)
  if (activePage >= totalPages - 1) {
    return [
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'dots-start' },
      { type: 'page', page: totalPages - 1 },
      { type: 'page', page: totalPages },
    ];
  }

  // Case 3: Middle page (1, ..., activePage, ..., totalPages)
  return [
    { type: 'page', page: 1 },
    { type: 'ellipsis', key: 'dots-start' },
    { type: 'page', page: activePage },
    { type: 'ellipsis', key: 'dots-end' },
    { type: 'page', page: totalPages },
  ];
}

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;

export function DataGrid<T = object>({
  columns,
  rows,
  data,
  getRowId,
  height = '100%',
  width = '100%',
  onRowClick,
  loading = false,
  isLoading = false,
  loadingRowCount = 5,
  emptyTitle = 'No data available',
  emptySubtitle,
  emptyIcon: EmptyIcon = Inbox,
  emptyAction,
  stickyHeader = true,
  dense = false,
  rowHeight,
  minWidth = '100%',
  pagination = false,
  page,
  pageSize = 10,
  totalRows,
  onPageChange,
  onPageSizeChange,
  rowsPerPageOptions: _rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  paginationEntityName = 'reservations',
  paginationHideDisabledNav = false,
  sortBy: controlledSortBy,
  sortDirection: controlledSortDirection = 'asc',
  onSortChange,
  sx,
  tableSx,
  ariaLabel,
}: DataGridProps<T>) {
  void _rowsPerPageOptions;
  const isDataLoading = loading || isLoading;
  const rawRows: readonly T[] = rows ?? data ?? [];

  // Internal sorting state
  const [internalSortBy, setInternalSortBy] = useState<string | null>(controlledSortBy ?? null);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>(
    controlledSortDirection,
  );

  const activeSortBy = controlledSortBy !== undefined ? controlledSortBy : internalSortBy;
  const activeSortDirection =
    controlledSortDirection !== undefined ? controlledSortDirection : internalSortDirection;

  // Internal pagination state
  const [internalPage, setInternalPage] = useState<number>(1);
  const [internalPageSize, setInternalPageSize] = useState<number>(pageSize);

  const activePage = page !== undefined ? page : internalPage;
  const activePageSize = pageSize !== undefined ? pageSize : internalPageSize;

  const handleSort = (field: string) => {
    const isAsc = activeSortBy === field && activeSortDirection === 'asc';
    const nextDirection: 'asc' | 'desc' = isAsc ? 'desc' : 'asc';

    if (onSortChange) {
      onSortChange(field, nextDirection);
    } else {
      setInternalSortBy(field);
      setInternalSortDirection(nextDirection);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (onPageChange) {
      onPageChange(nextPage);
    } else {
      setInternalPage(nextPage);
    }
  };

  const _handlePageSizeChange = (nextSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(nextSize);
    } else {
      setInternalPageSize(nextSize);
      setInternalPage(1);
    }
  };
  void _handlePageSizeChange;

  // Sort rows client-side if no external onSortChange handler is provided
  const processedRows = [...rawRows];
  if (!onSortChange && activeSortBy) {
    const sortCol = columns.find((c) => c.field === activeSortBy);
    processedRows.sort((a, b) => {
      const aVal = sortCol?.valueGetter
        ? sortCol.valueGetter(a)
        : (a as Record<string, unknown>)[activeSortBy];
      const bVal = sortCol?.valueGetter
        ? sortCol.valueGetter(b)
        : (b as Record<string, unknown>)[activeSortBy];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return activeSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return activeSortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  // Calculate pagination
  const totalCount = totalRows !== undefined ? totalRows : processedRows.length;
  const isClientSidePagination = totalRows === undefined;
  const totalPages = Math.max(1, Math.ceil(totalCount / activePageSize));
  const startCount = totalCount === 0 ? 0 : (activePage - 1) * activePageSize + 1;
  const endCount = Math.min(activePage * activePageSize, totalCount);
  const paginationItems = getPaginationItems(activePage, totalPages);

  const displayRows =
    pagination && isClientSidePagination
      ? processedRows.slice((activePage - 1) * activePageSize, activePage * activePageSize)
      : processedRows;

  const colSpan = columns.length;
  const isClickable = Boolean(onRowClick);

  return (
    <Paper
      elevation={0}
      sx={{
        width,
        height,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
    >
      <TableContainer
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          size={dense ? 'small' : 'medium'}
          aria-label={ariaLabel}
          sx={{
            width: '100%',
            minWidth: minWidth,
            borderCollapse: 'separate',
            ...tableSx,
          }}
        >
          <TableHead
            sx={{
              position: stickyHeader ? 'sticky' : undefined,
              top: 0,
              zIndex: 3,
            }}
          >
            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
              {columns.map((col, index) => {
                const headerText = col.headerName ?? col.label ?? col.field;
                const align = col.headerAlign ?? col.align ?? 'left';
                const isSortable = col.sortable !== false;
                const isSorted = activeSortBy === col.field;

                return (
                  <TableCell
                    key={col.field || index}
                    align={align}
                    sortDirection={isSorted ? activeSortDirection : false}
                    sx={{
                      position: stickyHeader ? 'sticky' : undefined,
                      top: 0,
                      zIndex: 3,
                      height: 44,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      py: dense ? 0.75 : 1,
                      px: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'action.hover' : '#F9FAFB',
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      whiteSpace: 'nowrap',
                      width: col.width,
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth,
                    }}
                  >
                    {isSortable ? (
                      <TableSortLabel
                        active={isSorted}
                        direction={isSorted ? activeSortDirection : 'asc'}
                        onClick={() => handleSort(col.field)}
                        sx={{
                          '& .MuiTableSortLabel-icon': {
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          },
                          '&:hover .MuiTableSortLabel-icon': {
                            opacity: 0.7,
                          },
                          '&.Mui-active': {
                            color: 'text.primary',
                            '& .MuiTableSortLabel-icon': {
                              opacity: 1,
                              color: 'primary.main',
                            },
                          },
                        }}
                      >
                        {headerText}
                      </TableSortLabel>
                    ) : (
                      headerText
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {isDataLoading ? (
              Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                <TableRow key={`loading-row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <TableCell
                      key={`loading-cell-${col.field || cIdx}`}
                      align={col.align ?? 'left'}
                      sx={{
                        py: dense ? 1 : 1.25,
                        px: 2,
                        borderColor: 'divider',
                      }}
                    >
                      <Skeleton
                        variant="text"
                        height={24}
                        width={cIdx === 0 ? '70%' : cIdx === colSpan - 1 ? '40%' : '55%'}
                        sx={
                          col.align === 'center'
                            ? { mx: 'auto' }
                            : col.align === 'right'
                              ? { ml: 'auto' }
                              : undefined
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ py: 6, textAlign: 'center', border: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      px: 2,
                    }}
                  >
                    {EmptyIcon && <EmptyIcon size={40} style={{ opacity: 0.35 }} />}
                    <Typography sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                      {emptyTitle}
                    </Typography>
                    {emptySubtitle && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', maxWidth: 440, fontSize: '0.8125rem' }}
                      >
                        {emptySubtitle}
                      </Typography>
                    )}
                    {emptyAction && <Box sx={{ mt: 1.5 }}>{emptyAction}</Box>}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, rowIndex) => {
                const rowKey = getRowId
                  ? getRowId(row, rowIndex)
                  : ((row as { id?: string | number; _id?: string | number }).id ??
                    (row as { id?: string | number; _id?: string | number })._id ??
                    rowIndex);

                return (
                  <TableRow
                    key={rowKey}
                    hover
                    onClick={isClickable ? (e) => onRowClick?.(row, e) : undefined}
                    onKeyDown={
                      isClickable
                        ? (e: KeyboardEvent<HTMLTableRowElement>) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick?.(row, e as unknown as MouseEvent<HTMLTableRowElement>);
                            }
                          }
                        : undefined
                    }
                    tabIndex={isClickable ? 0 : undefined}
                    role={isClickable ? 'button' : undefined}
                    sx={{
                      height: rowHeight,
                      cursor: isClickable ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                      '&:last-child td': {
                        borderBottom: (theme) =>
                          pagination ? `1px solid ${theme.palette.divider}` : 'none',
                      },
                      ...(isClickable && {
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                          outlineOffset: -2,
                        },
                      }),
                    }}
                  >
                    {columns.map((col, colIndex) => {
                      const align = col.align ?? 'left';
                      const rawValue = col.valueGetter
                        ? col.valueGetter(row)
                        : (row as Record<string, unknown>)[col.field];

                      let content: ReactNode;
                      if (col.renderCell) {
                        content = col.renderCell({ row, value: rawValue, index: rowIndex });
                      } else if (col.render) {
                        content = col.render(row, rowIndex);
                      } else if (rawValue === null || rawValue === undefined) {
                        content = '—';
                      } else if (typeof rawValue === 'boolean') {
                        content = rawValue ? 'Yes' : 'No';
                      } else if (typeof rawValue === 'object') {
                        content = String(rawValue);
                      } else {
                        content = String(rawValue);
                      }

                      return (
                        <TableCell
                          key={col.field || colIndex}
                          align={align}
                          sx={{
                            height: rowHeight,
                            py: rowHeight ? 0 : dense ? 1 : 1.25,
                            px: 2,
                            fontSize: '0.875rem',
                            color: 'text.primary',
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                            width: col.width,
                            minWidth: col.minWidth,
                            maxWidth: col.maxWidth,
                          }}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Box
          component="footer"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            px: 3,
            py: 1.5,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {/* Summary description showing current page range and total items */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            {totalCount === 0
              ? `Showing 0 of 0 ${paginationEntityName}`
              : `Showing ${startCount}-${endCount} of ${totalCount} ${paginationEntityName}`}
          </Typography>

          {/* Navigation controls */}
          <Box
            component="nav"
            aria-label="Table pagination"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* Prev button */}
            {(!paginationHideDisabledNav || activePage > 1) && (
              <ButtonBase
                component="button"
                type="button"
                disabled={activePage <= 1}
                onClick={() => handlePageChange(activePage - 1)}
                aria-label="Previous page"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  height: 32,
                  px: 1.25,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: activePage <= 1 ? 'text.disabled' : 'text.primary',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: activePage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: activePage <= 1 ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  '&:hover':
                    activePage > 1
                      ? { bgcolor: 'action.hover', borderColor: 'text.secondary' }
                      : undefined,
                }}
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
                Prev
              </ButtonBase>
            )}

            {/* Page number buttons and ellipses */}
            {paginationItems.map((item) => {
              if (item.type === 'ellipsis') {
                return (
                  <Typography
                    key={item.key}
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 24,
                      height: 32,
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      userSelect: 'none',
                    }}
                  >
                    …
                  </Typography>
                );
              }

              const isCurrent = item.page === activePage;
              return (
                <ButtonBase
                  key={`page-${item.page}`}
                  component="button"
                  type="button"
                  onClick={() => handlePageChange(item.page)}
                  aria-label={`Page ${item.page}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 32,
                    height: 32,
                    px: 1,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isCurrent ? 'primary.main' : 'divider',
                    bgcolor: isCurrent ? 'primary.main' : 'background.paper',
                    color: isCurrent ? '#FFFFFF' : 'text.primary',
                    fontSize: '0.8125rem',
                    fontWeight: isCurrent ? 600 : 500,
                    cursor: isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': !isCurrent
                      ? { bgcolor: 'action.hover', borderColor: 'text.secondary' }
                      : undefined,
                  }}
                >
                  {item.page}
                </ButtonBase>
              );
            })}

            {/* Next button */}
            {(!paginationHideDisabledNav || activePage < totalPages) && (
              <ButtonBase
                component="button"
                type="button"
                disabled={activePage >= totalPages}
                onClick={() => handlePageChange(activePage + 1)}
                aria-label="Next page"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  height: 32,
                  px: 1.25,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  color: activePage >= totalPages ? 'text.disabled' : 'text.primary',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: activePage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: activePage >= totalPages ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  '&:hover':
                    activePage < totalPages
                      ? { bgcolor: 'action.hover', borderColor: 'text.secondary' }
                      : undefined,
                }}
              >
                Next
                <ChevronRight size={14} strokeWidth={2.5} />
              </ButtonBase>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
