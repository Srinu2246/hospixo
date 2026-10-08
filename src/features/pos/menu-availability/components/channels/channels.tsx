'use client';

import { Globe2, LayoutGrid } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { MenuChannel, MenuChannelId } from '@/features/pos/types/menu-availability';

import styles from './channels.module.css';

type MenuChannelsProps = Readonly<{
  channels: readonly MenuChannel[];
  value: MenuChannelId;
  onChange: (id: MenuChannelId) => void;
}>;

function ChannelIcon({ id }: Readonly<{ id: MenuChannelId }>) {
  if (id === 'all') return <LayoutGrid className={styles.icon} aria-hidden="true" />;
  if (id === 'zomato') return <span className={cn(styles.logo, styles.zomato)}>Z</span>;
  if (id === 'swiggy') return <span className={cn(styles.logo, styles.swiggy)}>S</span>;
  if (id === 'fuddo') return <span className={cn(styles.logo, styles.fuddo)}>F</span>;
  return <Globe2 className={styles.icon} aria-hidden="true" />;
}

export function MenuChannels({ channels, value, onChange }: MenuChannelsProps) {
  return (
    <div className={styles.row} role="tablist" aria-label="Sales channels">
      {channels.map((channel) => {
        const active = channel.id === value;
        return (
          <button
            key={channel.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(styles.chip, active && styles.chipActive)}
            onClick={() => onChange(channel.id)}
          >
            <ChannelIcon id={channel.id} />
            <span>{channel.label}</span>
          </button>
        );
      })}
    </div>
  );
}
