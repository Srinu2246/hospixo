'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableBarOutlinedIcon from '@mui/icons-material/TableBarOutlined';
import { ClipboardCheck, Receipt, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { WaiterWorkspaceNavId } from '@/app/sidebar';
import {
  captainFlowNavSuffix,
  POS_CAPTAIN_BOTTOM_NAV_HEIGHT,
  POS_CAPTAIN_COMPACT_PADDING,
  resolveCaptainFlowBase,
} from '@/lib/helpers/posCaptainFlow';
import { useWorkspaceBottomNav } from '@/lib/hooks/useWorkspaceBottomNav';
import { colors } from '@/lib/theme/mui/colors';

const BOTTOM_NAV_ICONS: Record<
  WaiterWorkspaceNavId,
  { mui?: typeof TableBarOutlinedIcon; lucide?: LucideIcon }
> = {
  tables: { mui: TableBarOutlinedIcon },
  orders: { lucide: Receipt },
  ready: { lucide: ClipboardCheck },
  menu: { lucide: UtensilsCrossed },
};

export function WorkspaceBottomNav() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const base = useMemo(() => resolveCaptainFlowBase(pathname), [pathname]);
  const { items, activeId } = useWorkspaceBottomNav(pathname);

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
      {items.map((item) => {
        const isActive = activeId === item.id;
        const activeColor = colors.captainFlow.primary;
        const inactiveColor = colors.captainFlow.navInactive;
        const icons = BOTTOM_NAV_ICONS[item.id];
        const MuiIcon = icons.mui;
        const LucideIconComponent = icons.lucide;

        return (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => router.push(`${base}${captainFlowNavSuffix(item.captainFlowSuffix)}`)}
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
            {MuiIcon ? (
              <MuiIcon sx={{ fontSize: 22, color: 'inherit' }} />
            ) : LucideIconComponent ? (
              <LucideIconComponent size={21} strokeWidth={isActive ? 2.35 : 2} />
            ) : null}
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 700 : 600,
                lineHeight: 1.1,
                color: 'inherit',
              }}
            >
              {item.bottomNavLabel}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
