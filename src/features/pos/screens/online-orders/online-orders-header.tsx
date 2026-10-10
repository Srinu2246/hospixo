'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bell } from 'lucide-react';

import type { OnlineOrderChannel } from '@/features/pos/config/online-orders';
import { onlineOrdersChannels, onlineOrdersPageMeta } from '@/features/pos/config/online-orders';

interface OnlineOrdersHeaderProps {
  activeChannel: OnlineOrderChannel;
  onChannelChange: (channel: OnlineOrderChannel) => void;
  totalOrdersCount: number;
  pendingCount: number;
  /** Hide page title/subtitle — used when PosMobileHeader is shown. */
  hideTitle?: boolean;
}

export function OnlineOrdersHeader({
  activeChannel,
  onChannelChange,
  totalOrdersCount,
  pendingCount,
  hideTitle = false,
}: Readonly<OnlineOrdersHeaderProps>) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={{ xs: 2, lg: 2.5 }}
      sx={{
        alignItems: { xs: 'stretch', lg: 'flex-start' },
        justifyContent: 'space-between',
        mb: hideTitle ? 1.5 : 2,
      }}
    >
      <Stack spacing={2} sx={{ minWidth: 0 }}>
        {!hideTitle ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, lineHeight: 1.1 }}
              >
                {onlineOrdersPageMeta.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {onlineOrdersPageMeta.subtitle}
              </Typography>
            </Box>
            <Tooltip title="Order alerts">
              <IconButton
                aria-label="Alerts"
                size="small"
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  border: 1,
                  borderColor: 'var(--pos-border-strong)',
                  borderRadius: 'var(--pos-radius-sm)',
                  bgcolor: 'var(--pos-surface)',
                  color: 'text.primary',
                }}
              >
                <Bell size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null}

        <Stack
          component="div"
          direction="row"
          role="tablist"
          aria-label="Order channels"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          {onlineOrdersChannels.map((channel) => {
            const active = channel.id === activeChannel;
            return (
              <Button
                key={channel.id}
                role="tab"
                aria-selected={active}
                onClick={() => onChannelChange(channel.id)}
                variant={active ? 'contained' : 'outlined'}
                sx={{
                  minHeight: 38,
                  px: 1.75,
                  borderColor: active ? '#18181b' : 'var(--pos-border-strong)',
                  borderRadius: 'var(--pos-radius-sm)',
                  bgcolor: active ? '#18181b' : 'var(--pos-surface)',
                  color: active ? '#fff' : 'var(--pos-text-muted)',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#18181b',
                    bgcolor: active ? '#27272a' : 'action.hover',
                  },
                }}
              >
                {channel.label}
              </Button>
            );
          })}
        </Stack>
      </Stack>

      {!hideTitle ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            flexWrap: 'wrap',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: { xs: 'flex-start', lg: 'flex-end' },
            gap: { xs: 1, sm: 2.5 },
            maxWidth: { lg: 420 },
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--pos-primary)' }}>
            {onlineOrdersPageMeta.totalOrdersLabel} <strong>{totalOrdersCount}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--pos-danger)', fontWeight: 600 }}>
            {pendingCount} {onlineOrdersPageMeta.pendingLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {onlineOrdersPageMeta.syncedLabel}
          </Typography>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 32,
              px: 1.5,
              borderRadius: 999,
              bgcolor: '#d1fae5',
              color: '#022c22',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Box
              component="span"
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--pos-success)' }}
            />
            {onlineOrdersPageMeta.onlineLabel}
          </Box>
        </Stack>
      ) : null}
    </Stack>
  );
}
