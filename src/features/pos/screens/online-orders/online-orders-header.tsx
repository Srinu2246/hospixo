import type { OnlineOrderChannel } from '@/features/pos/config/online-orders';
import { onlineOrdersChannels, onlineOrdersPageMeta } from '@/features/pos/config/online-orders';
import { Bell } from 'lucide-react';

import styles from './online-orders-header.module.css';

interface OnlineOrdersHeaderProps {
  activeChannel: OnlineOrderChannel;
  onChannelChange: (channel: OnlineOrderChannel) => void;
  /** Hide page title/subtitle — used when PosMobileHeader is shown. */
  hideTitle?: boolean;
}

export function OnlineOrdersHeader({
  activeChannel,
  onChannelChange,
  hideTitle = false,
}: Readonly<OnlineOrdersHeaderProps>) {
  return (
    <header className={`${styles.header} ${hideTitle ? styles.headerChannelsOnly : ''}`}>
      <div className={styles.titleBlock}>
        {hideTitle ? null : (
          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.title}>{onlineOrdersPageMeta.title}</h1>
              <p className={styles.subtitle}>{onlineOrdersPageMeta.subtitle}</p>
            </div>
            <button type="button" className={styles.alertBtn} aria-label="Alerts">
              <Bell size={18} />
            </button>
          </div>
        )}

        <div className={styles.tabs} role="tablist" aria-label="Order channels">
          {onlineOrdersChannels.map((channel) => {
            const active = channel.id === activeChannel;
            return (
              <button
                key={channel.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                onClick={() => onChannelChange(channel.id)}
              >
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>

      {hideTitle ? null : (
        <div className={styles.stats}>
          <p className={styles.statBlue}>
            {onlineOrdersPageMeta.totalOrdersLabel}{' '}
            <strong>{onlineOrdersPageMeta.totalOrdersCount}</strong>
          </p>
          <p className={styles.statRed}>
            {onlineOrdersPageMeta.pendingCount} {onlineOrdersPageMeta.pendingLabel}
          </p>
          <p className={styles.statMuted}>{onlineOrdersPageMeta.syncedLabel}</p>
          <span className={styles.onlinePill}>
            <span className={styles.onlineDot} aria-hidden />
            {onlineOrdersPageMeta.onlineLabel}
          </span>
        </div>
      )}
    </header>
  );
}
