'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Typography, Stack, Divider } from '@mui/material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { Plus, ChevronDown } from 'lucide-react';

import { FilterBar } from '@/components/shared/form-fields/FilterBar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { FilterChips } from '@/components/shared/form-fields/FilterChips';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { Toast } from '@/components/shared/ui/Toast';
import {
  ReservationDialog,
  type NewReservationFormData,
} from '@/features/pos/point-of-sale/reservation/ReservationDialog';
import { usePosFloorLayout } from '@/lib/hooks/pos/point-of-sale/tables/usePosFloorLayout';
import {
  DINE_IN_STATUS_FILTERS,
  DINE_IN_TABLE_STATUSES,
  POS_FLOOR_TABS,
  POS_SECTIONS,
  POS_STATUS_FILTERS,
  POS_TABLES_DATA,
  type PosTableItem,
  type PosTableStatus,
} from '@/lib/mocks/pos/usePosTables.mocks';
import type { CartItem } from '@/lib/mocks/pos/usePosMenu.mocks';
import { colors } from '@/lib/theme/mui/colors';
import { TakeawayPage } from '@/features/pos/point-of-sale/takeaway/TakeawayPage';
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

export interface PosTableSelectionProps {
  isDineIn?: boolean;
  onTableSelect?: (table: PosTableItem) => void;
  initialSelectedTableId?: string;
  initialTableId?: string;
}

