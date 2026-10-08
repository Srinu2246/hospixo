import type {
  ActiveCashShift,
  CashShiftDateFilter,
  CashShiftMetrics,
  CashTransaction,
  CloseShiftPreview,
  StartShiftDraft,
} from '@/features/pos/types/cash-shift';

export const cashShiftPreviewMetrics: CashShiftMetrics = {
  status: 'active',
  cashInDrawer: 1245.5,
  totalSales: 3890,
  transactions: 47,
};

export const cashShiftPreviewActive: ActiveCashShift = {
  id: 'shift-1042',
  number: '1042',
  openedBy: 'Ravi Kumar',
  startTimeLabel: '9:00 AM',
  openingBalance: 500,
  managerEmail: 'manager@hotelmayukha.com',
};

export const cashShiftPreviewDate: CashShiftDateFilter = {
  label: 'Today, Oct 24',
};

export const cashShiftPreviewTransactions: CashTransaction[] = [
  {
    id: 'txn-1',
    timeLabel: '02:45 PM',
    type: 'refund',
    description: 'Refund for Order #8429 - Overcooked meal',
    amount: -45,
    balance: 1245.5,
  },
  {
    id: 'txn-2',
    timeLabel: '02:30 PM',
    type: 'cash_sale',
    description: 'Payment for Order #8455 - Dine-in',
    amount: 125.5,
    balance: 1290.5,
  },
  {
    id: 'txn-3',
    timeLabel: '01:15 PM',
    type: 'cash_out',
    description: 'Petty cash for grocery refills',
    amount: -50,
    balance: 1165,
  },
  {
    id: 'txn-4',
    timeLabel: '12:45 PM',
    type: 'card_sale',
    description: 'Payment for Order #8440 - Takeaway',
    amount: 89.0,
    balance: 1215,
  },
  {
    id: 'txn-5',
    timeLabel: '11:20 AM',
    type: 'cash_in',
    description: 'Additional float added mid-shift',
    amount: 200,
    balance: 1215,
  },
  {
    id: 'txn-6',
    timeLabel: '10:05 AM',
    type: 'tip',
    description: 'Tip pool contribution - Table 12',
    amount: 15,
    balance: 1015,
  },
];

export const cashShiftPreviewClose: CloseShiftPreview = {
  summary: {
    shiftId: '#1042',
    openedBy: 'Ravi Kumar',
    startTimeLabel: '9:00 AM',
    durationLabel: '8h 15m',
    totalSales: 3890,
    transactions: 47,
    voucher: {
      id: 'sodexo',
      label: 'Sodexo',
      transactions: 2,
      amount: 350,
    },
  },
  payments: [
    { id: 'cash', label: 'Cash', transactions: 22, amount: 1745.5 },
    { id: 'card', label: 'Card', transactions: 15, amount: 1420 },
    { id: 'upi', label: 'UPI', transactions: 10, amount: 724.5 },
    { id: 'complementary', label: 'Complementary', transactions: 3, amount: 100 },
  ],
  reconciliation: {
    openingBalance: 500,
    totalCashIn: 1745.5,
    totalCashOut: 0,
    expectedInDrawer: 2245.5,
  },
};

export const cashShiftPreviewStart: StartShiftDraft = {
  nextShiftNumber: '1043',
  operators: [
    { id: 'op-ravi', name: 'Ravi Kumar' },
    { id: 'op-anita', name: 'Anita Sharma' },
    { id: 'op-dev', name: 'Dev Patel' },
  ],
  terminals: [
    { id: 'term-1', label: 'Counter 1 - Main POS' },
    { id: 'term-2', label: 'Counter 2 - Takeaway' },
    { id: 'term-3', label: 'Counter 3 - Bar' },
  ],
  defaultOperatorId: 'op-ravi',
  defaultTerminalId: 'term-1',
  defaultOpeningBalance: 0,
};
