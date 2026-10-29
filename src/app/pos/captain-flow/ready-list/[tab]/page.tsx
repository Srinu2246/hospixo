import { notFound } from 'next/navigation';

import { CaptainFlowReadyListRoutePage } from '@/features/pos/captain-flow';
import { readyListQueueFromSegment } from '@/lib/helpers/captainReadyListRoutes';

interface CaptainReadyListTabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function CaptainReadyListTabPage({ params }: CaptainReadyListTabPageProps) {
  const { tab } = await params;
  const activeTab = readyListQueueFromSegment(tab);
  if (activeTab == null) notFound();
  return <CaptainFlowReadyListRoutePage activeTab={activeTab} />;
}
