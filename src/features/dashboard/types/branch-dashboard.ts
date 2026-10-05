import type {
  DashboardBreakdownItem,
  DashboardExpenseItem,
  DashboardLeakageGroup,
  DashboardMetric,
} from '@/features/dashboard/types';

export type BranchDashboardPeriod = 'today' | 'yesterday' | 'week';

export type BranchOrderTypeRow = Readonly<{
  id: string;
  label: string;
  sales: number;
  orders: number;
  color: string;
}>;

export type BranchOnlinePlatformId = 'zomato' | 'swiggy' | 'growthfalcons';

export type BranchOnlinePlatformRow = Readonly<{
  id: BranchOnlinePlatformId;
  platform: string;
  orders: number;
}>;

export type BranchDashboardOverview = Readonly<{
  outletName: string;
  lowStockAlert: Readonly<{
    lowCount: number;
    outOfStockCount: number;
    inventoryHref: string;
  }>;
  kpis: Readonly<{
    totalSales: DashboardMetric;
    netSales: DashboardMetric;
    onlineSales: DashboardMetric;
    offlineSales: DashboardMetric;
  }>;
  paymentBreakdown: Readonly<{
    total: number;
    items: readonly DashboardBreakdownItem[];
  }>;
  salesByOrderType: readonly BranchOrderTypeRow[];
  salesSummary: Readonly<{
    totalOrders: number;
    totalSales: number;
  }>;
  onlineOrders: Readonly<{
    totalSales: number;
    totalOrders: number;
    platforms: readonly BranchOnlinePlatformRow[];
  }>;
  orderTypeSummary: readonly BranchOrderTypeRow[];
  expenses: Readonly<{
    headerAmount: number;
    changePercent: number;
    changeLabel: string;
    items: readonly DashboardExpenseItem[];
    total: number;
  }>;
  leakage: Readonly<{
    kots: DashboardLeakageGroup;
    bills: DashboardLeakageGroup;
  }>;
  accountManager: Readonly<{
    name: string;
    role: string;
    phone: string;
    online: boolean;
    outletId: string;
    supportHours: string;
    supportMessage: string;
  }>;
}>;

export type BranchDashboardDisplayData = BranchDashboardOverview &
  Readonly<{
    dateRangeLabel: string;
  }>;
