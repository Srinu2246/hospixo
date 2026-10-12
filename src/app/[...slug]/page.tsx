import type { ReactNode } from 'react';
import { PosDashboard } from '@/features/pos/point-of-sale/dashboard';
import { PosTableSelection } from '@/features/pos/point-of-sale/tables';
import { ReservationList, ReservationDetails } from '@/features/pos/point-of-sale/reservation';
import { AllOrdersPage, OrderSettle } from '@/features/pos/point-of-sale/all-orders';
import { TakeawayPage } from '@/features/pos/point-of-sale/takeaway';
import { ReadyListPage } from '@/features/pos/point-of-sale/ready-list';
import { DuePaymentsPage } from '@/features/pos/point-of-sale/due-payments';
import {
  CashAndShiftPage,
  CloseShiftPage,
  CloseShiftSuccessPage,
  CreateNewShiftPage,
} from '@/features/pos/point-of-sale/cash-and-shift';
import { UnderConstructionPage } from '@/components/shared/UnderConstruction';
import {
  UsersAndRolesScreen,
  CreateUserMultiformFlow,
  EditStaffProfileScreen,
  CreateCustomTemplateScreen,
} from '@/features/employees/user-roles';
import { DashboardScreen } from '@/features/dashboard';
import { FloorSetupScreen } from '@/features/management/floor-and-table-setup';

interface CatchAllPageProps {
  params: {
    slug: string[];
  };
}

interface RouteDefinition {
  name: string;
  match: (path: string, slug: string[]) => boolean;
  render: (path: string, slug: string[]) => ReactNode;
}

/**
 * Declarative route registry for dynamic sidebar prefix paths and wildcards.
 * Emulates clean declarative route mapping (like React Router) while providing
 * fallback routing for multi-tenant and nested branch manager prefixes.
 */
