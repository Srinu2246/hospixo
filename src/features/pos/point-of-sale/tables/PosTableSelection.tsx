'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, Stack, Typography } from '@mui/material';
import { Plus } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { FilterBar } from '@/components/shared/form-fields/FilterBar';
import { FilterChips } from '@/components/shared/form-fields/FilterChips';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { Toast } from '@/components/shared/ui/Toast';
import {
  ReservationDialog,
  type NewReservationFormData,
} from '@/features/pos/point-of-sale/reservation/ReservationDialog';
import { TakeawayPage } from '@/features/pos/point-of-sale/takeaway/TakeawayPage';
import { useFloorSections } from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { usePosFloorLayout } from '@/lib/hooks/pos/point-of-sale/tables/usePosFloorLayout';
import { usePosFloorMap } from '@/lib/hooks/pos/point-of-sale/tables/usePosFloorMap';
import type { CartItem } from '@/lib/mocks/pos/usePosMenu.mocks';
import {
  DINE_IN_STATUS_FILTERS,
  DINE_IN_TABLE_STATUSES,
  POS_FLOOR_TABS,
  POS_STATUS_FILTERS,
  type PosTableItem,
  type PosTableStatus,
} from '@/lib/mocks/pos/usePosTables.mocks';
import { colors } from '@/lib/theme/mui/colors';
import { useSidebarStore } from '@/stores/sidebarStore';
import { PosFloorTableCard } from './PosFloorTableCard';

function getTableIdFromPathname(pathname?: string | null): string | null {
  if (!pathname) return null;
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return null;
  const reserved = ['dine-in', 'tables', 'checkout', 'dashboard', 'takeaway', 'take-away'];
  if (reserved.includes(last.toLowerCase())) return null;
  return last;
}

function isDineInActiveStatus(status: PosTableStatus) {
  return DINE_IN_TABLE_STATUSES.includes(status);
}

function matchesFloorAndSection(
  table: PosTableItem,
  activeFloor: string,
  activeSection: string,
  hasSections: boolean,
) {
  if (activeFloor && table.floorId !== activeFloor) return false;
  if (hasSections && activeSection && table.sectionId !== activeSection) return false;
  return true;
}

export interface PosTableSelectionProps {
  isDineIn?: boolean;
  onTableSelect?: (table: PosTableItem) => void;
  initialSelectedTableId?: string;
  initialTableId?: string;
}

