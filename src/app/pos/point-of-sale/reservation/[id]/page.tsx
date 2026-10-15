import { ReservationDetails } from '@/features/pos/point-of-sale/reservation';

interface PosReservationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PosReservationDetailPage({ params }: PosReservationDetailPageProps) {
  const resolvedParams = await params;
  return <ReservationDetails reservationId={resolvedParams.id} />;
}
