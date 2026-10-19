# Incomplete work — **feature-flag ON only**

Only features whose GrowthBook / MVP default is **ON** (`FEATURE_FLAG_DEFAULTS = true`).  
Hidden (flag OFF) nav items are excluded.

Format: role → feature → subfeature → UI / API completed vs incomplete (with endpoints when API is done).

---

## Captain / Waiter

### Tables

**Flag:** `captain_pos_tables_nav`

#### Floor / table view

```
UI Completed:
  - Floor plan view
  - Filter tables by status
  - Select table / open order entry
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/branches/{branch_id}/floors?status=active
  - GET /v1/branches/{branch_id}/floors/{floor_id}/sections
  - GET /v1/branches/{branch_id}/sections/{section_id}/tables
  - GET /v1/branches/{branch_id}/orders?status=open&order_type=dine_in
---------------------
API Incomplete:
  - Reserve / free table (local only)
  - Create order on table select (no POST)
```

---

### Orders

**Flag:** `captain_pos_orders_nav`

#### Orders list

```
UI Completed:
  - List orders
  - Search / filter
  - Open order detail / settle / add items navigation
---------------------
UI Incomplete:
  - Report download (placeholder)
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - List uses mocks only (catalog GET /v1/pos/point-of-sale/all-orders unused)
```

#### Settle / pay

```
UI Completed:
  - Checkout UI
  - Payment method UI
  - Success receipt UI
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Confirm payment (local timeout only — no settle API)
```

---

### Ready Orders

**Flag:** `captain_pos_readyOrders_nav`

#### Ready queue

```
UI Completed:
  - Ready list cards
  - Mark served (UI)
  - View details
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - List mock-only
  - Serve not synced to KDS kitchen-status
```

---

## Cashier

### New Order

**Flag:** `cashier_pos_newOrder_nav`

#### Tables → order

```
UI Completed:
  - Table selection
  - Open table / start order
  - Menu browse + cart UI (takeaway flow)
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - Same floor/table/open-order GETs as Captain Tables
  - GET /v1/restaurant/menu/categories
  - GET /v1/restaurant/menu/items
---------------------
API Incomplete:
  - Create / update order (no POST)
  - Send KOT / cart persist
```

---

### Orders

**Flag:** `cashier_pos_orders_nav`

#### Orders list

```
UI Completed:
  - List / filter / open order
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Mock list only
```

---

### Dine-In

**Flag:** `cashier_pos_dineIn_nav`

#### Dine-in floor

```
UI Completed:
  - Dine-in floor mode
  - Select table → order
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - Same floor/table/open-order GETs as Tables
---------------------
API Incomplete:
  - Same order-create gaps as New Order
```

---

### Billing

**Flag:** `cashier_pos_billing_nav`

#### Bill / settle

```
UI Completed:
  - Billing entry (orders settle UI)
  - Bill preview / payment method / receipt screens
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Persist payment / settle totals
```

---

### Cash Counter

**Flag:** `cashier_pos_cashCounter_nav`

#### Shift open / close

```
UI Completed:
  - Shift dashboard
  - Open shift form
  - Close shift form
  - Success screen
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Open / close session API (local navigation + mocks)
```

---

## Kitchen Manager

### Kitchen Display

**Flag:** `kitchen_kds_display_nav`

#### KDS board

```
UI Completed:
  - Ticket columns / cards
  - Start preparing
  - Mark ready
  - Complete
---------------------
UI Incomplete:
  - Demo/stat fallbacks; stations hardcoded; recall UI not durable
---------------------
API Completed:
  - GET /v1/branches/{branch_id}/kitchen-board
  - PATCH /v1/branches/{branch_id}/orders/{order_id}/kitchen-status
    (start_preparing | mark_ready | complete)
---------------------
API Incomplete:
  - Live prep-stations list (catalog /v1/restaurant/preparation-stations unused)
  - Recall API
  - Empty board falls back to mocks
```

---

## Branch Manager

### Dashboard

**Flag:** `branch_home_dashboard_nav`

#### Branch home dashboard

```
UI Completed:
  - Dashboard layout / widgets
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Live metrics (mocks only; catalog GET /v1/dashboard/branch unused)
```

---

### Users & Roles

**Flag:** `branch_employees_usersAndRoles_nav`

#### List

```
UI Completed:
  - User list
  - Search / filters
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/users
  - GET /v1/roles (labels)
---------------------
API Incomplete:
  - —
```

#### Add user