/** Tables / Dine-in floor plan: filters, grid, and order handoff. */
export function PosTableSelection({
  isDineIn = false,
  onTableSelect,
  initialSelectedTableId = '',
  initialTableId,
}: Readonly<PosTableSelectionProps> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromTables = searchParams?.get('from') === 'tables';
  const isCaptainFlow = Boolean(pathname?.includes('captain-flow'));
  const branchId = useSidebarStore((state) => state.context.branchId);
  const floorsQuery = usePosFloorLayout(branchId);
  const floors = useMemo(() => floorsQuery.data ?? [], [floorsQuery.data]);

  const [tableOverrides, setTableOverrides] = useState<Record<string, Partial<PosTableItem>>>({});
  const [activeFloor, setActiveFloor] = useState(POS_FLOOR_TABS[0]?.id ?? '');
  const [activeSection, setActiveSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTableId, setSelectedTableId] = useState(initialSelectedTableId);
  const [manualActiveTable, setManualActiveTable] = useState<PosTableItem | null>(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const floorTabs = useMemo(
    () =>
      floors.length > 0
        ? floors.map((floor) => ({ id: String(floor.id), label: floor.name }))
        : POS_FLOOR_TABS,
    [floors],
  );

  const numericFloorId = /^\d+$/.test(activeFloor) ? Number(activeFloor) : undefined;
  const sectionsQuery = useFloorSections(branchId, numericFloorId);

  const sectionOptions = useMemo(
    () =>
      (sectionsQuery.data ?? [])
        .filter((section) => section.active)
        .map((section) => ({ id: section.id, label: section.name })),
    [sectionsQuery.data],
  );

  const numericSectionId = /^\d+$/.test(activeSection) ? Number(activeSection) : undefined;
  const floorMapQuery = usePosFloorMap(branchId, numericFloorId, numericSectionId);
  const isSingleSection = sectionOptions.length === 1;
  const canFetchFloorMap =
    typeof branchId === 'number' &&
    typeof numericFloorId === 'number' &&
    typeof numericSectionId === 'number';
  const isTablesLoading =
    floorsQuery.isLoading ||
    sectionsQuery.isLoading ||
    (canFetchFloorMap && (floorMapQuery.isPending || floorMapQuery.isFetching));

  const resolvedFloor =
    floorTabs.length === 0 || floorTabs.some((tab) => tab.id === activeFloor)
      ? activeFloor
      : floorTabs[0].id;
  if (resolvedFloor !== activeFloor) {
    setActiveFloor(resolvedFloor);
  }

  const resolvedSection =
    sectionOptions.length === 0 || sectionOptions.some((option) => option.id === activeSection)
      ? activeSection
      : sectionOptions[0].id;
  if (resolvedSection !== activeSection) {
    setActiveSection(resolvedSection);
  }

  const tables = useMemo(() => {
    const baseTables = floorMapQuery.isSuccess ? (floorMapQuery.data ?? []) : [];
    return baseTables.map((table) => {
      const override = tableOverrides[table.id];
      return override ? { ...table, ...override } : table;
    });
  }, [floorMapQuery.isSuccess, floorMapQuery.data, tableOverrides]);

  const resolvedSelectedId =
    selectedTableId && tables.some((table) => table.id === selectedTableId)
      ? selectedTableId
      : (tables[0]?.id ?? '');
  if (resolvedSelectedId !== selectedTableId) {
    setSelectedTableId(resolvedSelectedId);
  }

  const dineInBasePath = useMemo(() => {
    if (!pathname) return '/pos/point-of-sale/dine-in';
    const base = pathname.replace(/\/+$/, '');
    if (base.endsWith('/dine-in')) return base;
    if (base.includes('/dine-in/')) return base.replace(/\/dine-in\/.*$/, '/dine-in');
    return base.replace(/\/tables(?:\/.*)?$/, '/dine-in');
  }, [pathname]);

  const tablesBasePath = useMemo(() => {
    if (!pathname) return '/pos/point-of-sale/tables';
    const base = pathname.replace(/\/+$/, '');
    if (base.endsWith('/tables')) return base;
    if (base.includes('/tables/')) return base.replace(/\/tables\/.*$/, '/tables');
    return base.replace(/\/dine-in(?:\/.*)?$/, '/tables');
  }, [pathname]);

  const routeTableId = isDineIn ? (initialTableId ?? getTableIdFromPathname(pathname)) : null;
  const activeOrderTable = useMemo(() => {
    if (routeTableId) {
      const match = tables.find(
        (t) =>
          t.id.toLowerCase() === routeTableId.toLowerCase() ||
          t.name.toLowerCase() === routeTableId.toLowerCase(),
      );
      if (match) return match;
    }
    return manualActiveTable;
  }, [routeTableId, tables, manualActiveTable]);

  const selectedTableMatch = tables.find((t) => t.id === selectedTableId);
  const selectedTable: PosTableItem | undefined =
    !selectedTableMatch || (isDineIn && !isDineInActiveStatus(selectedTableMatch.status))
      ? undefined
      : selectedTableMatch;

  const handleConfirmReservation = (data: NewReservationFormData) => {
    const targetTable =
      (selectedTable && selectedTable.status !== 'occupied' ? selectedTable : null) ||
      tables.find((t) => t.status === 'available');

    if (targetTable) {
      setTableOverrides((prev) => ({
        ...prev,
        [targetTable.id]: {
          status: 'reserved',
          guests: data.guestCount,
          time: data.time,
          message: `Reserved: ${data.guest}`,
          waiter: data.guest,
        },
      }));
      setSelectedTableId(targetTable.id);
      setToastMessage(
        `✓ Table ${targetTable.name} successfully reserved for ${data.guest} (${data.guestCount} guests) at ${data.time}!`,
      );
    } else {
      setToastMessage(
        `✓ Reservation confirmed for ${data.guest} (${data.guestCount} guests) on ${data.date} at ${data.time}!`,
      );
    }

    setIsReservationOpen(false);
  };

  /** Tables → dine-in?from=tables; Dine In → dine-in; Captain → in-place menu. */
  const handleOpenTableMenu = (t: PosTableItem) => {
    setSelectedTableId(t.id);
    onTableSelect?.(t);

    if (isCaptainFlow && !isDineIn) {
      setManualActiveTable(t);
      return;
    }

    setManualActiveTable(t);
    const query = !isDineIn ? '?from=tables' : '';
    router.push(`${dineInBasePath}/${t.id}${query}`);
  };

  const handleTableClick = (t: PosTableItem) => {
    handleOpenTableMenu(t);
  };

  const handleBackToTables = () => {
    setManualActiveTable(null);
    router.push(fromTables || !isDineIn ? tablesBasePath : dineInBasePath);
  };

  const handleServeOrder = (servedTable: PosTableItem, items: CartItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    setTableOverrides((prev) => ({
      ...prev,
      [servedTable.id]: {
        status: 'occupied',
        amount: `Rs ${totalAmount.toLocaleString('en-IN')}`,
        time: 'Just now',
        guests: servedTable.guests ?? 2,
        waiter: servedTable.waiter ?? 'Server 1',
      },
    }));
  };

  const hasSections = sectionOptions.length > 0;

  const dineInEligibleTables = useMemo(() => {
    if (!isDineIn) return tables;
    return tables.filter(
      (table) =>
        isDineInActiveStatus(table.status) &&
        matchesFloorAndSection(table, activeFloor, activeSection, hasSections),
    );
  }, [isDineIn, tables, activeFloor, activeSection, hasSections]);

  const filteredTables = useMemo(() => {
    const source = isDineIn ? dineInEligibleTables : tables;
    return source.filter((table) => {
      if (!isDineIn && !matchesFloorAndSection(table, activeFloor, activeSection, hasSections)) {
        return false;
      }

      if (statusFilter && statusFilter !== 'all' && statusFilter !== 'filter') {
        if (table.status !== statusFilter) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = table.name.toLowerCase().includes(query);
        const matchesWaiter = table.waiter?.toLowerCase().includes(query);
        const matchesAmount = table.amount?.toLowerCase().includes(query);
        if (!matchesName && !matchesWaiter && !matchesAmount) return false;
      }

      return true;
    });
  }, [
    isDineIn,
    dineInEligibleTables,
    tables,
    activeFloor,
    activeSection,
    hasSections,
    statusFilter,
    searchQuery,
  ]);

  const hasNoDineInTables = isDineIn && dineInEligibleTables.length === 0;

  if (activeOrderTable) {
    const allowMenu =
      !isDineIn ||
      Boolean(routeTableId) ||
      isDineInActiveStatus(activeOrderTable.status) ||
      Boolean(manualActiveTable);

    if (allowMenu) {
      return (
        <TakeawayPage
          table={activeOrderTable}
          mode={fromTables || !isDineIn ? 'table' : 'dine-in'}
          onBackToTables={handleBackToTables}
          onServeOrder={handleServeOrder}
        />
      );
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: '1.5rem',
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              {isDineIn ? 'Dine In' : 'Tables'}
            </Typography>

            <FilterBar
              items={floorTabs}
              value={activeFloor}
              onChange={setActiveFloor}
              variant="segmented"
              size="medium"
            />

            {sectionOptions.length > 0 ? (
              <Dropdown
                size="medium"
                value={activeSection}
                onChange={setActiveSection}
                options={sectionOptions}
                disabled={sectionsQuery.isLoading || isSingleSection}
                sx={{
                  height: 40,
                  minWidth: 150,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              />
            ) : null}
          </Box>

          {!isDineIn ? (
            <ActionButton
              variant="primary"
              size="medium"
              startIcon={<Plus size={18} />}
              onClick={() => setIsReservationOpen(true)}
              sx={{
                height: 40,
                px: 2.5,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Reservation
            </ActionButton>
          ) : null}
        </Box>

        {floorsQuery.isError ? (
          <AlertMessage
            variant="error"
            title="Unable to load floors"
            message={
              floorsQuery.error instanceof Error
                ? floorsQuery.error.message
                : 'The floors request failed.'
            }
          />
        ) : null}

        {sectionsQuery.isError ? (
          <AlertMessage
            variant="error"
            title="Unable to load sections"
            message={
              sectionsQuery.error instanceof Error
                ? sectionsQuery.error.message
                : 'The sections request failed.'
            }
          />
        ) : null}

        {floorMapQuery.isError ? (
          <AlertMessage
            variant="error"
            title="Unable to load floor map"
            message={
              floorMapQuery.error instanceof Error
                ? floorMapQuery.error.message
                : 'The floor map request failed.'
            }
          />
        ) : null}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            <SearchBar
              placeholder="Find a table..."
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              showClear
              width={{ xs: '100%', sm: 260 }}
              sx={{ height: 40 }}
            />

            <FilterChips
              items={isDineIn ? DINE_IN_STATUS_FILTERS : POS_STATUS_FILTERS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </Box>

          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {!isDineIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.success.default }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Available
                </Typography>
              </Box>
            ) : null}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.primary.default }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Occupied
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.warning.default }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Reserved
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : colors.gray.light,
            borderRadius: 3,
          },
        }}
      >
        {isTablesLoading ? (
          <Loading message="Loading tables..." fullPage={false} sx={{ minHeight: 280 }} />
        ) : hasNoDineInTables ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              minHeight: 280,
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem' }}>
              No active dine-in tables
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', maxWidth: 360 }}>
              Reserved or ordered tables will show up here. Open Tables to seat guests or start a
              reservation.
            </Typography>
            <ActionButton
              variant="primary"
              size="medium"
              onClick={() => router.push(tablesBasePath)}
              sx={{ height: 40, px: 2.5, borderRadius: '8px', fontWeight: 600 }}
            >
              Go to Tables
            </ActionButton>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: '20px',
              pb: 2,
            }}
          >
            {filteredTables.length === 0 ? (
              <Typography
                sx={{
                  gridColumn: '1 / -1',
                  color: 'text.secondary',
                  py: 6,
                  textAlign: 'center',
                }}
              >
                No tables match this search or filter.
              </Typography>
            ) : null}
            {filteredTables.map((table) => (
              <PosFloorTableCard
                key={table.id}
                table={table}
                isSelected={selectedTableId === table.id}
                onClick={handleTableClick}
              />
            ))}
          </Box>
        )}
      </Box>

      <ReservationDialog
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onConfirm={handleConfirmReservation}
        title={selectedTable ? `Reserve Table ${selectedTable.name}` : 'Reserve a Table'}
        initialData={{ guestCount: selectedTable?.guests || 2 }}
      />

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
