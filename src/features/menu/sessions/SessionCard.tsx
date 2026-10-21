'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Pencil, Trash2 } from 'lucide-react';

import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface SessionCardProps {
  session: SessionRecord;
  onEdit: (session: SessionRecord) => void;
  onDelete: (session: SessionRecord) => void;
}

/**
 * Meal session card displaying session title, status chip, start/end times,
 * relative updated timestamp, and edit/delete action buttons.
 */
export function SessionCard({ session, onEdit, onDelete }: Readonly<SessionCardProps>) {
  const isActive = session.status === 'active';

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: '#E5E7EB',
        borderRadius: '14px',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          borderColor: '#D1D5DB',
        },
      }}
    >
      {/* Top Header: Title & Status Badge */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            lineHeight: 1.25,
            color: '#111827',
            letterSpacing: '-0.01em',
          }}
        >
          {session.name}
        </Typography>

        <StatusChip
          label={isActive ? 'Active' : 'Inactive'}
          variantType={isActive ? 'success' : 'default'}
          pill
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            px: 1,
            bgcolor: isActive ? '#DCFCE7' : '#F3F4F6',
            color: isActive ? '#15803D' : '#6B7280',
          }}
        />
      </Stack>

      {/* Middle: Start Time & End Time */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#6B7280',
              fontSize: '0.8125rem',
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            Start time
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#111827',
            }}
          >
            {session.startTime}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#6B7280',
              fontSize: '0.8125rem',
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            End time
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#111827',
            }}
          >
            {session.endTime}
          </Typography>
        </Box>
      </Box>

      {/* Subtle Divider */}
      <Divider sx={{ borderColor: '#F3F4F6', my: 0.5 }} />

      {/* Footer: Updated Timestamp & Action Icons */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#6B7280',
            fontSize: '0.8125rem',
            fontWeight: 400,
          }}
        >
          {session.updatedAt}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            aria-label={`Edit ${session.name}`}
            onClick={() => onEdit(session)}
            sx={{
              color: colors.primary.default || '#2563EB',
              p: 0.75,
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(37, 99, 235, 0.08)',
              },
            }}
          >
            <Pencil size={18} />
          </IconButton>

          <IconButton
            size="small"
            aria-label={`Delete ${session.name}`}
            onClick={() => onDelete(session)}
            sx={{
              color: '#DC2626',
              p: 0.75,
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(220, 38, 38, 0.08)',
              },
            }}
          >
            <Trash2 size={18} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
