export type DuePaymentStatus = 'overdue' | 'pending' | 'paid';

export interface DuePayment {
  id: string;
  guestName: string;
  guestId: string;
  dueDate: string;
  amount: number;
  status: DuePaymentStatus;
}

export const duePayments: DuePayment[] = [
  {
    id: 'payment-4921',
    guestName: 'Amanda Sterling',
    guestId: 'HOSP-4921',
    dueDate: 'Oct 24, 2026',
    amount: 240,
    status: 'overdue',
  },
  {
    id: 'payment-3108',
    guestName: 'Marcus Chen',
    guestId: 'HOSP-3108',
    dueDate: 'Oct 28, 2026',
    amount: 1150,
    status: 'pending',
  },
  {
    id: 'payment-9011',
    guestName: 'Adanya Nwosu',
    guestId: 'HOSP-9011',
    dueDate: 'Nov 02, 2026',
    amount: 85.5,
    status: 'paid',
  },
];

export function formatDuePaymentAmount(amount: number) {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
