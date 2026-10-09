'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { Globe2, LayoutGrid } from 'lucide-react';
import type { MenuChannel, MenuChannelId } from '@/features/pos/types/menu-availability';

type MenuChannelsProps = Readonly<{
  channels: readonly MenuChannel[];
  value: MenuChannelId;
  onChange: (id: MenuChannelId) => void;
}>;

function ChannelIcon({ id }: Readonly<{ id: MenuChannelId }>) {
  if (id === 'all') return <LayoutGrid size={16} aria-hidden="true" />;
  if (id === 'zomato') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 0.6,
          fontSize: '0.625rem',
          fontWeight: 800,
          color: '#fff',
          bgcolor: '#e23744',
        }}
      >
        Z
      </Box>
    );
  }
  if (id === 'swiggy') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 0.6,
          fontSize: '0.625rem',
          fontWeight: 800,
          color: '#fff',
          bgcolor: '#fc8019',
        }}
      >
        S
      </Box>
    );
  }
  if (id === 'fuddo') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: 0.6,
          fontSize: '0.625rem',
          fontWeight: 800,
          color: '#fff',
          bgcolor: '#dc2626',
        }}
      >
        F
      </Box>
    );
  }
  return <Globe2 size={16} aria-hidden="true" />;
}

export function MenuChannels({ channels, value, onChange }: MenuChannelsProps) {
  return (
    <Box
      role="tablist"
      aria-label="Sales channels"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {channels.map((channel, index) => {
        const channelKey =
          channel.id && String(channel.id).trim() && String(channel.id) !== 'undefined'
            ? String(channel.id)
            : `channel-${index}`;
        const active = channel.id === value;
        return (
          <ButtonBase
            key={channelKey}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(channel.id)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.9,
              border: '1px solid',
              borderColor: active ? '#93c5fd' : 'divider',
              bgcolor: active ? '#eff6ff' : 'background.paper',
              color: active ? '#1d4ed8' : 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 600,
              px: 1.5,
              py: 0.9,
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: (theme) =>
                theme.transitions.create(['background-color', 'border-color', 'color']),
              '&:hover': {
                bgcolor: active ? '#eff6ff' : 'action.hover',
              },
            }}
          >
            <ChannelIcon id={channel.id} />
            <span>{channel.label}</span>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
