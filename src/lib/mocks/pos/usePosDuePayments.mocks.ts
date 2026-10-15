import type { StatusChipVariant } from '@/components/shared/ui/StatusChip';

export type DuePaymentStatus = 'overdue' | 'pending' | 'paid';

export interface DuePaymentItem {
  id: string;
  customerId: string;
  customerName: string;
  dueDate: string;
  amount: string;
  rawAmount: number;
  status: DuePaymentStatus;
  statusLabel: string;
  statusVariant: StatusChipVariant;
  phone?: string;
  orderNumber?: string;
}

export const MOCK_DUE_PAYMENTS: DuePaymentItem[] = [
  {
    id: 'due-1',
    customerId: 'HOSP-4921',
    customerName: 'Amanda Sterling',
    dueDate: 'Oct 24, 2026',
    amount: '$240.00',
    rawAmount: 240.0,
    status: 'overdue',
    statusLabel: 'Overdue',
    statusVariant: 'danger',
    phone: '+1 (555) 349-2190',
    orderNumber: '#0028',
  },
  {
    id: 'due-2',
    customerId: 'HOSP-3108',
    customerName: 'Marcus Chen',
    dueDate: 'Oct 28, 2026',
    amount: '$1,150.00',
    rawAmount: 1150.0,
    status: 'pending',
    statusLabel: 'Pending',
    statusVariant: 'warning',
    phone: '+1 (555) 782-4412',
    orderNumber: '#0031',
  },
  {
    id: 'due-3',
    customerId: 'HOSP-9011',
    customerName: 'Adanya Nwosu',
    dueDate: 'Nov 02, 2026',
    amount: '$85.50',
    rawAmount: 85.5,
    status: 'paid',
    statusLabel: 'Paid',
    statusVariant: 'success',
    phone: '+1 (555) 601-9923',
    orderNumber: '#0035',
  },
  {
    id: 'due-4',
    customerId: 'HOSP-1244',
    customerName: 'Jonathan Reyes',
    dueDate: 'Nov 08, 2026',
    amount: '$430.00',
    rawAmount: 430.0,
    status: 'pending',
    statusLabel: 'Pending',
    statusVariant: 'warning',
    phone: '+1 (555) 912-3841',
    orderNumber: '#0040',
  },
  {
    id: 'due-5',
    customerId: 'HOSP-7719',
    customerName: 'Sophia Patel',
    dueDate: 'Nov 12, 2026',
    amount: '$615.00',
    rawAmount: 615.0,
    status: 'paid',
    statusLabel: 'Paid',
    statusVariant: 'success',
    phone: '+1 (555) 234-8809',
    orderNumber: '#0044',
  },
];
