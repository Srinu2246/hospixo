'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Plus } from 'lucide-react';

import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { CalendarPicker } from '@/components/shared/form-fields/CalendarPicker';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { ReservationDialog, type NewReservationFormData } from './ReservationDialog';
import { ReservationCancelDialog } from './ReservationCancelDialog';
import { colors } from '@/lib/theme/mui/colors';
import {
  MOCK_RESERVATIONS,
  RESERVATION_STATUS_OPTIONS,
  RESERVATION_SECTION_OPTIONS,
  type ReservationItem,
  type ReservationStatus,
} from '@/lib/mocks/pos/usePosReservations.mocks';

export function ReservationList() {
  const router = useRouter();
  const pathname = usePathname();

  // State management
  const [reservations, setReservations] = useState<ReservationItem[]>(MOCK_RESERVATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2024-10-12'));
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // New Reservation Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cancel reservation confirmation modal state
  const [reservationToCancel, setReservationToCancel] = useState<ReservationItem | null>(null);

  // Open cancel confirmation modal
  const handleOpenCancelModal = (reservation: ReservationItem) => {
    setReservationToCancel(reservation);
  };

  // Confirm cancel reservation
  const handleConfirmCancelReservation = () => {
    if (!reservationToCancel) return;
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationToCancel.id
          ? { ...res, status: 'cancelled' as ReservationStatus }
          : res,
      ),
    );
    setReservationToCancel(null);
  };

  // Create new reservation from ReservationDialog
  const handleConfirmReservation = (data: NewReservationFormData) => {
    const newReservation: ReservationItem = {
      id: `res-${Date.now()}`,
      time: data.time || '7:00 PM',
      guestName: data.guest,
      guestCount: data.guestCount,
      section: 'Indoor',
      sectionId: 'indoor',
      status: 'confirmed',
      date: '2024-10-12',
      phone: data.phone,
    };

    setReservations((prev) => [newReservation, ...prev]);
  };

  // Filtered reservations based on search query, status, and section
  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.guestName.toLowerCase().includes(query);
        const matchesPhone = item.phone?.toLowerCase().includes(query);
        const matchesTime = item.time.toLowerCase().includes(query);
        const matchesSection = item.section.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesTime && !matchesSection) return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== 'all') {
        if (item.status !== statusFilter) return false;
      }

      // Section filter
      if (sectionFilter && sectionFilter !== 'all') {
        if (item.sectionId !== sectionFilter) return false;
      }

      return true;
    });
  }, [reservations, searchQuery, statusFilter, sectionFilter]);

  // Paginated rows for the current page
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReservations.slice(start, start + pageSize);
  }, [filteredReservations, page, pageSize]);

  // DataGrid Column definitions
  const columns: DataGridColumn<ReservationItem>[] = useMemo(
    () => [
      {
        field: 'time',
        headerName: 'Time',
        width: 110,
        minWidth: 95,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'text.primary' }}>
            {row.time}
          </Typography>
        ),
      },
      {
        field: 'guestName',
        headerName: 'Guest',
        width: 180,
        minWidth: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'text.primary' }}>
            {row.guestName}
          </Typography>
        ),
      },
      {
        field: 'guestCount',
        headerName: 'No.of Guests',
        width: 110,
        minWidth: 95,
        align: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
            {row.guestCount}
          </Typography>
        ),
      },
      {
        field: 'section',
        headerName: 'Section',
        width: 130,
        minWidth: 110,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
            {row.section}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        minWidth: 105,
        sortable: false,
        renderCell: ({ row }) => <StatusChip status={row.status} size="small" />,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        minWidth: 80,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        renderCell: ({ row }) => {
          if (row.status !== 'confirmed') return null;

          return (
            <Button
              variant="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCancelModal(row);
              }}
              sx={{
                color: colors.danger.default,
                fontWeight: 600,
                fontSize: '0.8125rem',
                p: '4px 8px',
                minWidth: 'auto',
                textTransform: 'none',
                borderRadius: '4px',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  textDecoration: 'underline',
                  bgcolor: alpha(colors.danger.default, 0.08),
                },
              }}
            >
              Cancel
            </Button>
          );
        },
      },
    ],
    [],
  );

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
        gap: 2.5,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Header: Title + Subtitle (Fixed at top, flexShrink: 0)       */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ flexShrink: 0 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: '1.5rem',
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Reservations
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.84375rem',
            fontWeight: 500,
            mt: 0.5,
          }}
        >
          Staff-Facing Reservation Console
        </Typography>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Control Toolbar: Search + Calendar + Status + Section + New */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
          <SearchBar
            placeholder="Find a Guest..."
            value={searchQuery}
            onChange={(val: string) => {
              setSearchQuery(val);
              setPage(1);
            }}
            onClear={() => {
              setSearchQuery('');
              setPage(1);
            }}
            showClear
            width={{ xs: '100%', sm: 240, md: 260 }}
          />

          <CalendarPicker
            value={selectedDate}
            onChange={(d) => {
              setSelectedDate(d);
              setPage(1);
            }}
            size="medium"
            minWidth={190}
          />

          <Dropdown
            prefix="Status:"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={RESERVATION_STATUS_OPTIONS}
            minWidth={160}
          />

          <Dropdown
            prefix="Section:"
            value={sectionFilter}
            onChange={(val) => {
              setSectionFilter(val);
              setPage(1);
            }}
            options={RESERVATION_SECTION_OPTIONS}
            minWidth={170}
          />
        </Box>

        {/* Right CTA Button */}
        <ActionButton
          variant="primary"
          size="medium"
          startIcon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            flexShrink: 0,
            px: 2.25,
            height: 38,
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            bgcolor: colors.primary.default,
            boxShadow: `0 2px 8px ${colors.sidebar.activeGlow}`,
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          New Reservation
        </ActionButton>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. DataGrid: Full Height, Sticky Header & Sticky Pagination    */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <DataGrid<ReservationItem>
          columns={columns}
          rows={paginatedRows}
          totalRows={filteredReservations.length}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          paginationEntityName="reservations"
          stickyHeader
          height="100%"
          rowHeight={64}
          onRowClick={(row) => {
            const basePath = pathname
              ? pathname.replace(/\/+$/, '')
              : '/pos/point-of-sale/reservation';
            router.push(`${basePath}/${row.id}`);
          }}
          emptyTitle="No reservation yet"
          emptySubtitle="There are no reservations matching your current search or filter criteria."
          sx={{
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
          }}
          tableSx={{
            '& th:first-of-type, & td:first-of-type': {
              pl: 3.5,
            },
            '& th:last-of-type, & td:last-of-type': {
              pr: 3.5,
            },
          }}
        />
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 4. New Reservation Dialog                                      */}
      {/* ------------------------------------------------------------- */}
      <ReservationDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReservation}
      />

      {/* ------------------------------------------------------------- */}
      {/* 5. Cancel Reservation Confirmation Dialog                      */}
      {/* ------------------------------------------------------------- */}
      <ReservationCancelDialog
        open={Boolean(reservationToCancel)}
        onClose={() => setReservationToCancel(null)}
        onConfirm={handleConfirmCancelReservation}
        reservationId={reservationToCancel?.id}
        guestName={reservationToCancel?.guestName}
        dateOrTime={reservationToCancel?.time}
      />
    </Box>
  );
}

export default ReservationList;