```
UI Completed:
  - Multi-step wizard (template → permissions → review → success)
  - Create custom role template
---------------------
UI Incomplete:
  - Invite / personal message fields not sent in body
---------------------
API Completed:
  - POST /v1/users
  - GET /v1/roles
  - GET /v1/roles/templates
  - GET /v1/permissions/grouped
  - GET /v1/roles/{role_id}/permissions
  - PUT|POST /v1/users/{id}/roles
  - GET /v1/users/{id}/assignments
  - PUT /v1/users/{id}/roles/{user_role_id}/permissions
  - POST /v1/roles
  - PUT /v1/roles/{id}/permissions
---------------------
API Incomplete:
  - —
```

#### Edit user

```
UI Completed:
  - Edit / view profile screens
  - Change roles / permissions UI
---------------------
UI Incomplete:
  - No userId in URL (Zustand only — refresh loses selection)
  - Permission toggles not seeded from assigned grants
---------------------
API Completed:
  - GET /v1/users/{id}
  - PUT /v1/users/{id}
  - PUT|POST /v1/users/{id}/roles
  - PUT /v1/users/{id}/roles/{user_role_id}/permissions (on save)
---------------------
API Incomplete:
  - GET current user-role permissions (hydrate edit)
```

#### Deactivate user

```
UI Completed:
  - Disable / status change from UI
---------------------
UI Incomplete:
  - Hard delete not available (UI says remove → disable)
---------------------
API Completed:
  - PATCH /v1/users/{id}/status
---------------------
API Incomplete:
  - DELETE /v1/users/{id}
  - Role update / delete (PUT|DELETE /v1/roles/{id} unused)
```

---

### Point of Sale

**Flag:** `branch_pos_pointOfSale_nav` (workspace launcher)

#### Tables

**Also:** `branch_pos_tables_nav`

```
UI Completed:
  - Floor tables · open order
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET floors / sections / tables / open dine-in orders (same as Captain)
---------------------
API Incomplete:
  - Order create on select
```

#### Dine In

**Also:** `branch_pos_dineIn_nav`

```
UI Completed:
  - Dine-in floor mode
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - Same GETs as Tables
---------------------
API Incomplete:
  - Order create
```

#### Take Away

**Also:** `branch_pos_takeAway_nav`

```
UI Completed:
  - Menu catalog · cart · checkout UI
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/restaurant/menu/categories
  - GET /v1/restaurant/menu/items
---------------------
API Incomplete:
  - Create order / payment
```

#### Ready List

**Also:** `branch_pos_readyList_nav`

```
UI Completed:
  - Ready queue · serve UI
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Mock list; no KDS sync
```

#### All Orders

**Also:** `branch_pos_allOrders_nav`

```
UI Completed:
  - List · filter · open · settle navigation
---------------------
UI Incomplete:
  - Report download placeholder
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Mock list; settle not persisted
```

#### Cash Shift

**Also:** `branch_pos_cashShift_nav`

```
UI Completed:
  - Open shift · close shift · dashboard
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Session open/close API
```

#### Due Payments

**Also:** `branch_pos_duePayments_nav`

```
UI Completed:
  - Due list UI
---------------------
UI Incomplete:
  - Settle does not persist
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - Mock data only
```

---

### Menu

#### Menu hub

**Flag:** `branch_menu_hub_nav`

```
UI Completed:
  - Menu sidebar section visible
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - — (nav only)
---------------------
API Incomplete:
  - —
```

#### Menu Creation

**Flag:** `branch_menu_creation_nav`

```
UI Completed:
  - List items
  - Add item form
  - Edit item form
  - View item
  - Deactivate item (wired)
  - Category UI
---------------------
UI Incomplete:
  - Variants / modifiers / prep assignment not fully persisted on save
---------------------
API Completed:
  - GET /v1/restaurant/menu/categories
  - GET /v1/restaurant/menu/items
  - GET /v1/restaurant/menu/items/{item_id}
  - POST /v1/restaurant/menu/items/{item_id}/deactivate
---------------------
API Incomplete:
  - POST /v1/restaurant/menu/categories (add category — local)
  - POST /v1/restaurant/menu/items (add item — local)
  - PUT /v1/restaurant/menu/items/{id} (edit item — local)
```

#### Menus (sessions)

**Flag:** `branch_menu_menus_nav`

```
UI Completed:
  - List sessions
  - Add session form
  - Edit session form
  - Activate / deactivate toggle (UI)
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/restaurant/branches/{branch_id}/menus
---------------------
API Incomplete:
  - POST create session
  - PUT/PATCH edit session
  - Status toggle (cache-only today)
```

#### Menu Availability

**Flag:** `branch_menu_availability_nav`

```
UI Completed:
  - List items by category
  - Mark available / 86
  - Update availability action (UI)
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET categories + items (seed list)
---------------------
API Incomplete:
  - Persist availability / 86 writes
```

---

### Management

#### Kitchen Display

**Flag:** `branch_management_kitchenDisplay_nav`

