export type DuePaymentStatus = 'overdue' | 'pending' | 'paid';

export interface DuePayment {
  id: string;
  guestName: string;
  guestId: string;
  dueDate: string;
  amount: number;
  status: DuePaymentStatus;
}

export function formatDuePaymentAmount(amount: number) {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
