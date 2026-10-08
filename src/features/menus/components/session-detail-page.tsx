'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { CalendarDays, Pencil, Plus, Search, X } from 'lucide-react';

import { menusCopy } from '../config/copy';
import { menusRoutes } from '../config/paths';
import { useMenus } from '../context/menus-context';
import { formatPrice } from '../lib/format';
import type { MenuCatalogItem } from '../types/menus';
import { AssignItemsModal } from './assign-items-modal';
import { MenusBreadcrumb } from './menus-breadcrumb';
import { AssignedItemsTableSkeleton, SessionDetailSkeleton } from './skeleton/menus-skeletons';

const PAGE_SIZE = 10;

function ItemThumb({ item }: { item: MenuCatalogItem }) {
  const [broken, setBroken] = useState(false);

  if (item.image && !broken) {
    return (
      <Avatar
        src={item.image}
        variant="rounded"
        sx={{ width: 44, height: 44 }}
        slotProps={{ img: { onError: () => setBroken(true) } }}
      />
    );
  }

  return (
    <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'action.hover' }}>
      {item.name.charAt(0)}
    </Avatar>
  );
}

export function SessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = decodeURIComponent(params?.sessionId ?? '');
  const { getSession, setStatus, assignCategories, unassignCategory, loadDetail, assignedItems } =
    useMenus();
  const session = getSession(sessionId);
  const isLoaded = Boolean(session && assignedItems.length > 0);
  const [detailLoaded, setDetailLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadDetail(sessionId).then(() => {
      if (!cancelled) setDetailLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loadDetail, sessionId]);

  const detailReady = isLoaded || detailLoaded;

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of assignedItems) {
      counts.set(item.categoryName, (counts.get(item.categoryName) ?? 0) + 1);
    }
    return counts;
  }, [assignedItems]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assignedItems.filter((item) => {
      const matchesQuery = !needle || item.name.toLowerCase().includes(needle);
      const matchesCategory = category === 'all' || item.categoryName === category;
      return matchesQuery && matchesCategory;
    });
  }, [assignedItems, category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);

  if (!detailReady && !session) {
    return <SessionDetailSkeleton current={menusCopy.crumbMenus} />;
  }

  if (detailReady && !session) {
    return (
      <Box sx={{ width: '100%', p: 0 }}>
        <MenusBreadcrumb current={menusCopy.crumbMenus} />
        <Card variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', my: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {menusCopy.notFound}
          </Typography>
          <Button component={Link} href={menusRoutes.root} variant="outlined">
            {menusCopy.backToMenus}
          </Button>
        </Card>
      </Box>
    );
  }

  if (!session) return <SessionDetailSkeleton current={menusCopy.crumbMenus} />;

  const chips = ['all', ...Array.from(categoryCounts.keys())];
  const scheduleLabel =
    session.startTime && session.endTime
      ? `${session.startTime} – ${session.endTime}`
      : session.menuType;
  const extraLabel = session.daysLabel || session.code;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <MenusBreadcrumb current={session.name} />

      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
            {session.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {scheduleLabel} <span aria-hidden>|</span> {extraLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component={Link}
            href={menusRoutes.edit(session.id)}
            variant="outlined"
            startIcon={<Pencil size={15} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Edit Session
          </Button>
          <Button
            variant="outlined"
            color={session.status === 'active' ? 'error' : 'primary'}
            onClick={() => {
              void setStatus(session.id, session.status === 'active' ? 'inactive' : 'active');
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {session.status === 'active' ? menusCopy.deactivate : menusCopy.activate}
          </Button>
        </Box>
      </Box>

      <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {menusCopy.assignedTitle}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder={menusCopy.searchItems}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              sx={{ width: 240 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={15} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setAssignOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {menusCopy.assignItems}
            </Button>
          </Box>
        </Box>

        {!detailReady ? (
          <AssignedItemsTableSkeleton />
        ) : assignedItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'action.hover', color: 'text.secondary' }}>
              <CalendarDays size={22} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {menusCopy.emptyTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {menusCopy.emptyBody}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setAssignOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {menusCopy.assignItems}
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
              {chips.map((chip) => {
                const count =
                  chip === 'all' ? assignedItems.length : (categoryCounts.get(chip) ?? 0);
                const label = chip === 'all' ? menusCopy.allChip : chip;
                const active = category === chip;
                return (
                  <Chip
                    key={chip}
                    label={`${label} (${count})`}
                    variant={active ? 'filled' : 'outlined'}
                    color={active ? 'primary' : 'default'}
                    onClick={() => {
                      setCategory(chip);
                      setPage(1);
                    }}
                    onDelete={
                      chip !== 'all'
                        ? async () => {
                            const targetItem = assignedItems.find(
                              (item) => item.categoryName === chip,
                            );
                            if (targetItem) {
                              await unassignCategory(session.id, targetItem.categoryId);
                              if (category === chip) {
                                setCategory('all');
                                setPage(1);
                              }
                            }
                          }
                        : undefined
                    }
                    deleteIcon={chip !== 'all' ? <X size={14} /> : undefined}
                    sx={{ fontWeight: 500, cursor: 'pointer' }}
                  />
                );
              })}
            </Box>

            <TableContainer
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 64 }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Base Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dietary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Order Types</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <ItemThumb item={item} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                      <TableCell>
                        <Chip label={item.categoryName} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{formatPrice(item.basePrice)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.dietary}
                          size="small"
                          color={item.dietary === 'Veg' ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ fontSize: '0.72rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {item.orderTypesLabel || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                {menusCopy.showing(start, end, filtered.length)}
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, newPage) => setPage(newPage)}
                size="small"
                color="primary"
              />
            </Box>
          </>
        )}
      </Card>

      <AssignItemsModal
        session={session}
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onAssign={(categoryIds) => assignCategories(session.id, categoryIds)}
      />
    </Box>
  );
}
