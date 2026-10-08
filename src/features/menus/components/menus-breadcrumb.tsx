'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';

import { menusCopy } from '../config/copy';
import { menusRoutes } from '../config/paths';
import { routes } from '@/config/routes';

type MenusBreadcrumbProps = Readonly<{
  current: string;
  homeHref?: string;
  showMenusLink?: boolean;
}>;

function Separator() {
  return (
    <ChevronRight
      size={14}
      style={{ flexShrink: 0, color: 'var(--muted-foreground, #64748b)', margin: '0 4px' }}
      aria-hidden
    />
  );
}

export function MenusBreadcrumb({
  current,
  homeHref = routes.dashboard.company,
  showMenusLink = true,
}: MenusBreadcrumbProps) {
  const showMenusCrumb = showMenusLink && current !== menusCopy.crumbMenus;

  return (
    <Box
      component="nav"
      aria-label="Breadcrumb"
      sx={{
        position: 'sticky',
        top: { xs: '-1rem', md: '-1.5rem' },
        zIndex: 10,
        mx: { xs: -2, sm: -3 },
        mt: { xs: -2, sm: -3 },
        mb: 2.5,
        px: { xs: 2, sm: 3 },
        py: 1.25,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box
        component="ol"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          p: 0,
          m: 0,
          listStyle: 'none',
        }}
      >
        <Box component="li">
          <Typography
            component={Link}
            href={homeHref}
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {menusCopy.crumbHome}
          </Typography>
        </Box>
        {showMenusCrumb && (
          <Box component="li" sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Separator />
            <Typography
              component={Link}
              href={menusRoutes.root}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {menusCopy.crumbMenus}
            </Typography>
          </Box>
        )}
        <Box component="li" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Separator />
          <Typography
            component="span"
            aria-current="page"
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            {current}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
