/** Shared POS order action labels — single source for mobile + desktop. */
export const posOrderActions = {
  sendToKot: 'Send to KOT',
  addItems: 'Add Items',
  settleBill: 'Settle Bill',
  generateReceipt: 'Generate Receipt',
  viewItems: 'View Items',
  settle: 'Settle',
} as const;

export const posOrderNotifications = {
  kotSentTitle: 'KOT sent to kitchen',
  kotSentBody: 'The kitchen display has been updated with this order.',
} as const;
