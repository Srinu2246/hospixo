'use client';

import { Box, Card, Skeleton } from '@mui/material';
import { MenusBreadcrumb } from '../menus-breadcrumb';
import { menusCopy } from '../../config/copy';

const CARD_KEYS = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6'] as const;

export function MenusListSkeleton() {
  return (
    <Box sx={{ width: '100%', py: 2 }} aria-busy="true" aria-label="Loading menus">
      <MenusBreadcrumb current={menusCopy.crumbMenus} showMenusLink={false} />
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Skeleton variant="text" width={220} height={36} />
          <Skeleton variant="text" width={340} height={20} />
        </Box>
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant="rectangular" width={280} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {CARD_KEYS.map((key) => (
          <Card key={key} variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="text" width={90} height={18} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={40} height={24} />
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export function SessionDetailSkeleton({ current }: { current: string }) {
  return (
    <Box sx={{ width: '100%', py: 2 }} aria-busy="true">
      <MenusBreadcrumb current={current} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={200} height={36} />
          <Skeleton variant="text" width={180} height={20} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
      <AssignedItemsTableSkeleton />
    </Box>
  );
}

export function AssignedItemsTableSkeleton() {
  return (
    <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="text" width={140} height={28} />
        <Skeleton variant="rectangular" width={220} height={36} sx={{ borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
        <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <Skeleton key={idx} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Card>
  );
}

export function SessionFormSkeleton({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <Box sx={{ width: '100%', py: 2 }} aria-busy="true">
      <MenusBreadcrumb current={mode === 'create' ? 'Create Session' : 'Edit Session'} />
      <Skeleton variant="text" width={260} height={36} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={380} height={20} sx={{ mb: 3 }} />
      <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Skeleton variant="rectangular" height={52} sx={{ mb: 2.5, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={52} sx={{ mb: 2.5, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={52} sx={{ mb: 2.5, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={90} sx={{ mb: 2.5, borderRadius: 1 }} />
      </Card>
    </Box>
  );
}

export function AssignItemsModalSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
        {[1, 2, 3, 4].map((idx) => (
          <Skeleton key={idx} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Box>
  );
}
