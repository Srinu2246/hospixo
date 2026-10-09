import type { Metadata } from 'next';
import { BranchMenuAvailabilityScreen } from '@/features/pos/menu-availability';

export const metadata: Metadata = {
  title: 'Branch | Menu Availability',
  description: 'Manage live item availability across all channels in branch.',
};

export default function BranchMenuAvailabilityPage() {
  return <BranchMenuAvailabilityScreen />;
}
