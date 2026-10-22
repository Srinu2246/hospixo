export interface ShiftMetricItem {
  id: string;
  label: string;
  value: string;
  hasLiveIndicator?: boolean;
}

export interface ActiveShiftDetails {
  shiftNumber: string;
  openedBy: string;
  startTime: string;
  openingBalance: string;
}

export interface CashTransactionItem {
  id: string;
  time: string;
  type: string;
  description: string;
  amount: string;
  balance: string;
  isPositive: boolean;
}

export interface PaymentBreakdownItem {
  id: string;
  label: string;
  count: number;
  amount: string;
}

export interface CloseShiftReconciliation {
  openingBalance: string;
  totalCashIn: string;
  totalCashOut: string;
  expectedInDrawer: string;
  actualCashCount: string;
  difference: string;
}

export interface CloseShiftDetails {
  shiftId: string;
  openedBy: string;
  startTime: string;
  duration: string;
  totalSales: string;
  transactions: number;
  sodexoAmount: string;
  sodexoTransactions: number;
  paymentBreakdown: readonly PaymentBreakdownItem[];
  reconciliation: CloseShiftReconciliation;
}

export interface CloseShiftSuccessDetails {
  shiftNumber: string;
  closedAt: string;
  openedBy: string;
  timeRange: string;
  duration: string;
  totalSales: string;
  transactions: number;
  cashDifference: string;
  managerEmail: string;
}

export interface NewShiftDefaults {
  defaultOpeningBalance: string;
}

export const MOCK_SHIFT_METRICS: readonly ShiftMetricItem[] = [
  {
    id: 'current-shift',
    label: 'CURRENT SHIFT',
    value: 'Active',
    hasLiveIndicator: true,
  },
  {
    id: 'cash-in-drawer',
    label: 'CASH IN DRAWER',
    value: '₹1,245.50',
  },
  {
    id: 'total-sales',
    label: 'TOTAL SALES',
    value: '₹3,890.00',
  },
  {
    id: 'transactions',
    label: 'TRANSACTIONS',
    value: '47',
  },
];

export const MOCK_ACTIVE_SHIFT: ActiveShiftDetails = {
  shiftNumber: 'Shift #1042',
  openedBy: 'Ravi Kumar',
  startTime: '9:00 AM',
  openingBalance: '₹500.00',
};

export const MOCK_CASH_TRANSACTIONS: readonly CashTransactionItem[] = [
  {
    id: 'tx-1',
    time: '02:45 PM',
    type: 'Refund',
    description: 'Refund for Order #8429 - Overcooked meal',
    amount: '-₹45.00',
    balance: '₹1,245.50',
    isPositive: false,
  },
  {
    id: 'tx-2',
    time: '02:30 PM',
    type: 'Cash Sale',
    description: 'Payment for Order #8455 - Dine-in',
    amount: '+₹125.50',
    balance: '₹1,290.50',
    isPositive: true,
  },
  {
    id: 'tx-3',
    time: '01:15 PM',
    type: 'Cash Out',
    description: 'Petty cash for grocery refills',
    amount: '-₹50.00',
    balance: '₹1,165.00',
    isPositive: false,
  },
  {
    id: 'tx-4',
    time: '12:45 PM',
    type: 'Card Sale',
    description: 'Payment for Order #8442 - Online',
    amount: '+₹210.00',
    balance: '₹1,215.00',
    isPositive: true,
  },
  {
    id: 'tx-5',
    time: '11:30 AM',
    type: 'Cash Sale',
    description: 'Payment for Order #8431 - Dine-in',
    amount: '+₹88.00',
    balance: '₹1,005.00',
    isPositive: true,
  },
  {
    id: 'tx-6',
    time: '10:00 AM',
    type: 'Cash In',
    description: 'Additional float added',
    amount: '+₹500.00',
    balance: '₹917.00',
    isPositive: true,
  },
  {
    id: 'tx-7',
    time: '09:05 AM',
    type: 'Tip',
    description: 'Cash tip for Shift #1041 handover',
    amount: '+₹17.00',
    balance: '₹417.00',
    isPositive: true,
  },
];

export const MOCK_CLOSE_SHIFT_DETAILS: CloseShiftDetails = {
  shiftId: '#1042',
  openedBy: 'Ravi Kumar',
  startTime: '9:00 AM',
  duration: '8h 15m',
  totalSales: '₹3,890.00',
  transactions: 47,
  sodexoAmount: '₹350.00',
  sodexoTransactions: 2,
  paymentBreakdown: [
    { id: 'cash', label: 'Cash', count: 22, amount: '₹1,745.50' },
    { id: 'card', label: 'Card', count: 15, amount: '₹1,420.00' },
    { id: 'upi', label: 'UPI', count: 10, amount: '₹724.50' },
    { id: 'complementary', label: 'Complementary', count: 3, amount: '₹100.00' },
  ],
  reconciliation: {
    openingBalance: '₹500.00',
    totalCashIn: '₹1,745.50',
    totalCashOut: '₹0.00',
    expectedInDrawer: '₹2,245.50',
    actualCashCount: '₹2,245.50',
    difference: '₹0.00',
  },
};

export const MOCK_CLOSE_SHIFT_SUCCESS: CloseShiftSuccessDetails = {
  shiftNumber: 'Shift #1042',
  closedAt: 'May 17, 2026 at 5:15 PM',
  openedBy: 'Ravi Kumar',
  timeRange: '9:00 AM – 5:15 PM',
  duration: '8h 15m',
  totalSales: '₹3,890.00',
  transactions: 47,
  cashDifference: '₹0.00',
  managerEmail: 'm***@hotelmayukha.com',
};

export const MOCK_NEW_SHIFT_DEFAULTS: NewShiftDefaults = {
  defaultOpeningBalance: '0.00',
};

type MockRequest = {
  method: string;
  path: string;
};

const CURRENT_SHIFT_PATH = /^\/v1\/branches\/(\d+)\/shifts\/current$/;

/**
 * Mock for GET /v1/branches/{branch_id}/shifts/current.
 * Returns `data: null` so POS shows Start New Shift.
 */
export function resolveCurrentShiftMock(request: MockRequest): unknown | undefined {
  if (request.method !== 'GET') return undefined;
  if (!CURRENT_SHIFT_PATH.test(request.path)) return undefined;

  return {
    success: true,
    data: null,
    message: 'OK',
    request_id: 'mock-shifts-current',
  };
}