const ROUTE_REGISTRY: readonly RouteDefinition[] = [
  // 1. POS Cash Shift Subroutes & Dashboard (evaluated before generic /success and /checkout rules)
  {
    name: 'POS Close Shift Success',
    match: (path) =>
      path.endsWith('pos/point-of-sale/cash-shift/close/success') ||
      path.endsWith('pos/point-of-sale/cash-shift/success'),
    render: () => <CloseShiftSuccessPage />,
  },
  {
    name: 'POS Close Shift',
    match: (path) => path.endsWith('pos/point-of-sale/cash-shift/close'),
    render: () => <CloseShiftPage />,
  },
  {
    name: 'POS Create New Shift',
    match: (path) => path.endsWith('pos/point-of-sale/cash-shift/new'),
    render: () => <CreateNewShiftPage />,
  },
  {
    name: 'POS Cash Shift',
    match: (path) => path.endsWith('pos/point-of-sale/cash-shift'),
    render: () => <CashAndShiftPage />,
  },

  // POS Checkout: .../checkout (e.g. /pos/point-of-sale/takeaway/checkout, .../dine-in/t-1/checkout)
  {
    name: 'POS Checkout',
    match: (path) => path.endsWith('/checkout') || path.endsWith('checkout'),
    render: (_, slug) => {
      const tableId =
        slug.length >= 3 &&
        slug[slug.length - 1] === 'checkout' &&
        !['dine-in', 'tables', 'takeaway', 'take-away', 'order-menu'].includes(
          slug[slug.length - 2],
        )
          ? slug[slug.length - 2]
          : undefined;
      return <OrderSettle initialStep="checkout" orderId={tableId} />;
    },
  },

  {
    name: 'Floor and Table Setup',
    match: (path) =>
      path.endsWith('floor-and-table-setup') || path.includes('floor-and-table-setup/'),
    render: () => <FloorSetupScreen />,
  },

  // POS Payment Success: .../success or .../payment-success
  {
    name: 'POS Payment Success Receipt',
    match: (path) =>
      !path.includes('cash-shift') &&
      !path.includes('floor-and-table-setup') &&
      (path.endsWith('/success') ||
        path.endsWith('success') ||
        path.endsWith('/payment-success') ||
        path.endsWith('payment-success')),
    render: (_, slug) => {
      const last = slug[slug.length - 1];
      const tableId =
        slug.length >= 3 &&
        (last === 'success' || last === 'payment-success') &&
        !['dine-in', 'tables', 'takeaway', 'take-away', 'order-menu'].includes(
          slug[slug.length - 2],
        )
          ? slug[slug.length - 2]
          : undefined;
      return <OrderSettle initialStep="success" orderId={tableId} />;
    },
  },

  // 1. Order Settle: .../pos/point-of-sale/all-orders/[orderId]
  {
    name: 'Order Settle',
    match: (path, slug) => {
      return slug.length >= 2 && slug[slug.length - 2] === 'all-orders';
    },
    render: (_, slug) => {
      const orderId = slug[slug.length - 1];
      return <OrderSettle orderId={orderId} />;
    },
  },

  // 2. Reservation Details: .../pos/point-of-sale/reservation/[id]
  {
    name: 'Reservation Details',
    match: (path, slug) => {
      // Matches .../reservation/<id> where <id> is the final segment
      return slug.length >= 2 && slug[slug.length - 2] === 'reservation';
    },
    render: (_, slug) => {
      const reservationId = slug[slug.length - 1];
      return <ReservationDetails reservationId={reservationId} />;
    },
  },

  // 2. Reservation List
  {
    name: 'Reservation List',
    match: (path) => path.endsWith('pos/point-of-sale/reservation'),
    render: () => <ReservationList />,
  },

  // 3. POS Tables
  {
    name: 'POS Tables',
    match: (path) => path.endsWith('pos/point-of-sale/tables'),
    render: () => <PosTableSelection />,
  },

  // 4. POS Dashboard
  {
    name: 'POS Dashboard',
    match: (path) =>
      path.endsWith('pos/point-of-sale') || path.endsWith('pos/point-of-sale/dashboard'),
    render: () => <PosDashboard />,
  },

  // 5. POS Dine-In Table Order: .../pos/point-of-sale/dine-in/[tableId]
  {
    name: 'POS Dine In Table Order',
    match: (_, slug) => {
      return (
        slug.length >= 2 &&
        slug[slug.length - 2] === 'dine-in' &&
        slug[slug.length - 1] !== 'checkout'
      );
    },
    render: (_, slug) => {
      const tableId = slug[slug.length - 1];
      return <PosTableSelection isDineIn initialTableId={tableId} />;
    },
  },

  // 5. POS Dine-In (Floor Plan)
  {
    name: 'POS Dine In',
    match: (path) => path.endsWith('pos/point-of-sale/dine-in'),
    render: () => <PosTableSelection isDineIn />,
  },

  // POS Tables Table Order: .../pos/point-of-sale/tables/[tableId]
  {
    name: 'POS Table Detail Order',
    match: (_, slug) => {
      return (
        slug.length >= 2 &&
        slug[slug.length - 2] === 'tables' &&
        slug[slug.length - 1] !== 'checkout'
      );
    },
    render: (_, slug) => {
      const tableId = slug[slug.length - 1];
      return <PosTableSelection isDineIn={false} initialTableId={tableId} />;
    },
  },

  // POS Tables (Floor Plan)
  {
    name: 'POS Tables',
    match: (path) =>
      path.endsWith('pos/point-of-sale/tables') ||
      path.endsWith('pos/captain-flow/tables') ||
      path.endsWith('captain-flow/tables'),
    render: () => <PosTableSelection isDineIn={false} />,
  },

  // Captain Flow Root -> Tables
  {
    name: 'Captain Flow',
    match: (path) => path.endsWith('pos/captain-flow') || path.endsWith('captain-flow'),
    render: () => <PosTableSelection isDineIn={false} />,
  },

  // 6. POS Take Away / Order Menu
  {
    name: 'POS Take Away / Captain Order Menu',
    match: (path) =>
      path.endsWith('pos/point-of-sale/takeaway') ||
      path.endsWith('pos/point-of-sale/take-away') ||
      path.endsWith('pos/captain-flow/order-menu') ||
      path.endsWith('captain-flow/order-menu'),
    render: () => <TakeawayPage mode="takeaway" />,
  },

  // 6. POS Ready List / Captain Ready List
  {
    name: 'POS Ready List',
    match: (path) =>
      path.endsWith('pos/point-of-sale/ready-list') ||
      path.endsWith('pos/captain-flow/ready-list') ||
      path.endsWith('captain-flow/ready-list'),
    render: () => <ReadyListPage />,
  },

  // 7. POS Online Orders
  {
    name: 'POS Online Orders',
    match: (path) => path.endsWith('pos/point-of-sale/online-orders'),
    render: () => (
      <UnderConstructionPage
        title="Online Orders"
        subtitle="Third-party aggregator integrations and delivery order queue"
      />
    ),
  },

  // 8. POS All Orders / Captain All Orders
  {
    name: 'POS All Orders',
    match: (path) =>
      path.endsWith('pos/point-of-sale/all-orders') ||
      path.endsWith('pos/captain-flow/all-orders') ||
      path.endsWith('captain-flow/all-orders') ||
      path.endsWith('pos/all-orders'),
    render: () => <AllOrdersPage />,
  },

  {
    name: 'Role POS Tables',
    match: (path) => path.endsWith('pos/tables'),
    render: () => <PosTableSelection isDineIn={false} />,
  },
  {
    name: 'Role POS Order Menu',
    match: (path) => path.endsWith('pos/order-menu'),
    render: () => <TakeawayPage mode="takeaway" />,
  },
  {
    name: 'Role POS Ready List',
    match: (path) => path.endsWith('pos/ready-list'),
    render: () => <ReadyListPage />,
  },

  // 10. POS Due Payments
  {
    name: 'POS Due Payments',
    match: (path) => path.endsWith('pos/point-of-sale/due-payments'),
    render: () => <DuePaymentsPage />,
  },

  // 11. Staff Profile: .../users-and-roles/{edit|profile}
  {
    name: 'Staff Profile',
    match: (path) =>
      path.includes('users-and-roles/edit') ||
      path.includes('users-and-roles/profile') ||
      path.includes('staff-profile'),
    render: (path) => {
      const mode = path.includes('profile') && !path.includes('edit') ? 'view' : 'edit';
      return <EditStaffProfileScreen initialMode={mode} />;
    },
  },

  // 12. Create Custom Template: .../users-and-roles/custom-template
  {
    name: 'Create Custom Template',
    match: (path) =>
      path.includes('users-and-roles/custom-template') || path.includes('custom-template'),
    render: () => <CreateCustomTemplateScreen />,
  },

  // 13. Create User Multiform: .../users-and-roles/{template|create|permissions|review|success}
  {
    name: 'Create User Multiform',
    match: (path) =>
      path.includes('users-and-roles/create') ||
      path.includes('users-and-roles/template') ||
      path.includes('users-and-roles/permissions') ||
      path.includes('users-and-roles/review') ||
      path.includes('users-and-roles/success'),
    render: (path) => {
      let step: 'template' | 'user-form' | 'permissions' | 'review' | 'success' = 'user-form';
      if (path.endsWith('/template')) step = 'template';
      else if (path.endsWith('/permissions')) step = 'permissions';
      else if (path.endsWith('/review')) step = 'review';
      else if (path.endsWith('/success')) step = 'success';
      return <CreateUserMultiformFlow initialStep={step} />;
    },
  },

  // 12. Users and Roles: .../users-and-roles, .../employees/users-and-roles, .../users, .../roles
  {
    name: 'Users and Roles',
    match: (path) =>
      path.endsWith('users-and-roles') ||
      path.endsWith('employees/users-and-roles') ||
      path === 'users' ||
      path.endsWith('/users') ||
      path === 'roles' ||
      path.endsWith('/roles') ||
      path === 'user-roles' ||
      path.endsWith('/user-roles'),
    render: () => <UsersAndRolesScreen />,
  },

  // 12. Main Dashboard: .../dashboard
  {
    name: 'Main Dashboard',
    match: (path) => path.endsWith('dashboard') && !path.includes('pos/point-of-sale'),
    render: () => <DashboardScreen />,
  },
];

export default function CatchAllPage({ params }: CatchAllPageProps) {
  const path = params.slug.join('/');

  for (const route of ROUTE_REGISTRY) {
    if (route.match(path, params.slug)) {
      return route.render(path, params.slug);
    }
  }

  return (
    <UnderConstructionPage
      title="Page Under Construction"
      subtitle={`The requested route /${path} is under construction.`}
    />
  );
}
