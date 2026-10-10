'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { NotificationSeverity, SystemNotification } from '@/features/pos/config/dashboard';
import { getNotificationSeverityLabel } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

const severityDot: Record<NotificationSeverity, string> = {
  critical: 'var(--pos-danger, #D32F2F)',
  completed: 'var(--pos-success)',
  warning: 'var(--pos-warning)',
  info: 'var(--pos-primary)',
};

const severityChipColor: Record<NotificationSeverity, 'error' | 'success' | 'warning' | 'info'> = {
  critical: 'error',
  completed: 'success',
  warning: 'warning',
  info: 'info',
};

interface SystemNotificationsProps {
  notifications: SystemNotification[];
}

export function SystemNotifications({ notifications }: Readonly<SystemNotificationsProps>) {
  return (
    <DashboardPanel title="System Notifications" titleId="system-notifications-title">
      <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {notifications.map((notification) => (
          <Stack
            key={notification.id}
            component="li"
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: severityDot[notification.severity],
                }}
              />
              <Typography variant="body2" noWrap title={notification.title}>
                {notification.title}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={getNotificationSeverityLabel(notification.severity)}
              color={severityChipColor[notification.severity]}
              variant="outlined"
              sx={{ flexShrink: 0 }}
            />
          </Stack>
        ))}
      </Stack>
    </DashboardPanel>
  );
}
