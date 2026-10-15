'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { Globe, LayoutGrid } from 'lucide-react';

import type {
  AvailabilityChannel,
  AvailabilityItem,
} from '@/lib/schemas/menu/menuAvailabilitySchema';

export interface ChannelSelectorProps {
  channels: readonly AvailabilityChannel[];
  value: string;
  onChange: (channelId: string) => void;
}

function ChannelIcon({ channelId }: Readonly<{ channelId: string }>) {
  if (channelId === 'all') return <LayoutGrid size={16} />;
  if (channelId === 'mayukha-website') return <Globe size={16} />;

  const letter =
    channelId === 'zomato' ? 'Z' : channelId === 'swiggy' ? 'S' : channelId === 'fuddo' ? 'F' : 'Q';

  const bgcolor =
    channelId === 'zomato'
      ? '#E23744'
      : channelId === 'swiggy'
        ? '#FC8019'
        : channelId === 'fuddo'
          ? '#C41E3A'
          : 'primary.main';

  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '4px',
        bgcolor,
        color: 'common.white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.6875rem',
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {letter}
    </Box>
  );
}

export function ChannelSelector({ channels, value, onChange }: Readonly<ChannelSelectorProps>) {
  return (
    <Box
      role="tablist"
      aria-label="Sales channels"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      {channels.map((channel) => {
        const selected = channel.id === value;
        return (
          <ButtonBase
            key={channel.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(channel.id)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.75,
              py: 1,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: selected ? 'primary.main' : 'divider',
              bgcolor: selected ? 'primary.main' : 'background.paper',
              color: selected ? 'primary.contrastText' : 'text.primary',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              '&:hover': {
                bgcolor: selected ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <Box sx={{ display: 'inline-flex', color: 'inherit', opacity: selected ? 1 : 0.85 }}>
              <ChannelIcon channelId={channel.id} />
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'inherit', whiteSpace: 'nowrap' }}
            >
              {channel.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export interface DietaryMarkerProps {
  dietary: AvailabilityItem['dietary'];
}

/** Veg / non-veg square marker used in availability rows. */
export function DietaryMarker({ dietary }: Readonly<DietaryMarkerProps>) {
  const isVeg = dietary === 'Veg' || dietary === 'Vegan';
  const color = isVeg ? 'success.main' : 'error.main';

  return (
    <Box
      aria-label={dietary}
      sx={{
        width: 14,
        height: 14,
        borderRadius: '2px',
        border: '1.5px solid',
        borderColor: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: color,
        }}
      />
    </Box>
  );
}
