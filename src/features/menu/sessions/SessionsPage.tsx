'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Plus, Search } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import {
  MOCK_SESSIONS,
  SESSION_STATUS_FILTER_OPTIONS,
  type SessionStatusFilter,
} from '@/lib/mocks/menu/useSessions.mocks';
import type { SessionFormValues, SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useThemeStore } from '@/stores/themeStore';
import { useToastStore } from '@/stores/toastStore';

import { DeleteSessionModal } from './DeleteSessionModal';
import { SessionCard } from './SessionCard';
import { SessionForm } from './SessionForm';

export interface SessionsPageProps {
  initialMode?: 'list' | 'create' | 'edit';
  initialSessionId?: string;
  basePath?: string;
}

/**
 * Meal sessions management page implementing:
 * - Image 1: Sessions list, search, status filter, and 3-column card grid.
 * - Image 2: Create & Edit session flow.
 */
function sessionsBasePathFromPathname(pathname: string): string {
  const marker = '/menu/sessions';
  const idx = pathname.indexOf(marker);
  if (idx >= 0) return pathname.slice(0, idx + marker.length);
  return '/branch-manager/menu/sessions';
}

export function SessionsPage({
  initialMode = 'list',
  initialSessionId,
  basePath: basePathProp,
}: Readonly<SessionsPageProps>) {
  const pathname = usePathname();
  const showToast = useToastStore((state) => state.show);
  const themeMode = useThemeStore((state) => state.mode);
  const isDark = themeMode === 'dark';
  const textPrimary = isDark ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = isDark ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = isDark ? colors.surface.dark : colors.surface.default;
  const surfaceMuted = isDark ? colors.surface.darkMuted : colors.background.default;
  const borderColor = isDark ? colors.border.dark : colors.border.default;
  const fieldBorder = isDark ? colors.border.dark : colors.border.default;
  const basePath = basePathProp ?? sessionsBasePathFromPathname(pathname);

  // Determine mode from pathname or initialMode
  const currentMode = useMemo<'list' | 'create' | 'edit'>(() => {
    if (pathname.endsWith('/create')) return 'create';
    if (pathname.endsWith('/edit')) return 'edit';
    return initialMode;
  }, [pathname, initialMode]);

  // Extract ID from URL if applicable
  const targetSessionId = useMemo<string | undefined>(() => {
    if (initialSessionId) return initialSessionId;
    const match = pathname.match(/\/sessions\/([^/]+)\/edit/);
    return match ? match[1] : undefined;
  }, [pathname, initialSessionId]);

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>(currentMode);
  const [sessions, setSessions] = useState<SessionRecord[]>(MOCK_SESSIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>('all');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(targetSessionId);
  const [deletingSession, setDeletingSession] = useState<SessionRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Active session for edit mode
  const activeSession = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find((s) => s.id === activeSessionId) ?? null;
  }, [activeSessionId, sessions]);

  // Filtered list
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (statusFilter !== 'all' && session.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = session.name.toLowerCase().includes(query);
        const matchesTimes =
          session.startTime.toLowerCase().includes(query) ||
          session.endTime.toLowerCase().includes(query);
        if (!matchesName && !matchesTimes) return false;
      }
      return true;
    });
  }, [sessions, statusFilter, search]);

  const handleOpenCreate = () => {
    setActiveSessionId(undefined);
    setMode('create');
    window.history.pushState({}, '', `${basePath}/create`);
  };

  const handleOpenEdit = (session: SessionRecord) => {
    setActiveSessionId(session.id);
    setMode('edit');
    window.history.pushState({}, '', `${basePath}/${session.id}/edit`);
  };

  const handleCancelForm = () => {
    setMode('list');
    setActiveSessionId(undefined);
    window.history.pushState({}, '', basePath);
  };

  const handleFormSubmit = async (values: SessionFormValues) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (mode === 'edit' && activeSession) {
      setSessions((prev) =>
        prev.map((item) =>
          item.id === activeSession.id
            ? {
                ...item,
                name: values.name,
                startTime: values.startTime,
                endTime: values.endTime,
                status: values.status,
                updatedAt: 'Updated just now',
              }
            : item,
        ),
      );
      showToast(`Updated "${values.name}" session`, 'success');
    } else {
      const newSession: SessionRecord = {
        id: `session-${Date.now()}`,
        name: values.name,
        startTime: values.startTime,
        endTime: values.endTime,
        status: values.status,
        updatedAt: 'Updated just now',
      };
      setSessions((prev) => [newSession, ...prev]);
      showToast(`Created "${values.name}" session`, 'success');
    }

    setSubmitting(false);
    handleCancelForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSession) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setSessions((prev) => prev.filter((item) => item.id !== deletingSession.id));
    showToast(`Deleted "${deletingSession.name}" session`, 'success');
    setSubmitting(false);
    setDeletingSession(null);
  };

  // Render Edit or Create form view (Image 2)
  if (mode === 'create' || mode === 'edit') {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '100%',
          bgcolor: 'background.default',
        }}
      >
        <SessionForm
          mode={mode}
          sessionsBasePath={basePath}
          initialSession={activeSession}
          onCancel={handleCancelForm}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      </Box>
    );
  }

  // Render List view (Image 1)
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        boxSizing: 'border-box',
      }}
    >
      {/* Header: Title, Description, and Create Button */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              color: textPrimary,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Sessions
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              color: textSecondary,
              fontSize: '0.9375rem',
            }}
          >
            Define meal sessions and control availability by time of day.
          </Typography>
        </Box>

        <ActionButton
          variant="primary"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreate}
          sx={{
            flexShrink: 0,
            borderRadius: '8px',
            bgcolor: colors.primary.default,
            px: 2.5,
            py: 1.2,
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          Create Session
        </ActionButton>
      </Stack>

      {/* Filter Card: Search input & Status dropdown */}
      <Box
        sx={{
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          alignItems: 'center',
          boxShadow: isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions..."
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={textSecondary} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: surfaceMuted,
              color: textPrimary,
              fontSize: '0.875rem',
              '& fieldset': { borderColor: fieldBorder },
              '&:hover fieldset': { borderColor: textSecondary },
              '&.Mui-focused fieldset': { borderColor: colors.primary.default },
            },
          }}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SessionStatusFilter)}
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            borderRadius: '8px',
            bgcolor: surfaceBg,
            fontSize: '0.875rem',
            color: textPrimary,
            '& fieldset': { borderColor: fieldBorder },
            '&:hover fieldset': { borderColor: textSecondary },
            '&.Mui-focused fieldset': { borderColor: colors.primary.default },
          }}
          renderValue={(selected) => (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography
                component="span"
                sx={{ color: textSecondary, mr: 0.5, fontSize: '0.875rem' }}
              >
                Status:
              </Typography>
              <Typography component="span" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {SESSION_STATUS_FILTER_OPTIONS.find((opt) => opt.id === selected)?.label || 'All'}
              </Typography>
            </Box>
          )}
        >
          {SESSION_STATUS_FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.875rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <AlertMessage
          variant="info"
          title="No sessions found"
          message={
            search || statusFilter !== 'all'
              ? 'No meal sessions match your search or filter criteria.'
              : 'No sessions defined yet. Click "Create Session" to add your first meal session.'
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2.5,
          }}
        >
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={handleOpenEdit}
              onDelete={setDeletingSession}
            />
          ))}
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteSessionModal
        open={Boolean(deletingSession)}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleDeleteConfirm}
        session={deletingSession}
        loading={submitting}
      />
    </Box>
  );
}
