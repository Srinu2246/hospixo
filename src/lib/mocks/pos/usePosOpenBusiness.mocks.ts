export type OpenBusinessCounter = {
  id: string;
  name: string;
  type: string;
  cashRegisterId: string;
  openingCash: number;
};

export type OpenBusinessMeta = {
  businessDate: string;
  businessDay: string;
  branchName: string;
  branchCity: string;
  counterCount: number;
};

export type OpenBusinessChecklistItem = {
  id: string;
  label: string;
};

export const MOCK_CASH_REGISTER_OPTIONS = ['CR-001', 'CR-002', 'CR-003'] as const;

export const MOCK_OPEN_BUSINESS_META: OpenBusinessMeta = {
  businessDate: '21 Oct 2026',
  businessDay: 'Tuesday',
  branchName: 'Banjara Hills',
  branchCity: 'Hyderabad',
  counterCount: 3,
};

export const MOCK_OPEN_BUSINESS_COUNTERS: OpenBusinessCounter[] = [
  {
    id: 'counter-1',
    name: 'Counter 1',
    type: 'Main Billing',
    cashRegisterId: 'CR-001',
    openingCash: 5000,
  },
  {
    id: 'counter-2',
    name: 'Counter 2',
    type: 'Takeaway',
    cashRegisterId: 'CR-002',
    openingCash: 3000,
  },
  {
    id: 'counter-3',
    name: 'Counter 3',
    type: 'Additional Billing',
    cashRegisterId: 'CR-003',
    openingCash: 2000,
  },
];

export const OPEN_BUSINESS_CHECKLIST: readonly OpenBusinessChecklistItem[] = [
  { id: 'prev-day-closed', label: 'Previous day closing is completed' },
  {
    id: 'registers-ready',
    label: 'All cash registers are configured and functioning',
  },
  { id: 'cash-verified', label: 'Opening cash amounts are verified' },
  {
    id: 'modules-ready',
    label: 'Required modules (POS, Inventory, Kitchen Display) are working',
  },
  { id: 'counters-ready', label: 'All counters are ready for operations' },
  {
    id: 'confirm-open',
    label: 'I have reviewed the opening details and confirm to open the business day',
  },
];

export function formatOpeningCash(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseOpeningCashInput(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
