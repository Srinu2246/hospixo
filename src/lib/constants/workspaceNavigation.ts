import type { SvgIconComponent } from '@mui/icons-material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';

import { APP_ROUTES } from '@/lib/constants/routes';

export type WorkspaceNavItem = Readonly<{
  id: string;
  href: string;
  label: string;
  Icon: SvgIconComponent;
}>;

export type WorkspaceNavGroup = Readonly<{
  id: string;
  label?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: readonly WorkspaceNavItem[];
}>;

/** Organisation owner sidebar — mirrors Hospixo `organisationSidebar`. */
export const workspaceSidebarConfig = {
  brandName: 'Hospixo',
  profileRole: 'Organisation owner',
  homeHref: APP_ROUTES.dashboard,
  navAriaLabel: 'Organisation navigation',
  groups: [
    {
      id: 'home',
      items: [
        {
          id: 'dashboard',
          href: APP_ROUTES.dashboard,
          label: 'Dashboard',
          Icon: DashboardOutlinedIcon,
        },
      ],
    },
    {
      id: 'companies',
      label: 'Companies',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'all-companies',
          href: APP_ROUTES.companies,
          label: 'All Companies',
          Icon: BusinessOutlinedIcon,
        },
        {
          id: 'add-company',
          href: APP_ROUTES.companiesNew,
          label: 'Add Company',
          Icon: AddOutlinedIcon,
        },
        {
          id: 'company-analytics',
          href: APP_ROUTES.companiesAnalytics,
          label: 'Company Analytics',
          Icon: AssessmentOutlinedIcon,
        },
      ],
    },
    {
      id: 'branches',
      label: 'Branches',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'all-branches',
          href: APP_ROUTES.branches,
          label: 'All Branches',
          Icon: StorefrontOutlinedIcon,
        },
        {
          id: 'add-branch',
          href: APP_ROUTES.branchesNew,
          label: 'Add Branch',
          Icon: AddOutlinedIcon,
        },
        {
          id: 'branch-performance',
          href: APP_ROUTES.branchesPerformance,
          label: 'Branch Performance',
          Icon: AssessmentOutlinedIcon,
        },
      ],
    },
    {
      id: 'employees',
      label: 'Employees',
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          id: 'users-roles',
          href: APP_ROUTES.dashboardTeam,
          label: 'Users & Roles',
          Icon: GroupsOutlinedIcon,
        },
        {
          id: 'attendance',
          href: APP_ROUTES.attendance,
          label: 'Attendance',
          Icon: ScheduleOutlinedIcon,
        },
      ],
    },
    {
      id: 'menu',
      label: 'Menu',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'menu-creation',
          href: APP_ROUTES.menuCreation,
          label: 'Menu Creation',
          Icon: RestaurantMenuOutlinedIcon,
        },
        {
          id: 'menus',
          href: APP_ROUTES.menus,
          label: 'Menus',
          Icon: CalendarMonthOutlinedIcon,
        },
        {
          id: 'menu-builder',
          href: APP_ROUTES.menuBuilder,
          label: 'Menu Builder',
          Icon: StyleOutlinedIcon,
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'sales',
          href: APP_ROUTES.reportsSales,
          label: 'Sales',
          Icon: AssessmentOutlinedIcon,
        },
        {
          id: 'revenue',
          href: APP_ROUTES.reportsRevenue,
          label: 'Revenue',
          Icon: AttachMoneyOutlinedIcon,
        },
        {
          id: 'expenses',
          href: APP_ROUTES.reportsExpenses,
          label: 'Expenses',
          Icon: ReceiptLongOutlinedIcon,
        },
        {
          id: 'taxes',
          href: APP_ROUTES.reportsTaxes,
          label: 'Taxes',
          Icon: PercentOutlinedIcon,
        },
        {
          id: 'analytics',
          href: APP_ROUTES.analytics,
          label: 'Analytics',
          Icon: AnalyticsOutlinedIcon,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          id: 'org-settings',
          href: APP_ROUTES.settingsOrganisation,
          label: 'Organization Settings',
          Icon: SettingsOutlinedIcon,
        },
        {
          id: 'subscription',
          href: APP_ROUTES.settingsBilling,
          label: 'Subscription',
          Icon: CreditCardOutlinedIcon,
        },
        {
          id: 'integrations',
          href: APP_ROUTES.settingsIntegrations,
          label: 'Integrations',
          Icon: ExtensionOutlinedIcon,
        },
      ],
    },
  ] satisfies readonly WorkspaceNavGroup[],
} as const;

export const workspaceUserProfile = {
  displayName: 'SHAMBALLI',
  roleLabel: 'Organisation owner',
  initials: 'S',
} as const;

export const workspaceCompanies = [
  { id: '', name: 'Select company' },
  { id: 'co-1', name: 'Demo Hospitality Co.' },
] as const;

export function flattenWorkspaceNavItems(): WorkspaceNavItem[] {
  return workspaceSidebarConfig.groups.flatMap((group) => [...group.items]);
}

export function resolveWorkspacePageTitle(pathname: string): string {
  const item = flattenWorkspaceNavItems().find((entry) => entry.href === pathname);
  if (item) {
    return item.label;
  }
  if (pathname === APP_ROUTES.dashboardSettings) {
    return 'Settings';
  }
  const segment = pathname.split('/').filter(Boolean).pop();
  if (!segment) {
    return 'Workspace';
  }
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
