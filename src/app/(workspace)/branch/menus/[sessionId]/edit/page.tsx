'use client';

import { use } from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { SessionFormPage, SessionFormSkeleton, useMenus } from '@/features/menus';
import { menusCopy } from '@/features/menus/config/copy';
import { useMenusRoutes } from '@/features/menus/context/menus-routes-context';

export default function EditBranchMenuSessionPage({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const menusRoutes = useMenusRoutes();
  const resolvedParams = use(params);
  const sessionId = decodeURIComponent(resolvedParams.sessionId ?? '');
  const { getSession, ready } = useMenus();
  const session = getSession(sessionId);

  if (!ready) return <SessionFormSkeleton mode="edit" />;

  if (!session) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {menusCopy.notFound}
        </Typography>
        <Button component={NextLink} href={menusRoutes.root} variant="outlined">
          {menusCopy.backToMenus}
        </Button>
      </Box>
    );
  }

  return <SessionFormPage mode="edit" session={session} />;
}
