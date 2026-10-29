'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { Toast } from '@/components/shared/ui/Toast';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  captainReadyListHref,
  readyListSegmentFromQueue,
} from '@/lib/helpers/captainReadyListRoutes';
import { POS_CAPTAIN_LIST_BOTTOM_GAP } from '@/lib/helpers/posCaptainFlow';
import {
  kitchenStatusErrorMessage,
  useUpdateKitchenOrderStatus,
} from '@/lib/hooks/kitchen-display/useUpdateKitchenOrderStatus';
import { useBranchOrder } from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrder';
import { useCaptainReadyList } from '@/lib/hooks/pos/point-of-sale/ready-list/useCaptainReadyList';
import {
  readBranchOrderVersion,
  rememberBranchOrderVersion,
} from '@/lib/hooks/pos/point-of-sale/order-events/branchOrderEventsConnection';
import { useCaptainCompactLayout } from '@/lib/hooks/useCaptainCompactLayout';
import { parseBranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import { branchOrderDetailToReadyOrder } from '@/lib/schemas/pos/point-of-sale/ready-list/branchReadyListOrders';
import type {
  ReadyOrderItem,
  ReadyOrderQueue,
} from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1, { branchOrdersPath } from '@/services/api/ApiUrlsV1';
import { colors } from '@/lib/theme/mui/colors';
import { CaptainReadyServeCard, readyOrderLineKey, readyOrderLines } from './CaptainReadyServeCard';

type ReadyListTab = ReadyOrderQueue;

const TABS: { id: ReadyListTab; label: string }[] = [
  { id: 'active', label: 'Ready to serve' },
  { id: 'pending', label: 'Preparing Items' },
  { id: 'history', label: 'Served' },
];

const PAGE_COPY: Record<ReadyListTab, { title: string; subtitle: string }> = {
  active: {
    title: 'Ready to serve',
    subtitle: 'Fresh from the kitchen. Confirm each order as it reaches the table.',
  },
  pending: {
    title: 'Preparing Items',
    subtitle: 'Track orders in the kitchen as they get ready for service.',
  },
  history: {
    title: 'Served',
    subtitle: 'Review completed orders and their service times.',
  },
};

function tabCountColor(tab: ReadyListTab): string {
  if (tab === 'pending') return colors.warning.dark;
  if (tab === 'history') return colors.success.dark;
  return colors.danger.default;
}

function matchesSearch(order: ReadyOrderItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const lineHit = order.lines.some((line) => line.name.toLowerCase().includes(q));
  return (
    lineHit ||
    order.table.toLowerCase().includes(q) ||
    order.token.toLowerCase().includes(q) ||
    order.dishSummary.toLowerCase().includes(q)
  );
}

export interface CaptainReadyListProps {
  /** Tab from the URL segment (`ready-to-serve` | `preparing` | `served`). */
  activeTab?: ReadyListTab;
}

/**
 * Captain ready list — Ready to serve, Preparing items, and Served.
 */
export function CaptainReadyList({ activeTab = 'active' }: Readonly<CaptainReadyListProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const captainCompact = useCaptainCompactLayout();
  const queryClient = useQueryClient();
  const { branchId, orders, queueTotal, isLoading, isError, error, refetch } =
    useCaptainReadyList(activeTab);
  const updateKitchenStatus = useUpdateKitchenOrderStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [servingOrderId, setServingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ReadyOrderItem | null>(null);
  const { data: selectedOrderDetail } = useBranchOrder(selectedOrder?.id ?? null, branchId);

  const tabCounts = useMemo(() => {
    const counts: Record<ReadyListTab, number> = { active: 0, pending: 0, history: 0 };
    const visibleOnTab = orders.filter(
      (order) => order.queue === activeTab && matchesSearch(order, searchQuery),
    ).length;
    counts[activeTab] = searchQuery.trim() ? visibleOnTab : queueTotal;
    return counts;
  }, [orders, searchQuery, activeTab, queueTotal]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => order.queue === activeTab && matchesSearch(order, searchQuery)),
    [orders, activeTab, searchQuery],
  );

  const handleMarkServed = async (order: ReadyOrderItem) => {
    if (branchId == null || updateKitchenStatus.isPending) return;
    setServingOrderId(order.id);
    try {
      const payload = await api.get<unknown>(
        ApiUrlsV1.pos.pointOfSale.allOrders.detail(branchId, order.id),
      );
      const detail = parseBranchOrderDetail(payload);
      const numericOrderId = Number(order.id);
      const streamedVersion = Number.isInteger(numericOrderId)
        ? readBranchOrderVersion(branchId, numericOrderId)
        : undefined;
      const expectedVersion = Math.max(
        detail.version ?? 0,
        order.orderVersion ?? 0,
        streamedVersion ?? 0,
      );
      const result = await updateKitchenStatus.mutateAsync({
        branchId,
        orderId: order.id,
        expectedVersion: expectedVersion >= 1 ? expectedVersion : 1,
        action: 'served',
        boardQueryPath: branchOrdersPath(branchId),
      });
      if (Number.isInteger(numericOrderId)) {
        rememberBranchOrderVersion(branchId, numericOrderId, result.nextVersion);
      }
      await refetch();
      void queryClient.invalidateQueries({
        queryKey: ['pos', 'point-of-sale', 'all-orders', 'detail', branchId, order.id],
      });
      setSelectedOrder(null);
      setToastMessage(`${order.table} (${order.token}) marked as served`);
    } catch (markError) {
      setToastMessage(kitchenStatusErrorMessage(markError));
    } finally {
      setServingOrderId(null);
    }
  };

  const drawerOrder = useMemo(() => {
    if (!selectedOrder) return null;
    if (selectedOrderDetail) {
      return branchOrderDetailToReadyOrder(selectedOrderDetail, selectedOrder.queue);
    }
    return selectedOrder;
  }, [selectedOrder, selectedOrderDetail]);

  const detailLines = drawerOrder ? readyOrderLines(drawerOrder) : [];
  const pageCopy = PAGE_COPY[activeTab];
  const filteredQueueTotal = searchQuery.trim() ? filteredOrders.length : queueTotal;

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
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          flex: captainCompact ? 1 : undefined,
          minHeight: captainCompact ? 0 : undefined,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 2, flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: '1.35rem', sm: '1.5rem' },
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            {pageCopy.title}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {pageCopy.subtitle}
          </Typography>
        </Stack>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search orders or tables..."
          fullWidth
          showClear
          sx={{
            height: 44,
            borderRadius: '12px',
            mb: 2,
            flexShrink: 0,
            bgcolor: 'background.paper',
          }}
        />

        <Box
          role="tablist"
          aria-label="Ready list tabs"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2.5,
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          {TABS.map((tab) => {
            const selected = tab.id === activeTab;
            return (
              <ButtonBase
                key={tab.id}
                role="tab"
                aria-selected={selected}
                onClick={() =>
                  router.push(captainReadyListHref(pathname, readyListSegmentFromQueue(tab.id)))
                }
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '999px',
                  bgcolor: selected ? 'background.paper' : 'transparent',
                  boxShadow: selected ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                  color: selected ? 'text.primary' : 'text.secondary',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {tab.label}
                <Box
                  component="span"
                  sx={{
                    minWidth: 18,
                    height: 18,
                    px: 0.6,
                    borderRadius: '999px',
                    bgcolor: (theme) =>
                      selected
                        ? alpha(tabCountColor(tab.id), theme.palette.mode === 'dark' ? 0.22 : 0.14)
                        : theme.palette.mode === 'dark'
                          ? 'action.hover'
                          : colors.divider.light,
                    color: selected ? tabCountColor(tab.id) : 'text.secondary',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tabCounts[tab.id]}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>

        <Box
          sx={{
            flex: captainCompact ? 1 : undefined,
            minHeight: captainCompact ? 0 : undefined,
            overflowY: captainCompact ? 'auto' : 'visible',
            pb: captainCompact ? `${POS_CAPTAIN_LIST_BOTTOM_GAP}px` : 0,
          }}
        >
          {isError ? (
            <AlertMessage variant="error" message={getErrorMessage(error)} sx={{ mb: 2 }} />
          ) : null}
          {isLoading && orders.length === 0 ? (
            <Loading message="Loading ready orders…" fullPage={false} />
          ) : filteredOrders.length === 0 ? (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                p: 6,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No orders in this view</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Try another tab or adjust your search.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {filteredOrders.map((order) => (
                <CaptainReadyServeCard
                  key={order.id}
                  order={order}
                  showServeAction={activeTab === 'active'}
                  isServing={servingOrderId === order.id}
                  onOpen={setSelectedOrder}
                  onMarkServed={handleMarkServed}
                />
              ))}
            </Box>
          )}
          {filteredOrders.length > 0 && activeTab !== 'active' ? (
            <Typography sx={{ mt: 2, fontSize: '0.8125rem', color: 'text.secondary' }}>
              Showing {filteredOrders.length} of {filteredQueueTotal}{' '}
              {activeTab === 'pending' ? 'preparing' : 'served'} orders
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={selectedOrder != null}
        onClose={() => setSelectedOrder(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 320 },
              height: 'fit-content',
              maxHeight: 'calc(100% - 32px)',
              top: 16,
              right: 16,
              borderRadius: '16px',
              p: 2,
              boxSizing: 'border-box',
            },
          },
        }}
      >
        {drawerOrder && selectedOrder ? (
          <Stack spacing={2}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <TableRestaurantOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  {drawerOrder.table}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {drawerOrder.readyTimeAgo}
                </Typography>
                {drawerOrder.queue === 'history' && drawerOrder.servedClock ? (
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {drawerOrder.servedClock}
                  </Typography>
                ) : null}
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {drawerOrder.token}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                sx={{
                  fontWeight: drawerOrder.queue === 'active' ? 700 : 600,
                  fontSize: '0.875rem',
                  color: drawerOrder.queue === 'active' ? 'text.primary' : 'text.secondary',
                }}
              >
                {drawerOrder.queue === 'pending'
                  ? 'Items preparing'
                  : drawerOrder.queue === 'history'
                    ? 'Items'
                    : 'Items to serve'}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color:
                    drawerOrder.queue === 'active' ? colors.danger.default : colors.primary.default,
                }}
              >
                {drawerOrder.queue === 'active'
                  ? `${detailLines.length} items`
                  : detailLines.length === 1
                    ? '1 Item'
                    : `${detailLines.length} Items`}
              </Typography>
            </Box>
            <Stack spacing={1}>
              {detailLines.map((line, index) => (
                <Box
                  key={readyOrderLineKey(drawerOrder.id, line, index)}
                  sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {line.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: drawerOrder.queue === 'active' ? 700 : 500,
                      color:
                        drawerOrder.queue === 'active' ? colors.danger.default : 'text.secondary',
                    }}
                  >
                    {drawerOrder.queue === 'active' ? `+ ${line.quantity}` : `× ${line.quantity}`}
                  </Typography>
                </Box>
              ))}
            </Stack>
            {drawerOrder.queue === 'active' ? (
              <Button
                fullWidth
                disabled={servingOrderId === drawerOrder.id}
                onClick={() => handleMarkServed(drawerOrder)}
                startIcon={<CheckIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: colors.danger.default,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '10px',
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: colors.danger.dark, boxShadow: 'none' },
                }}
              >
                Mark as served
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Drawer>

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
