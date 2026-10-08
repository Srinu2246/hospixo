import type { PosFlowIconKey } from '@/features/pos/config/nav-flow';
import type { PosOperationsIconKey } from '@/features/pos/config/nav-operations';
import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Coffee,
  CreditCard,
  Globe,
  Grid3X3,
  LayoutDashboard,
  ListChecks,
  Package,
  Printer,
  Receipt,
  Settings,
  Soup,
  Store,
  Sun,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from 'lucide-react';

const operationsIcons: Record<PosOperationsIconKey, React.ElementType> = {
  dashboard: LayoutDashboard,
  tables: Grid3X3,
  kitchenKds: ListChecks,
  openOrders: ClipboardList,
  dineIn: UtensilsCrossed,
  readyList: ListChecks,
  onlineOrders: Globe,
  duePayments: CircleDollarSign,
  checkoutPayment: CreditCard,
  menuAvailability: UtensilsCrossed,
  menuManager: Store,
  cashShift: Wallet,
  reports: BarChart3,
  mealReports: BarChart3,
  breakfastReport: Coffee,
  lunchReport: Sun,
  snacksReport: Soup,
  settings: Settings,
  setupHub: Wrench,
  staffRoles: Users,
  taxes: Receipt,
  devices: Printer,
};

const flowIcons: Record<PosFlowIconKey, React.ElementType> = {
  dashboard: LayoutDashboard,
  dineIn: UtensilsCrossed,
  openOrders: ClipboardList,
  onlineOrders: Globe,
  checkoutPayment: CreditCard,
  inventory: Package,
  financials: BarChart3,
  staff: Users,
  settings: Settings,
};

export function PosOperationsNavIcon({
  icon,
  className,
  size = 18,
}: Readonly<{
  icon: PosOperationsIconKey;
  className?: string;
  size?: number;
}>) {
  const Icon = operationsIcons[icon];
  return <Icon className={className} size={size} aria-hidden />;
}

export function PosFlowNavIcon({
  icon,
  className,
  size = 18,
}: Readonly<{
  icon: PosFlowIconKey;
  className?: string;
  size?: number;
}>) {
  const Icon = flowIcons[icon];
  return <Icon className={className} size={size} aria-hidden />;
}
