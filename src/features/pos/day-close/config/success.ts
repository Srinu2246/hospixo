import { routes } from '@/config/routes';

export const successPageMeta = {
  title: 'Day #157 Closed Successfully',
  subtitle: 'Operations finalized for May 17, 2026 at 11:45 PM',
  footerNote: "Consolidated reports have been sent to the board and regional manager's email.",
  dashboardLabel: 'Back to Dashboard',
  startNewDayLabel: 'Start New Day',
  dashboardHref: routes.platform.pos.dashboard,
  startNewDayHref: routes.platform.pos.dayClose,
};

export const dayClosingSummaryMeta = {
  title: 'Day Closing Summary',
  balancedLabel: 'BALANCED',
  archiveNote: 'Daily report printed and archived.',
};

export const dayClosingSummaryStats = {
  closedBy: 'Ravi Kumar',
  totalRevenue: '₹84,290.00',
  orders: '142',
  shiftsOperated: '2',
  cashDifference: '₹0.00',
  upiDigital: '₹66,090.00',
};

export const dayClosingSummaryLabels = {
  closedBy: 'CLOSED BY',
  totalRevenue: 'TOTAL REVENUE',
  orders: 'ORDERS',
  shiftsOperated: 'SHIFTS OPERATED',
  cashDifference: 'CASH DIFFERENCE',
  upiDigital: 'UPI / DIGITAL',
} as const;
