'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Plus, Search } from 'lucide-react';

import { menusCopy } from '../config/copy';
import { useMenus } from '../context/menus-context';
import { useMenusRoutes } from '../context/menus-routes-context';
import { formatUpdatedAt } from '../lib/format';
import type { MenuSessionStatus } from '../types/menus';
import { MenusBreadcrumb } from './menus-breadcrumb';
import { MenusListSkeleton } from './skeleton/menus-skeletons';

export function MenusListPage() {
  const { ready, sessions, setStatus, ensureSessions, loadDetail, error } = useMenus();
  const menusRoutes = useMenusRoutes();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MenuSessionStatus>('all');

  useEffect(() => {
    void ensureSessions();
  }, [ensureSessions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesQuery =
        !needle ||
        session.name.toLowerCase().includes(needle) ||
        session.code.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, sessions, statusFilter]);

  if (!ready) return <MenusListSkeleton />;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <MenusBreadcrumb current={menusCopy.crumbMenus} showMenusLink={false} />

      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
            {menusCopy.listTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {menusCopy.listSubtitle}
          </Typography>
        </Box>
        <Button
          component={Link}
          href={menusRoutes.create}
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 2.5 }}
        >
          {menusCopy.createButton}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder={menusCopy.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | MenuSessionStatus)}
            sx={{ height: 40, borderRadius: '8px' }}
          >
            <MenuItem value="all">{menusCopy.statusAll}</MenuItem>
            <MenuItem value="active">Status: Active</MenuItem>
            <MenuItem value="inactive">Status: Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select defaultValue="any" sx={{ height: 40, borderRadius: '8px' }}>
            <MenuItem value="any">{menusCopy.daysAny}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filtered.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', borderRadius: '12px' }}
        >
          <Typography variant="body1" color="text.secondary">
            No sessions match the current filters.
          </Typography>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {filtered.map((session) => (
            <Card
              key={session.id}
              variant="outlined"
              sx={{
                p: '1.15rem 1.2rem 1rem',
                borderRadius: '12px',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', m: 0 }}>
                  {session.name}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.85,
                    py: 0.25,
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor:
                      session.status === 'active' ? 'rgba(22, 163, 74, 0.12)' : 'action.hover',
                    color: session.status === 'active' ? '#16a34a' : 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  {session.status === 'active' ? 'Active' : 'Inactive'}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'text.secondary',
                  }}
                >
                  {menusCopy.menuTypePrefix}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.75,
                    py: 0.2,
                    borderRadius: '999px',
                    bgcolor: 'rgba(37, 99, 235, 0.12)',
                    color: 'primary.main',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {session.menuType.toUpperCase()}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  flexWrap: 'wrap',
                  mt: 'auto',
                  pt: 0.5,
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {formatUpdatedAt(session.updatedAt)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    component={Link}
                    href={menusRoutes.detail(session.id)}
                    onMouseEnter={() => {
                      void loadDetail(session.id);
                    }}
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {menusCopy.view}
                  </Typography>
                  <Typography
                    component={Link}
                    href={menusRoutes.edit(session.id)}
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {menusCopy.edit}
                  </Typography>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      void setStatus(
                        session.id,
                        session.status === 'active' ? 'inactive' : 'active',
                      );
                    }}
                    sx={{
                      border: 'none',
                      background: 'none',
                      p: 0,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: session.status === 'active' ? 'error.main' : 'primary.main',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {session.status === 'active' ? menusCopy.deactivate : menusCopy.activate}
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
