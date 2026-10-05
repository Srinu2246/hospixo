'use client';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { Box, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { useState } from 'react';

import { WorkspaceProfileMenu } from '@/components/layout/workspace/WorkspaceProfileMenu';
import { headerChrome } from '@/lib/constants/headerChrome';
import { workspaceCompanies, workspaceUserProfile } from '@/lib/constants/workspaceNavigation';
import { colors } from '@/lib/theme/mui/colors';

type WorkspaceTopbarProps = Readonly<{
  navOpen?: boolean;
  onMenuClick?: () => void;
  /** Organisation dashboard uses company picker (screenshot). */
  mode?: 'organisation' | 'company';
}>;

export function WorkspaceTopbar({
  navOpen = false,
  onMenuClick,
  mode = 'organisation',
}: WorkspaceTopbarProps) {
  const [companyId, setCompanyId] = useState<string>(workspaceCompanies[0].id);
  const profile = workspaceUserProfile;
  const isOrganisation = mode === 'organisation';

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        height: '3.75rem',
        px: 2,
        bgcolor: colors.workspace.header,
        borderBottom: `1px solid ${colors.border.default}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
        {onMenuClick ? (
          <IconButton
            onClick={onMenuClick}
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
            sx={{ display: { md: 'none' }, color: colors.text.secondary }}
          >
            <MenuOutlinedIcon />
          </IconButton>
        ) : null}

        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.1 }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 500,
              letterSpacing: '0.01em',
              lineHeight: 1.1,
              color: colors.text.secondary,
            }}
          >
            {isOrganisation ? 'Companies' : 'Outlets'}
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <PlaceOutlinedIcon
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0.95rem',
                height: '0.95rem',
                color: colors.text.primary,
                pointerEvents: 'none',
              }}
            />
            <Select
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              variant="standard"
              disableUnderline
              displayEmpty
              aria-label={isOrganisation ? 'Select company' : 'Select outlet'}
              IconComponent={KeyboardArrowDownOutlinedIcon}
              sx={{
                minWidth: '9.5rem',
                pl: 2.5,
                pr: 2.5,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: colors.text.primary,
                '& .MuiSelect-icon': {
                  right: 0,
                  color: colors.text.secondary,
                  width: '0.95rem',
                  height: '0.95rem',
                },
              }}
            >
              {workspaceCompanies.map((company) => (
                <MenuItem key={company.id || 'placeholder'} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {headerChrome.showThemeToggle ? (
          <IconButton
            aria-label="Toggle theme"
            sx={{
              width: '2.15rem',
              height: '2.15rem',
              borderRadius: 0.6,
              color: colors.text.secondary,
              '&:hover': { bgcolor: colors.surface.light, color: colors.text.primary },
            }}
          >
            <LightModeOutlinedIcon sx={{ fontSize: '1.05rem' }} />
          </IconButton>
        ) : null}
        <WorkspaceProfileMenu
          initials={profile.initials}
          displayName={profile.displayName}
          roleLabel={profile.roleLabel}
        />
      </Box>
    </Box>
  );
}
