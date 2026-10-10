import type { Metadata } from 'next';
import { BranchMenuAvailabilityScreen } from '@/features/pos/menu-availability';

export const metadata: Metadata = {
  title: 'Captain | Menu Availability',
  description: 'Manage live item availability across all channels.',
};

export default function CaptainMenuAvailabilityPage() {
  return <BranchMenuAvailabilityScreen />;
}
