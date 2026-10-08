export type CashTxnType = 'refund' | 'cash_sale' | 'card_sale' | 'cash_out' | 'cash_in' | 'tip';

export type CashShiftStatus = 'active' | 'closed';

export type CashShiftMetrics = {
  status: CashShiftStatus;
  cashInDrawer: number;
  totalSales: number;
  transactions: number;
};

export type ActiveCashShift = {
  id: string;
  number: string;
  openedBy: string;
  startTimeLabel: string;
  openingBalance: number;
  /** Outlet manager email for close-summary notifications. */
  managerEmail: string;
};

export type CashTransaction = {
  id: string;
  timeLabel: string;
  type: CashTxnType;
  description: string;
  amount: number;
  balance: number;
};

export type CashShiftDateFilter = {
  label: string;
};

export type CloseShiftPaymentMethod = 'cash' | 'card' | 'upi' | 'complementary';

export type CloseShiftPaymentRow = {
  id: CloseShiftPaymentMethod;
  label: string;
  transactions: number;
  amount: number;
};

export type CloseShiftVoucherRow = {
  id: string;
  label: string;
  transactions: number;
  amount: number;
};

export type CloseShiftSummary = {
  shiftId: string;
  openedBy: string;
  startTimeLabel: string;
  durationLabel: string;
  totalSales: number;
  transactions: number;
  voucher?: CloseShiftVoucherRow;
};

export type CloseShiftReconciliation = {
  openingBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedInDrawer: number;
};

export type CloseShiftPreview = {
  summary: CloseShiftSummary;
  payments: CloseShiftPaymentRow[];
  reconciliation: CloseShiftReconciliation;
};

export type CloseShiftSubmitPayload = {
  shiftId: string;
  notes: string;
  actualCash: number;
  pin: string;
};

export type ShiftCloseBalanceStatus = 'balanced' | 'variance';

export type ShiftClosedResult = {
  shiftNumber: string;
  openedBy: string;
  startTimeLabel: string;
  endTimeLabel: string;
  closedAtLabel: string;
  durationLabel: string;
  totalSales: number;
  transactions: number;
  cashDifference: number;
  balanceStatus: ShiftCloseBalanceStatus;
  reportPrinted: boolean;
  managerEmailMasked: string;
};

export type StartShiftOperator = {
  id: string;
  name: string;
};

export type StartShiftTerminal = {
  id: string;
  label: string;
};

export type StartShiftDraft = {
  nextShiftNumber: string;
  operators: StartShiftOperator[];
  terminals: StartShiftTerminal[];
  defaultOperatorId: string;
  defaultTerminalId: string;
  defaultOpeningBalance: number;
};

export type StartShiftPayload = {
  shiftNumber: string;
  operatorId: string;
  operatorName: string;
  terminalId: string;
  openingBalance: number;
  startedAtLabel: string;
};
