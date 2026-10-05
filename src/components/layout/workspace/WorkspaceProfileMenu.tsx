'use client';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import {
  Avatar,
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AUTH_ROUTES } from '@/lib/constants/routes';
import { colors } from '@/lib/theme/mui/colors';
import { api } from '@/services/api/api';

type WorkspaceProfileMenuProps = Readonly<{
  initials?: string;
  displayName?: string;
  roleLabel?: string;
}>;

export function WorkspaceProfileMenu({
  initials = 'AK',
  displayName = 'Workspace User',
  roleLabel = 'Company manager',
}: WorkspaceProfileMenuProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleSignOut = () => {
    setAnchorEl(null);
    api.removeToken();
    window.dispatchEvent(new Event('storage'));
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <Box>
      <IconButton
        onClick={(event) => {
          setAnchorEl((current) => (current ? null : event.currentTarget));
        }}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        sx={{ p: 0 }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: colors.text.primary,
            color: colors.background.default,
          }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Popper open={open} anchorEl={anchorEl} placement="bottom-end" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              width: 'min(18rem, calc(100vw - 2rem))',
              borderRadius: 1.5,
              border: `1px solid ${colors.border.default}`,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, p: 1.75, pb: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: colors.text.primary,
                  color: colors.background.default,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.3 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
                  {roleLabel}
                </Typography>
              </Box>
            </Box>
            <Divider />
            <MenuList dense sx={{ py: 0.5 }}>
              <MenuItem onClick={() => setAnchorEl(null)}>
                <ListItemIcon>
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="My profile"
                  slotProps={{ primary: { sx: { fontSize: '0.8125rem' } } }}
                />
              </MenuItem>
            </MenuList>
            <Divider />
            <MenuList dense sx={{ py: 0.5 }}>
              <MenuItem onClick={handleSignOut} sx={{ color: colors.danger.default }}>
                <ListItemIcon sx={{ color: colors.danger.default }}>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  slotProps={{ primary: { sx: { fontSize: '0.8125rem' } } }}
                />
              </MenuItem>
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}