```
UI Completed / Incomplete / API:
  - Same as Kitchen Manager → Kitchen Display
```

#### Cash Counter

**Flag:** `branch_management_cashCounter_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Management href Under Construction (use POS Cash Shift screen)
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No management cash-counter API
```

#### Reports

**Flag:** `branch_management_reports_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Sidebar path Under Construction (mock hub at /reports not linked)
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No reports API
```

#### Settings

**Flag:** `branch_management_settings_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No branch settings API
```

---

## Company Admin

### Dashboard

**Flag:** `company_home_dashboard_nav`

```
UI Completed:
  - Company dashboard layout
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/branches?company_id=… (directory)
  - Fallback platform company branches
---------------------
API Incomplete:
  - Live KPI charts (mocks; GET /v1/dashboard/company unused)
```

---

### Branches

**Flag:** `company_branches_allBranches_nav`

#### List branches

```
UI Completed:
  - Branches list
  - Open / switch branch context
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/branches?company_id=…
  - Fallback GET /v1/platform/organizations/{org}/companies/{company}/branches
---------------------
API Incomplete:
  - —
```

---

### Users & Roles

**Flag:** `company_employees_usersAndRoles_nav`

```
UI Completed / Incomplete / API:
  - Same subfeatures as Branch → Users & Roles
    (List · Add · Edit · Deactivate — same endpoints)
```

---

### Menu

#### Menu Creation

**Flag:** `company_menu_creation_nav`

```
UI Completed / Incomplete / API:
  - Same as Branch → Menu Creation
    (List · Add · Edit · View · Deactivate)
```

#### Menus

**Flag:** `company_menu_menus_nav`

```
UI Completed / Incomplete / API:
  - Same as Branch → Menus sessions
    (List · Add · Edit · Activate/Deactivate)
```

---

### Operations

#### Orders

**Flag:** `company_operations_order_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No company orders review API
```

---

### Reports

#### Sales

**Flag:** `company_reports_sales_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No sales report API
```

---

### Settings

#### Company Settings

**Flag:** `company_settings_companySettings_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No company settings API
```

---

## Organization Admin

### Dashboard

**Flag:** `org_home_dashboard_nav`

```
UI Completed:
  - Org dashboard layout
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v2/platform/organizations/{organization_id}/companies
---------------------
API Incomplete:
  - Live org KPIs (mocks; GET /v1/dashboard/organization unused)
```

---

### Companies

**Flag:** `org_companies_allCompanies_nav`

#### List companies

```
UI Completed:
  - Companies list
  - Drill into company
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v2/platform/organizations/{organization_id}/companies
---------------------
API Incomplete:
  - —
```

---

### Branches

**Flag:** `org_branches_allBranches_nav`

#### List branches

```
UI Completed:
  - Org-wide branches list
---------------------
UI Incomplete:
  - —
---------------------
API Completed:
  - GET /v1/branches?company_id=… (per company)
  - Fallback platform company branches
---------------------
API Incomplete:
  - —
```

---

### Users & Roles

**Flag:** `org_employees_usersAndRoles_nav`

```
UI Completed / Incomplete / API:
  - Same as Branch → Users & Roles
    (List · Add · Edit · Deactivate)
```

---

### Reports

#### Sales

**Flag:** `org_reports_sales_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No org sales report API
```

---

### Settings

#### Organization Settings

**Flag:** `org_settings_organizationSettings_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No org settings API
```

#### Subscription

**Flag:** `org_settings_subscription_nav`

```
UI Completed:
  - —
---------------------
UI Incomplete:
  - Under Construction (read-only intended)
---------------------
API Completed:
  - —
---------------------
API Incomplete:
  - No subscription API (dashboard mock card only)
```

---

## Flag-ON checklist (quick)

| Role    | Flag ON features                                                                                                                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Captain | Tables, Orders, Ready Orders                                                                                                                                                                    |
| Cashier | New Order, Orders, Dine-In, Billing, Cash Counter                                                                                                                                               |
| Kitchen | Kitchen Display                                                                                                                                                                                 |
| Branch  | Dashboard, Users & Roles, POS launcher + Tables/DineIn/TakeAway/Ready/AllOrders/CashShift/DuePayments, Menu hub + Creation/Menus/Availability, KDS, Cash Counter nav, Reports nav, Settings nav |
| Company | Dashboard, All Branches, Users & Roles, Menu Creation, Menus, Ops Orders, Sales report, Company Settings                                                                                        |
| Org     | Dashboard, All Companies, All Branches, Users & Roles, Sales report, Org Settings, Subscription                                                                                                 |

Chef has **no** sidebar flags (sidebarless KDS).

---

_Source of ON flags: `src/integrations/growthbook/featureFlags.ts` → `FEATURE_FLAG_DEFAULTS`._
