'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Card } from '@/components/shared/ui/Card';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { CardItemSection } from '@/components/shared/ui/CardItemSection';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { PosMetricCard } from './PosMetricCard';
import { PosTableCard } from './PosTableCard';
import { FLOOR_LEGEND_CONFIG, getNotificationSeverityColor } from '@/lib/helpers';
import {
  POS_METRIC_CARDS,
  POS_LIVE_ORDERS,
  POS_FLOOR_TABLES,
  POS_ONLINE_SUMMARY,
  POS_READY_ORDERS,
  POS_RECENT_TRANSACTIONS,
  POS_SYSTEM_NOTIFICATIONS,
  POS_SHIFT_INFO,
  type PosLiveOrder,
} from '@/lib/mocks/pos/usePosDashboard.mocks';

export function PosDashboard() {
  const [onlinePeriod, setOnlinePeriod] = useState('today');

  // Compact percentage-based DataGrid columns to fit 60% card with ZERO horizontal scroll
  const liveOrderColumns: DataGridColumn<PosLiveOrder>[] = [
    {
      field: 'orderNumber',
      headerName: 'ORDER #',
      width: '15%',
      minWidth: 46,
      renderCell: ({ row }) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
          {row.orderNumber}
        </Typography>
      ),
    },
    {
      field: 'table',
      headerName: 'TABLE',
      width: '10%',
      minWidth: 36,
      renderCell: ({ row }) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary' }}>
          {row.table}
        </Typography>
      ),
    },
    {
      field: 'customerName',
      headerName: 'CUSTOMER NAME',
      width: '28%',
      minWidth: 85,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {row.customerName}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: '20%',
      minWidth: 68,
      renderCell: ({ row }) => <StatusChip status={row.status} size="small" />,
    },
    {
      field: 'time',
      headerName: 'TIME',
      width: '18%',
      minWidth: 58,
      renderCell: ({ row }) => (
        <Typography sx={{ fontSize: '0.78125rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {row.time}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'ACTION',
      width: '16%',
      minWidth: 44,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <ActionButton
          variant="outlined"
          size="small"
          sx={{
            minWidth: 42,
            height: 26,
            px: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '6px',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          {row.action}
        </ActionButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. First Section: 4 Metric Cards (Height: 176px, Gap: 20px)        */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: '20px',
        }}
      >
        {POS_METRIC_CARDS.map((metric) => (
          <PosMetricCard key={metric.id} data={metric} />
        ))}
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Second Section: Live Orders (60%) & Floor Status (40%) (400px)   */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '6fr 4fr' },
          gap: '20px',
        }}
      >
        {/* Left Card (60%): Live Order Queue with NO horizontal scroll */}
        <Card
          title="LIVE ORDER QUEUE"
          padding="16px 20px"
          headerPadding="20px 24px 12px 24px"
          sx={{
            height: 400,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              px: 0.5,
            }}
          >
            <DataGrid
              columns={liveOrderColumns}
              rows={POS_LIVE_ORDERS}
              getRowId={(row) => row.id}
              dense
              stickyHeader
              emptyTitle="No orders in queue"
              sx={{
                border: 'none',
                width: '100%',
                overflowX: 'hidden',
                '& .MuiTableContainer-root': {
                  overflowX: 'hidden !important',
                },
              }}
              tableSx={{
                tableLayout: 'fixed',
                width: '100%',
                '& .MuiTableCell-root': {
                  px: 1,
                  py: 1,
                },
              }}
            />
          </Box>
        </Card>

        {/* Right Card (40%): Restaurant Floor Status with Scroll & Fixed Legend at Bottom */}
        <Card
          title="RESTAURANT FLOOR STATUS"
          padding="16px 20px"
          headerPadding="20px 24px 12px 24px"
          sx={{
            height: 400,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Scrollable Table Cards Area */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 0.5,
              '&::-webkit-scrollbar': {
                width: 5,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'divider',
                borderRadius: 3,
              },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5,
                pb: 1,
              }}
            >
              {POS_FLOOR_TABLES.map((table) => (
                <PosTableCard key={table.id} table={table} />
              ))}
            </Box>
          </Box>

          {/* Fixed Color Description / Legend at the Last */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              pt: 1.5,
              mt: 'auto',
              borderTop: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            {FLOOR_LEGEND_CONFIG.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Third Section: 3 Cards of Equal Width & Height (346px, Gap: 20px)*/}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: '20px',
        }}
      >
        {/* Card 1: Online Orders */}
        <Card
          title="Online orders"
          action={
            <Dropdown
              size="small"
              value={onlinePeriod}
              onChange={(val) => setOnlinePeriod(val)}
              options={[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
              ]}
              sx={{ height: 32, fontSize: '0.8125rem' }}
            />
          }
          padding="16px 20px"
          headerPadding="20px 20px 8px 20px"
          sx={{
            height: 346,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Sales & Orders Sub-metrics */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 0.5,
              pb: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              >
                Total Online Sales
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: 'text.primary',
                  mt: 0.25,
                }}
              >
                {POS_ONLINE_SUMMARY.totalSales}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              >
                Orders
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: 'text.primary',
                  mt: 0.25,
                }}
              >
                {POS_ONLINE_SUMMARY.totalOrders}
              </Typography>
            </Box>
          </Box>

          {/* Platforms List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Header row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                px: 1,
                pb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.04em',
                }}
              >
                PLATFORM
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.04em',
                }}
              >
                ORDERS
              </Typography>
            </Box>

            {POS_ONLINE_SUMMARY.platforms.map((plat) => (
              <Box
                key={plat.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1,
                  borderRadius: '8px',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.hover' : '#FAFAFB'),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {plat.iconKey === 'zomato' ? (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        bgcolor: '#E23744',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 900,
                      }}
                    >
                      z
                    </Box>
                  ) : plat.iconKey === 'swiggy' ? (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        bgcolor: '#FC8019',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 900,
                      }}
                    >
                      s
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        bgcolor: '#3B82F6',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 900,
                      }}
                    >
                      G
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.84375rem',
                      color: 'text.primary',
                    }}
                  >
                    {plat.name}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.84375rem',
                    color: 'text.primary',
                  }}
                >
                  {plat.orders}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Card 2: READY ORDERS */}
        <Card
          title="READY ORDERS"
          padding="0 20px 20px 20px"
          headerPadding="20px 20px 16px 20px"
          sx={{
            height: 346,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {POS_READY_ORDERS.map((item) => (
              <CardItemSection key={item.id} height={52} padding="14px">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    {item.orderNumber}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.84375rem',
                      color: 'text.primary',
                    }}
                  >
                    {item.destination}
                  </Typography>
                </Box>
                <StatusChip status={item.status} size="small" />
              </CardItemSection>
            ))}
          </Box>
        </Card>

        {/* Card 3: RECENT TRANSACTIONS */}
        <Card
          title="RECENT TRANSACTIONS"
          padding="0 20px 20px 20px"
          headerPadding="20px 20px 16px 20px"
          sx={{
            height: 346,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {POS_RECENT_TRANSACTIONS.map((tx) => (
              <CardItemSection key={tx.id} height={52} padding="14px">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    {tx.txNumber}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.84375rem',
                      color: 'text.primary',
                    }}
                  >
                    {tx.amount}
                  </Typography>
                </Box>
                <StatusChip status={tx.method} size="small" />
              </CardItemSection>
            ))}
          </Box>
        </Card>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Fourth Section: Half & Half (50% / 50%) (Height: 173px, Gap: 20px)*/}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: '20px',
        }}
      >
        {/* Card 1: SYSTEM NOTIFICATIONS */}
        <Card
          title="SYSTEM NOTIFICATIONS"
          padding="10px 20px"
          headerPadding="16px 20px 6px 20px"
          sx={{
            height: 173,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {POS_SYSTEM_NOTIFICATIONS.map((item) => {
              const dotColor = getNotificationSeverityColor(item.severity);

              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.78125rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.message}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      color: dotColor,
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {item.status}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Card>

        {/* Card 2: SHIFT INFORMATION */}
        <Card
          title="SHIFT INFORMATION"
          padding="10px 20px"
          headerPadding="16px 20px 6px 20px"
          sx={{
            height: 173,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {/* Row 1: Started */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
                Started
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                {POS_SHIFT_INFO.started}
              </Typography>
            </Box>

            {/* Row 2: Orders Handled */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
                Orders Handled
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                {POS_SHIFT_INFO.ordersHandled}
              </Typography>
            </Box>

            {/* Row 3: Status */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.25,
              }}
            >
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
                Status
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#10B981',
                }}
              >
                {POS_SHIFT_INFO.status}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default PosDashboard;
