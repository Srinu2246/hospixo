import { routes } from '@/config/routes';

const branch = routes.dashboard.branch;
const company = routes.dashboard.company;
const captain = routes.dashboard.captain;
const cashier = routes.dashboard.cashier;

/**
 * Per-flow feature paths. Screens are shared; URLs stay inside the active flow
 * so branch never redirects into captain/cashier (and vice versa).
 */
export const flowPaths = {
  company: {
    menuCreation: `${company}/menu-creation`,
    menuFields: `${company}/menu-fields`,
    gstRates: `${company}/gst-rates`,
    preparationStations: `${company}/preparation-stations`,
    modifierGroups: `${company}/modifier-groups`,
    menuManagement: `${company}/menu-management`,
    menus: `${company}/menus`,
  },
  branch: {
    root: branch,
    menuCreation: `${branch}/menu-creation`,
    menuFields: `${branch}/menu-fields`,
    gstRates: `${branch}/gst-rates`,
    preparationStations: `${branch}/preparation-stations`,
    modifierGroups: `${branch}/modifier-groups`,
    menus: `${branch}/menus`,
    staff: routes.platform.employees.branch,
    floors: `${branch}/floor-table-setup`,
    floorCreate: `${branch}/floor-table-setup/create`,
    tables: `${branch}/tables`,
    dineIn: `${branch}/dine-in`,
    orders: `${branch}/orders`,
    onlineOrders: `${branch}/online-orders`,
    ready: `${branch}/ready`,
    menuAvailability: `${branch}/menu-availability`,
    menuManagement: `${branch}/menu-management`,
    menu: `${branch}/menu`,
    menuFields: `${branch}/menu-fields`,
    floorTableSetup: `${branch}/floor-table-setup`,
    cashShift: `${branch}/cash-shift`,
    duePayments: `${branch}/due-payments`,
    customers: `${branch}/customers`,
    kitchen: `${branch}/kitchen`,
    inventory: routes.dashboard.inventory,
    reports: routes.dashboard.reports,
    hrAttendance: `${routes.dashboard.hr}/attendance`,
    hrSchedule: `${routes.dashboard.hr}/schedule`,
    settings: `${routes.dashboard.settings}/branch`,
  },
  captain: {
    root: captain,
    tables: captain,
    orders: `${captain}/orders`,
    dineIn: `${captain}/dine-in`,
    ready: `${captain}/ready`,
    menuAvailability: `${captain}/menu-availability`,
    checkout: `${captain}/checkout`,
    paymentSuccess: `${captain}/payment-success`,
    orderReview: `${captain}/order-review`,
  },
  cashier: {
    root: cashier,
    tables: `${cashier}/tables`,
    orders: `${cashier}/orders`,
    dineIn: `${cashier}/dine-in`,
    checkout: `${cashier}/checkout`,
    paymentSuccess: `${cashier}/payment-success`,
    billing: `${cashier}/billing`,
    payments: `${cashier}/payments`,
    customers: `${cashier}/customers`,
    reports: `${cashier}/reports`,
  },
} as const;

/** Branch ops screens that need POS order context under AccessShell. */
export const branchPosFeaturePaths = [
  flowPaths.branch.tables,
  flowPaths.branch.dineIn,
  flowPaths.branch.orders,
  flowPaths.branch.onlineOrders,
  flowPaths.branch.ready,
  flowPaths.branch.menuAvailability,
  flowPaths.branch.cashShift,
  flowPaths.branch.duePayments,
  flowPaths.branch.kitchen,
] as const;

export function isBranchPosFeaturePath(pathname: string): boolean {
  return branchPosFeaturePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Cash counter entry — branch flow vs company /pos route. */
export function resolveCashShiftHref(pathname: string): string {
  if (pathname === branch || pathname.startsWith(`${branch}/`)) {
    return flowPaths.branch.cashShift;
  }
  return routes.platform.pos.cashShift;
}
