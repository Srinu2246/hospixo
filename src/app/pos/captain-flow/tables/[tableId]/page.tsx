import { redirect } from 'next/navigation';

/** Captain tables no longer use /tables/[tableId] for ordering. */
export default function CaptainFlowTableDetailRoute() {
  redirect('/pos/captain-flow/tables');
}
