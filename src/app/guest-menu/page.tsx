import { Suspense } from 'react';
import type { Metadata } from 'next';

import { GuestMenuScreen } from '@/features/floor-table-setup/components/guest-menu/guest-menu-screen';

export const metadata: Metadata = {
  title: 'Guest menu',
  description: 'Section guest menu',
};

export default function GuestMenuPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}>
          Loading menu…
        </div>
      }
    >
      <GuestMenuScreen />
    </Suspense>
  );
}
