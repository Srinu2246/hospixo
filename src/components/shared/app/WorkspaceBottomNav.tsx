'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ClipboardCheck, Receipt, UtensilsCrossed } from 'lucide-react';

import TableBarOutlinedIcon from '@mui/icons-material/TableBarOutlined';

import {
  POS_CAPTAIN_BOTTOM_NAV_HEIGHT,
  POS_CAPTAIN_COMPACT_PADDING,
  resolveCaptainFlowBase,
} from '@/lib/helpers/posCaptainFlow';
import { colors } from '@/lib/theme/mui/colors';

type CaptainNavTab = 'tables' | 'menu' | 'ready' | 'orders';

const NAV_ITEMS: readonly {
  id: CaptainNavTab;
  label: string;
  suffix: string;
  icon: typeof TableBarOutlinedIcon;
  lucide?: typeof UtensilsCrossed;
}[] = [
  { id: 'tables', label: 'Tables', suffix: '/tables', icon: TableBarOutlinedIcon },
  {
    id: 'menu',
    label: 'Menu',
    suffix: '/order-menu',
    icon: TableBarOutlinedIcon,
    lucide: UtensilsCrossed,
  },
  {
    id: 'ready',
    label: 'Ready',
    suffix: '/ready-list',
    icon: TableBarOutlinedIcon,
    lucide: ClipboardCheck,
  },
  {
    id: 'orders',
    label: 'Orders',
    suffix: '/all-orders',
    icon: TableBarOutlinedIcon,
    lucide: Receipt,
  },
];

function activeTabFromPath(pathname: string): CaptainNavTab {
  if (pathname.includes('/order-menu') || pathname.includes('/takeaway')) return 'menu';
  if (pathname.includes('/ready-list')) return 'ready';
  if (pathname.includes('/all-orders')) return 'orders';
  if (/\/dine-in\/[^/?#]+/.test(pathname)) return 'menu';
  if (pathname.includes('/dine-in')) return 'tables';
  return 'tables';
}

export function WorkspaceBottomNav() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const base = useMemo(() => resolveCaptainFlowBase(pathname), [pathname]);
  const active = activeTabFromPath(pathname);

  return (
    <Box
      component="nav"
      aria-label="Captain workspace"
      sx={{
        flexShrink: 0,
        minHeight: POS_CAPTAIN_BOTTOM_NAV_HEIGHT,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: colors.border.default,
        display: 'flex',
        alignItems: 'stretch',
        px: POS_CAPTAIN_COMPACT_PADDING,
        pb: 'env(safe-area-inset-bottom, 0px)',
        boxSizing: 'border-box',
      }}
    >
      {NAV_ITEMS.map(({ id, label, suffix, icon: MuiIcon, lucide: LucideIcon }) => {
        const isActive = active === id;
        const activeColor = colors.captainFlow.primary;
        const inactiveColor = colors.captainFlow.navInactive;
        return (
          <Box
            key={id}
            component="button"
            type="button"
            onClick={() => router.push(`${base}${suffix}`)}
            sx={{
              flex: 1,
              border: 0,
              p: 0,
              py: 0.75,
              cursor: 'pointer',
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.35,
              color: isActive ? activeColor : inactiveColor,
              position: 'relative',
            }}
          >
            {isActive ? (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: '22%',
                  right: '22%',
                  height: 3,
                  borderRadius: '4px 4px 0 0',
                  bgcolor: activeColor,
                }}
              />
            ) : null}
            {id === 'tables' ? (
              <MuiIcon sx={{ fontSize: 22, color: 'inherit' }} />
            ) : LucideIcon ? (
              <LucideIcon size={21} strokeWidth={isActive ? 2.35 : 2} />
            ) : null}
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 700 : 600,
                lineHeight: 1.1,
                color: 'inherit',
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
