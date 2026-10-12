import { ReservationDetails } from '@/features/pos/point-of-sale/reservation';

interface PosReservationDetailPageProps {
  params: {
    id: string;
  };
}

export default function PosReservationDetailPage({ params }: PosReservationDetailPageProps) {
  return <ReservationDetails reservationId={params.id} />;
}
