import { Suspense } from 'react';
import type { Metadata } from 'next';

import { Loading } from '@/components/shared/ui/Loading';
import { GuestMenuScreen } from '@/components/features/floor-and-table-setup/GuestMenuScreen';
import { guestMenuCopy } from '@/lib/strings/floor-and-table-setup/guestMenuCopy';

export const metadata: Metadata = {
  title: 'Guest menu',
  description: 'Section guest menu',
};

export default function GuestMenuPage() {
  return (
    <Suspense fallback={<Loading message={guestMenuCopy.loading} fullPage />}>
      <GuestMenuScreen />
    </Suspense>
  );
}
