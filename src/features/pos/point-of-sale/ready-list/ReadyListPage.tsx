'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { FilterChips, type FilterChipItem } from '@/components/shared/form-fields/FilterChips';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { Toast } from '@/components/shared/ui/Toast';
import { ReadyOrderCard } from '@/features/pos/point-of-sale/components/ReadyOrderCard';
import { CaptainWorkspaceSubheader } from '@/features/pos/point-of-sale/components/CaptainWorkspaceSubheader';
import { ReadyOrderDetailsModal } from '@/features/pos/point-of-sale/ready-list/ReadyOrderDetailsModal';
import { useCaptainCompactLayout } from '@/lib/hooks/useCaptainCompactLayout';
import { POS_CAPTAIN_LIST_BOTTOM_GAP } from '@/lib/helpers/posCaptainFlow';
import {
  MOCK_READY_ORDERS,
  type ReadyOrderItem,
  type ReadyOrderQueue,
} from '@/lib/mocks/pos/usePosOrders.mocks';
import { colors } from '@/lib/theme/mui/colors';

type ReadyListTab = ReadyOrderQueue;

function matchesSearch(order: ReadyOrderItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    order.table.toLowerCase().includes(q) ||
    order.token.toLowerCase().includes(q) ||
    order.dishSummary.toLowerCase().includes(q)
  );
}

/**
 * Ready to Serve — captain mobile matches Figma (tabs, search, compact cards); desktop keeps grid cards.
 */
export function ReadyListPage() {
  const captainCompact = useCaptainCompactLayout();
  const [orders, setOrders] = useState<ReadyOrderItem[]>(MOCK_READY_ORDERS);
  const [activeTab, setActiveTab] = useState<ReadyListTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [servingOrderId, setServingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ReadyOrderItem | null>(null);

  const tabCounts = useMemo(() => {
    const counts: Record<ReadyListTab, number> = { active: 0, pending: 0, history: 0 };
    for (const order of orders) {
      if (matchesSearch(order, searchQuery)) {
        counts[order.queue] += 1;
      }
    }
    return counts;
  }, [orders, searchQuery]);

  const tabItems: FilterChipItem<ReadyListTab>[] = useMemo(
    () => [
      { id: 'active', label: 'Active', count: tabCounts.active },
      { id: 'pending', label: 'Pending', count: tabCounts.pending },
      { id: 'history', label: 'History', count: tabCounts.history },
    ],
    [tabCounts],
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.queue === activeTab && matchesSearch(order, searchQuery));
  }, [orders, activeTab, searchQuery]);

  const handleMarkServed = (order: ReadyOrderItem) => {
    setServingOrderId(order.id);
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((row) =>
          row.id === order.id ? { ...row, queue: 'history', readyTimeAgo: 'Served just now' } : row,
        ),
      );
      setServingOrderId(null);
      setToastMessage(`${order.table} (${order.token}) marked as served!`);
    }, 350);
  };

  const listContent =
    filteredOrders.length === 0 ? (
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          p: captainCompact ? 5 : 8,
          textAlign: 'center',
          mt: captainCompact ? 0 : 2,
        }}
      >
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          No orders in this view
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          Try another tab or adjust your search.
        </Typography>
      </Box>
    ) : captainCompact ? (
      <Stack spacing={1.5}>
        {filteredOrders.map((order) => (
          <ReadyOrderCard
            key={order.id}
            order={order}
            onDetails={setSelectedOrder}
            onMarkServed={handleMarkServed}
            isServing={servingOrderId === order.id}
          />
        ))}
      </Stack>
    ) : (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2.5,
        }}
      >
        {filteredOrders.map((order) => (
          <ReadyOrderCard
            key={order.id}
            order={order}
            onDetails={setSelectedOrder}
            onMarkServed={handleMarkServed}
            isServing={servingOrderId === order.id}
          />
        ))}
      </Box>
    );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        flex: captainCompact ? 1 : undefined,
        minHeight: captainCompact ? 0 : undefined,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflowY: captainCompact ? 'hidden' : 'auto',
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          width: '100%',
          mx: 'auto',
          flex: captainCompact ? 1 : undefined,
          minHeight: captainCompact ? 0 : undefined,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {captainCompact ? (
          <Stack spacing={1.5} sx={{ flexShrink: 0, mb: 1.5 }}>
            <CaptainWorkspaceSubheader title="Ready to Serve" subtitle="Kitchen updates live" />
            <FilterChips
              items={tabItems}
              value={activeTab}
              onChange={(value) => setActiveTab(value)}
              scrollable
              ariaLabel="Ready list tabs"
            />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search orders, tokens, table numbers..."
              fullWidth
              showClear
              sx={{ height: 44, borderRadius: '12px' }}
            />
          </Stack>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 1.5,
                flexShrink: 0,
              }}
            >
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Search orders, tokens, table numbers..."
                fullWidth
                showClear
                sx={{ height: 44, borderRadius: '12px', maxWidth: { sm: 380 } }}
              />

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(colors.success.default, 0.15)
                      : alpha(colors.success.default, 0.1),
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(colors.success.default, 0.3)
                      : alpha(colors.success.default, 0.25),
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
                  px: 1.75,
                  py: 0.75,
                  borderRadius: '20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: colors.success.default,
                  }}
                />
                Live Store Ops Online
              </Box>
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', mb: 1.5, flexShrink: 0, flexWrap: 'wrap', gap: 1.5 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1.35rem', sm: '1.65rem' },
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: '-0.02em',
                }}
              >
                Ready to Serve
              </Typography>
              <FilterChips
                items={tabItems}
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                scrollable
                ariaLabel="Ready list tabs"
              />
            </Stack>
          </>
        )}

        <Box
          sx={{
            flex: captainCompact ? 1 : undefined,
            minHeight: captainCompact ? 0 : undefined,
            overflowY: captainCompact ? 'auto' : 'visible',
            pb: captainCompact ? `${POS_CAPTAIN_LIST_BOTTOM_GAP}px` : 0,
          }}
        >
          {listContent}
        </Box>
      </Box>

      <ReadyOrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
