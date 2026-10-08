import { routes } from '@/config/routes';

import { flowPaths } from '@/config/shell/flow-paths';

export type PosFlowId = 'platform' | 'captain' | 'branch';

/**
 * Normalized POS screen URLs for the active workspace flow.
 * Captain / branch keep navigation inside their prefix; platform uses flat POS routes.
 */
export type PosFlowPaths = Readonly<{
  id: PosFlowId;
  tables: string;
  dineIn: string;
  checkout: string;
  paymentSuccess: string;
  orders: string;
  orderDetails: (orderId: string) => string;
  ready: string;
  onlineOrders: string;
  duePayments: string;
  menuAvailability: string;
  dashboard: string;
  cashShift: string;
}>;

const platformPos = routes.platform.pos;

function startsWithPath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function resolvePosFlowId(pathname: string): PosFlowId {
  if (startsWithPath(pathname, routes.dashboard.captain)) return 'captain';
  if (startsWithPath(pathname, routes.dashboard.branch)) return 'branch';
  return 'platform';
}

export function resolvePosFlowPaths(pathname: string): PosFlowPaths {
  const id = resolvePosFlowId(pathname);

  if (id === 'captain') {
    const captain = flowPaths.captain;
    return {
      id,
      tables: captain.tables,
      dineIn: captain.dineIn,
      checkout: captain.checkout,
      paymentSuccess: captain.paymentSuccess,
      orders: captain.orders,
      orderDetails: (orderId: string) => `${captain.orders}/${orderId}`,
      ready: captain.ready,
      onlineOrders: '#online-orders',
      duePayments: '#due-payments',
      menuAvailability: captain.menuAvailability,
      dashboard: routes.dashboard.root,
      cashShift: '#cash-shift',
    };
  }

  if (id === 'branch') {
    const branch = flowPaths.branch;
    return {
      id,
      tables: branch.tables,
      dineIn: branch.dineIn,
      checkout: platformPos.checkoutPayment,
      paymentSuccess: platformPos.paymentSuccess,
      orders: branch.orders,
      orderDetails: (orderId: string) => `${branch.orders}/${orderId}`,
      ready: branch.ready,
      onlineOrders: branch.onlineOrders,
      duePayments: branch.duePayments,
      menuAvailability: branch.menuAvailability,
      dashboard: routes.dashboard.root,
      cashShift: branch.cashShift,
    };
  }

  return {
    id: 'platform',
    tables: platformPos.tables,
    dineIn: platformPos.dineIn,
    checkout: platformPos.checkoutPayment,
    paymentSuccess: platformPos.paymentSuccess,
    orders: platformPos.openOrders,
    orderDetails: (orderId: string) => `${platformPos.openOrders}/${orderId}`,
    ready: platformPos.readyList,
    onlineOrders: platformPos.onlineOrders,
    duePayments: platformPos.duePayments,
    menuAvailability: '/pos/menu-availability',
    dashboard: routes.dashboard.root,
    cashShift: '#cash-shift',
  };
}