export function PosTableSelection({
  isDineIn = false,
  onTableSelect,
  initialSelectedTableId = 't-4',
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

  const [tables, setTables] = useState<PosTableItem[]>(POS_TABLES_DATA);
  const [activeFloor, setActiveFloor] = useState(POS_FLOOR_TABS[0]?.id ?? '');
  const [activeSection, setActiveSection] = useState(POS_SECTIONS[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTableId, setSelectedTableId] = useState<string>(initialSelectedTableId);
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

  const sectionOptions = useMemo(() => {
    const selected = floors.find((floor) => String(floor.id) === activeFloor);
    if (selected?.sections.length) {
      return selected.sections.map((section) => ({
        id: String(section.id),
        label: section.name,
      }));
    }
    if (floors.length === 0) return POS_SECTIONS;
    return [];
  }, [floors, activeFloor]);

  // Keep floor / section selection in sync with the floors API payload.
  useEffect(() => {
    if (floorTabs.length === 0) return;
    const floorStillValid = floorTabs.some((tab) => tab.id === activeFloor);
    if (!floorStillValid) {
      setActiveFloor(floorTabs[0].id);
    }
  }, [floorTabs, activeFloor]);

  useEffect(() => {
    if (sectionOptions.length === 0) return;
    const sectionStillValid = sectionOptions.some((option) => option.id === activeSection);
    if (!sectionStillValid) {
      setActiveSection(sectionOptions[0].id);
    }
  }, [sectionOptions, activeSection]);

  // Reservation confirmation handler
  const handleConfirmReservation = (data: NewReservationFormData) => {
    // Find target table: current selectedTable if available/not occupied, otherwise first available table
    const targetTable =
      (selectedTable && selectedTable.status !== 'occupied' ? selectedTable : null) ||
      tables.find((t) => t.status === 'available');

    if (targetTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === targetTable.id
            ? {
                ...t,
                status: 'reserved',
                guests: data.guestCount,
                time: data.time,
                message: `Reserved: ${data.guest}`,
                waiter: data.guest,
              }
            : t,
        ),
      );
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

  // Order URLs live under dine-in/[tableId] so refresh keeps the menu.
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

  /**
   * POS Tables → /dine-in/[tableId]?from=tables (refresh-safe, Send to KOT).
   * Dine In → /dine-in/[tableId] (Serve).
   * Captain → menu in place (no dine-in route).
   */
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

  // Serve items order handler for active table
  const handleServeOrder = (servedTable: PosTableItem, items: CartItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    setTables((prev) =>
      prev.map((t) =>
        t.id === servedTable.id
          ? {
              ...t,
              status: 'occupied',
              amount: `Rs ${totalAmount.toLocaleString('en-IN')}`,
              time: 'Just now',
              guests: t.guests ?? 2,
              waiter: t.waiter ?? 'Server 1',
            }
          : t,
      ),
    );
  };

  // Dine-in pool: reserved / occupied / billing only (before search & chip filters)
  const dineInEligibleTables = useMemo(() => {
    if (!isDineIn) return tables;
    return tables.filter((table) => {
      if (!isDineInActiveStatus(table.status)) return false;
      if (activeFloor && table.floorId !== activeFloor) return false;
      if (sectionOptions.length > 0 && activeSection && table.sectionId !== activeSection) {
        return false;
      }
      return true;
    });
  }, [isDineIn, tables, activeFloor, activeSection, sectionOptions.length]);

  // Filter tables based on search, floor, section, and status filter
  const filteredTables = useMemo(() => {
    const source = isDineIn ? dineInEligibleTables : tables;
    return source.filter((table) => {
      if (!isDineIn) {
        if (activeFloor && table.floorId !== activeFloor) return false;
        if (sectionOptions.length > 0 && activeSection && table.sectionId !== activeSection) {
          return false;
        }
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
    sectionOptions.length,
    statusFilter,
    searchQuery,
  ]);

  const hasNoDineInTables = isDineIn && dineInEligibleTables.length === 0;

  // Find currently selected table object
  const selectedTable: PosTableItem | undefined = useMemo(() => {
    const match = tables.find((t) => t.id === selectedTableId);
    if (!match) return undefined;
    if (isDineIn && !isDineInActiveStatus(match.status)) return undefined;
    return match;
  }, [tables, selectedTableId, isDineIn]);

  // Routed dine-in/[tableId] always opens the menu (incl. Tables → available tables).
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
      {/* ------------------------------------------------------------------ */}
      {/* 1. Top Section: Header & Filters (Fixed at top, flexShrink: 0)     */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Row 1: Title + Floor Tabs + Section Dropdown + Action */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Left: Title + Floor FilterBar + Section Dropdown */}
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
              onChange={(val) => setActiveFloor(val)}
              variant="segmented"
              size="medium"
            />

            {sectionOptions.length > 0 ? (
              <Dropdown
                size="medium"
                value={activeSection}
                onChange={(val) => setActiveSection(val)}
                options={sectionOptions}
                disabled={floorsQuery.isLoading}
                sx={{
                  height: 40,
                  minWidth: 125,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              />
            ) : null}
          </Box>

          {/* Reservation stays on the Tables floor plan, not Dine In */}
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
                : 'The floors and sections request failed.'
            }
          />
        ) : null}

        {/* Row 2: SearchBar + FilterChips + Status Legend */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Left: SearchBar + FilterChips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            <SearchBar
              placeholder="Find a table..."
              value={searchQuery}
              onChange={(val: string) => setSearchQuery(val)}
              onClear={() => setSearchQuery('')}
              showClear
              width={{ xs: '100%', sm: 260 }}
              sx={{ height: 40 }}
            />

            <FilterChips
              items={isDineIn ? DINE_IN_STATUS_FILTERS : POS_STATUS_FILTERS}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
          </Box>

          {/* Right: Status Color Legend */}
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

      {/* ------------------------------------------------------------------ */}
      {/* 2. Middle Section: Scrollable Tables Grid (Only this area scrolls) */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 0.5,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : colors.gray.light,
            borderRadius: 3,
          },
        }}
      >
        {hasNoDineInTables ? (
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

      {/* ------------------------------------------------------------------ */}
      {/* 3. Bottom Section: Selected Table Action Bar (Fixed at bottom)     */}
      {/* ------------------------------------------------------------------ */}
      {selectedTable && !hasNoDineInTables ? (
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: (theme) => theme.palette.background.paper,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            px: { xs: 2, sm: 3 },
            py: 1.5,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 -4px 20px rgba(0, 0, 0, 0.5)'
                : '0 4px 20px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Details: Selected Table, Guests, Waiter, Running, Open For */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5, flexWrap: 'wrap' }}>
            {/* Selected Table Name & Status */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 0.25,
                }}
              >
                SELECTED TABLE
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary' }}>
                  {selectedTable.name}
                </Typography>
                <StatusChip
                  status={selectedTable.status}
                  label={selectedTable.status.toUpperCase()}
                  showDot
                  size="small"
                />
              </Box>
            </Box>

            {/* Guests */}
            {selectedTable.guests !== undefined && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.25,
                  }}
                >
                  GUESTS
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography
                    sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}
                  >
                    {selectedTable.guests}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Waiter */}
            {selectedTable.waiter && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.25,
                  }}
                >
                  WAITER
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography
                    sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}
                  >
                    {selectedTable.waiter}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Running Bill */}
            {selectedTable.amount && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.25,
                  }}
                >
                  RUNNING
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography
                    sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}
                  >
                    {selectedTable.amount}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Open For */}
            {selectedTable.time && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.25,
                  }}
                >
                  OPEN FOR
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography
                    sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}
                  >
                    {selectedTable.time.includes('min')
                      ? selectedTable.time
                      : `${selectedTable.time} min`}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Right Action Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <ActionButton
              variant="primary"
              size="medium"
              startIcon={<Plus size={18} />}
              onClick={() => {
                if (selectedTable) handleOpenTableMenu(selectedTable);
              }}
              sx={{
                height: 40,
                px: 2.25,
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Add Items
            </ActionButton>

            {!isDineIn && selectedTable.status === 'available' ? (
              <ActionButton
                variant="outlined"
                size="medium"
                onClick={() => setIsReservationOpen(true)}
                sx={{
                  height: 40,
                  px: 2,
                  borderRadius: '8px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                Reserve
              </ActionButton>
            ) : null}

            <ActionButton
              variant="outlined"
              size="medium"
              endIcon={<ChevronDown size={16} />}
              sx={{
                height: 40,
                px: 2,
                borderRadius: '8px',
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              Transfer
            </ActionButton>

            <ActionButton
              variant="outlined"
              size="medium"
              sx={{
                height: 40,
                px: 2,
                borderRadius: '8px',
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              Merge
            </ActionButton>

            <ActionButton
              variant="outlined"
              size="medium"
              sx={{
                height: 40,
                px: 2.25,
                borderRadius: '8px',
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              Generate Bill
            </ActionButton>
          </Stack>
        </Box>
      ) : null}

      {/* Table Reservation Dialog Modal */}
      <ReservationDialog
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onConfirm={handleConfirmReservation}
        title={selectedTable ? `Reserve Table ${selectedTable.name}` : 'Reserve a Table'}
        initialData={{ guestCount: selectedTable?.guests || 2 }}
      />

      {/* Global Notification Toast */}
      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}

export default PosTableSelection;
