'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Pencil, Trash2 } from 'lucide-react';

import { StatusChip } from '@/components/shared/ui/StatusChip';
import { formatSessionNameLabel } from '@/lib/helpers/mealSessionMapper';
import type { SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useThemeStore } from '@/stores/themeStore';

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
  const mode = useThemeStore((state) => state.mode);
  const isDark = mode === 'dark';
  const textPrimary = isDark ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = isDark ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = isDark ? colors.surface.dark : colors.surface.default;
  const borderColor = isDark ? colors.border.dark : colors.border.default;
  const dividerColor = isDark ? colors.divider.dark : colors.divider.default;
  const isActive = session.status === 'active';

  return (
    <Box
      sx={{
        bgcolor: surfaceBg,
        border: '1px solid',
        borderColor,
        borderRadius: '14px',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.06)',
          borderColor: isDark ? colors.border.darkSubtle : colors.border.dark,
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            lineHeight: 1.25,
            color: textPrimary,
            letterSpacing: '-0.01em',
          }}
        >
          {formatSessionNameLabel(session.name)}
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
            bgcolor: isActive
              ? alpha(colors.success.default, isDark ? 0.18 : 0.14)
              : isDark
                ? colors.surface.darkMuted
                : colors.surface.muted,
            color: isActive ? (isDark ? colors.success.light : colors.success.dark) : textSecondary,
          }}
        />
      </Stack>

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
              color: textSecondary,
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
              color: textPrimary,
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
              color: textSecondary,
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
              color: textPrimary,
            }}
          >
            {session.endTime}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: dividerColor, my: 0.5 }} />

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
            color: textSecondary,
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
              color: colors.primary.default,
              p: 0.75,
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: alpha(colors.primary.default, isDark ? 0.16 : 0.08),
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
              color: colors.danger.default,
              p: 0.75,
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: alpha(colors.danger.default, isDark ? 0.16 : 0.08),
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
