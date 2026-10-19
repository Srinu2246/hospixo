# Feature Completeness Status (Role · Feature · Subfeature)

Generated from the current `hospixo_client` codebase (UI screens, hooks, `ApiUrlsV1`, catch-all routing).

**How to read**

- **UI Completed** — Screen built and usable (may still use mock data).
- **UI Incomplete** — Missing screen, Under Construction, or major UX gaps.
- **API Completed** — Live HTTP wired from hooks/UI (endpoints listed).
- **API Incomplete** — Mock-only, catalog-only, partial write, or not started.

Shared POS / Menu / KDS screens are reused across roles; status is repeated under each role that sees that nav item.

---

## Captain / Waiter / Server / Host

### Tables

#### Floor table selection

- **UI Completed:**
  - Floor plan, status filters, open table → order menu (`PosTableSelection`)
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v1/branches/{branch_id}/floors?status=active`
  - `GET /v1/branches/{branch_id}/floors/{floor_id}/sections`
  - `GET /v1/branches/{branch_id}/sections/{section_id}/tables`
  - `GET /v1/branches/{branch_id}/orders?status=open&order_type=dine_in`
- **API Incomplete:**
  - Reserve / serve table mutations (local only)
  - Create order on table select (no POST)

### Orders

#### All orders list

- **UI Completed:**
  - List, filters, search, navigate to settle / add items
- **UI Incomplete:**
  - Report download (placeholder)
- **API Completed:**
  - —
- **API Incomplete:**
  - List bound to mocks (`usePosOrders.mocks`); catalog `GET /v1/pos/point-of-sale/all-orders` unused by UI

#### Order settle / payment / receipt

- **UI Completed:**
  - Checkout, payment method UI, success receipt
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Confirm payment is local timeout only (no settle / tender API)

### Ready Orders

#### Ready list

- **UI Completed:**
  - Ready queue cards, serve/view UI
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Mock list only; not synced to KDS `kitchen-status`; catalog `GET /v1/pos/point-of-sale/ready-list` unused

### Dine-In (nav — MVP flag off)

#### Order menu (captain order-menu)

- **UI Completed:**
  - Same as takeaway menu catalog + cart (`TakeawayPage`)
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v1/restaurant/menu/categories`
  - `GET /v1/restaurant/menu/items`
- **API Incomplete:**
  - Cart / KOT / order create-update (local only)

---

## Cashier / Counter Staff

### New Order

#### Tables / takeaway entry

- **UI Completed:**
  - Tables + takeaway / dine-in order UI
- **UI Incomplete:**
  - —
- **API Completed:**
  - Floors / sections / tables / open orders (same as Captain Tables)
  - Menu categories / items (same as order menu)
- **API Incomplete:**
  - Order create / pay (same gaps as POS)

### Orders

#### All orders + billing alias

- **UI Completed:**
  - All Orders screen; Billing nav points to same list
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Mock list; no settle API

### Dine-In

#### Floor dine-in mode

- **UI Completed:**
  - `DineInPage` → `PosTableSelection isDineIn`
- **UI Incomplete:**
  - —
- **API Completed:**
  - Same floor/table/open-order GETs as Tables
- **API Incomplete:**
  - Same mutation gaps as Tables

### Billing

#### Settle / receipt

- **UI Completed:**
  - Order settle flow UI
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Payment confirm not persisted

### Cash Counter

#### Cash & shift

- **UI Completed:**
  - Dashboard, open shift, close shift, success screens
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Local navigation / mock metrics only; no `pos_sessions` open/close API; catalog `GET /v1/pos/point-of-sale/cash-and-shift` unused

### Dashboard (MVP flag off)

#### POS dashboard

- **UI Completed:**
  - Metrics / live widgets from mocks
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Mock only; catalog `GET /v1/pos/point-of-sale/dashboard` unused

### Payments (MVP flag off)

#### Due payments

- **UI Completed:**
  - Due list UI
- **UI Incomplete:**
  - Settle action does not persist
- **API Completed:**
  - —
- **API Incomplete:**
  - Mock slice only; catalog `GET /v1/pos/point-of-sale/due-payments` unused

### Customers (MVP flag off)

#### Customers CRM

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction (no feature module)
- **API Completed:**
  - —
- **API Incomplete:**
  - No customers API catalog or hooks

### Reports (MVP flag off)

#### Cashier reports nav

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction at management reports path
- **API Completed:**
  - —
- **API Incomplete:**
  - No reports API; orphan mock hub at `/reports` not linked from this nav

---

## Kitchen Manager / Kitchen Staff

### Kitchen Display

#### KDS board

- **UI Completed:**
  - Columns, cards, start / ready / complete actions, header/footer chrome
- **UI Incomplete:**
  - Demo badge / hardcoded stat fallbacks; load/error not always surfaced; stations static
- **API Completed:**
  - `GET /v1/branches/{branch_id}/kitchen-board`
  - `PATCH /v1/branches/{branch_id}/orders/{order_id}/kitchen-status` (`start_preparing`, `mark_ready`, `complete`)
- **API Incomplete:**
  - Preparation stations live list (`/v1/restaurant/preparation-stations` catalog unused)
  - Recall (optimistic UI only)
  - Empty/fail falls back to mock orders

### Incoming / Preparing / Ready (nav aliases — MVP flags off)

#### Separate sidebar entries

- **UI Completed:**
  - Same KDS URL (Incoming / Preparing) or Ready List screen
- **UI Incomplete:**
  - Not true separate tabs wired as distinct destinations (Ready List still mock)
- **API Completed:**
  - KDS endpoints above (when on KDS)
- **API Incomplete:**
  - Ready List mock-only (see Captain Ready Orders)

---

## Chef

### Kitchen Display

#### Full-screen KDS (no sidebar)

- **UI Completed:**
  - Role is sidebarless; can open KDS if routed
- **UI Incomplete:**
  - No dedicated chef station picker / chrome beyond empty sidebar; theme toggle absent (no top navbar)
- **API Completed:**
  - Same as Kitchen Display when on KDS
- **API Incomplete:**
  - Same KDS gaps (stations, recall, mock fallback)

---

## Branch Manager / Store Manager

### Home

#### Branch dashboard

- **UI Completed:**
  - `BranchSalesDashboard` UI
- **UI Incomplete:**
  - —
- **API Completed:**
  - —
- **API Incomplete:**
  - Sales/ops metrics mock; catalog `GET /v1/dashboard/branch` unused by UI

### Employees

#### Users & Roles — list

- **UI Completed:**
  - Staff list, filters, navigate create/edit
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v1/users`
  - `GET /v1/roles` (labels)
- **API Incomplete:**
  - —

#### Users & Roles — create wizard

- **UI Completed:**
  - Multi-step create (template, permissions, review, success), custom template
- **UI Incomplete:**
  - Invite / personal message fields UI-only (not in POST body)
- **API Completed:**
  - `POST /v1/users`
  - `GET /v1/roles`
  - `GET /v1/roles/templates`
  - `GET /v1/permissions/grouped`
  - `GET /v1/roles/{role_id}/permissions`
  - `PUT` / `POST /v1/users/{id}/roles`
  - `GET /v1/users/{id}/assignments`
  - `PUT /v1/users/{id}/roles/{user_role_id}/permissions`
  - `POST /v1/roles` (custom role)
  - `PUT /v1/roles/{id}/permissions`
- **API Incomplete:**
  - —

#### Users & Roles — edit / profile

- **UI Completed:**
  - Edit / view profile screens
- **UI Incomplete:**
  - No `userId` in URL (Zustand only → refresh loses selection)
  - Permission toggles not seeded from assigned grants
- **API Completed:**
  - `GET /v1/users/{id}`
  - `PUT /v1/users/{id}`
  - `PATCH /v1/users/{id}/status`
  - `PUT` / `POST /v1/users/{id}/roles`
  - `PUT /v1/users/{id}/roles/{user_role_id}/permissions` (on save)
- **API Incomplete:**
  - No GET of current user-role permissions to hydrate edit UI
  - Hard delete unused (`DELETE /v1/users/{id}`); UI “remove” disables via status
  - Role update / delete unused (`PUT` / `DELETE /v1/roles/{id}`)

#### Attendance

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No HR attendance API

#### Schedule

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No schedule API

### POS

#### Point of Sale launcher + workspace

- **UI Completed:**
  - Dashboard, Tables, Dine In, Take Away, Ready List, All Orders, Cash Shift, Due Payments, Reservation UIs
- **UI Incomplete:**
  - Online Orders → Under Construction
- **API Completed:**
  - Tables / dine-in: floors, sections, tables, open orders (see Captain)
  - Takeaway menu: categories / items
  - (See Cashier/Captain for each subfeature detail)
- **API Incomplete:**
  - Dashboard, reservation, ready list, all orders, due payments, cash shift: mock-only
  - Order create / settle: missing
  - Catalog `ApiUrlsV1.pos.pointOfSale.*` mostly unused by screens
  - Online Orders: no API

#### Captain Flow (under BM — MVP flag off)

- **UI Completed:**
  - Reuses Captain POS screens
- **UI Incomplete:**
  - —
- **API Completed / Incomplete:**
  - Same as Captain section

### Orders hub (duplicate `/branch-manager/orders/*` — MVP flags off)

#### Online / Live / Ready / All hub

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction (not wired to POS All Orders)
- **API Completed:**
  - —
- **API Incomplete:**
  - No dedicated hub APIs

### Menu

#### Menu Creation

- **UI Completed:**
  - Catalog layout, item table, create/edit/view item, category UI, deactivate
- **UI Incomplete:**
  - Create/update item & category saves are often local state
- **API Completed:**
  - `GET /v1/restaurant/menu/categories`
  - `GET /v1/restaurant/menu/items`
  - `GET /v1/restaurant/menu/items/{item_id}`
  - `POST /v1/restaurant/menu/items/{item_id}/deactivate`
- **API Incomplete:**
  - `POST /v1/restaurant/menu/categories` (catalog unused from UI)
  - `POST /v1/restaurant/menu/items`
  - `PUT /v1/restaurant/menu/items/{id}`

#### Menus (sessions)

- **UI Completed:**
  - List, search/filter, create/edit forms, status toggle
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v1/restaurant/branches/{branch_id}/menus`
- **API Incomplete:**
  - Create / edit / status = React Query cache only (no POST/PATCH)

#### Menu Availability

- **UI Completed:**
  - Channel UI, category sidebar, 86 / available table
- **UI Incomplete:**
  - Persist “Update availability” (local marks)
- **API Completed:**
  - Read seed: `GET` menu categories + items
- **API Incomplete:**
  - No dedicated availability write API wired

#### GST Rates (MVP flag off)

- **UI Completed:**
  - List, create, detail
- **UI Incomplete:**
  - No update/delete UI
- **API Completed:**
  - `GET /v1/restaurant/gst-rates`
  - `GET /v1/restaurant/gst-rates/{gst_rate_id}`
  - `POST /v1/restaurant/gst-rates`
- **API Incomplete:**
  - Update / deactivate / delete

#### Prep Stations (MVP flag off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - Catalog only: `/v1/restaurant/preparation-stations` (no hooks/UI)

#### Modifier Groups (MVP flag off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - Nested on menu item response only; no CRUD resource

### Management

#### Kitchen Display

- **UI Completed / API:** Same as Kitchen Manager KDS

#### Cash Counter

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Management path Under Construction (POS `cash-shift` is the developed screen)
- **API Completed:**
  - —
- **API Incomplete:**
  - No management cash-counter API

#### Floor & Table Set-up (MVP flag off)

- **UI Completed:**
  - Hub, wizard, floor detail panels
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET|POST /v1/branches/{branchId}/floors`
  - `GET|PATCH /v1/branches/{branchId}/floors/{floorId}`
  - `POST …/floors/{floorId}/archive|restore`
  - `GET|POST …/floors/{floorId}/sections`
  - `PATCH …/sections/{sectionId}`
  - `POST …/sections/{sectionId}/archive|restore`
  - `GET|POST …/sections/{sectionId}/tables`
  - `GET|PATCH …/tables/{tableId}`
  - `POST|PATCH …/tables/bulk`
  - `GET …/sections/{sectionId}/floor-map`
  - `POST …/tables/{tableId}/move|archive|restore`
- **API Incomplete:**
  - —

#### Tables / Dine-In (management paths — MVP flags off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction (use POS Tables / Dine-In)
- **API Completed:**
  - —
- **API Incomplete:**
  - —

#### Due Payments (management — MVP flag off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction (POS Due Payments UI exists elsewhere)
- **API Completed:**
  - —
- **API Incomplete:**
  - —

#### Inventory / Customers

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No inventory / customers APIs

#### Reports

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Sidebar path Under Construction; mock hub exists at `/reports` (not linked)
- **API Completed:**
  - —
- **API Incomplete:**
  - No reports API

#### Settings

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No branch settings API

---

## Company Admin / Owner

### Home

#### Company dashboard

- **UI Completed:**
  - `CompanyDashboard` layout
- **UI Incomplete:**
  - —
- **API Completed:**
  - Branch directory: `GET /v1/branches?company_id=…` (+ platform org/company branches fallback)
- **API Incomplete:**
  - KPI / charts mock; catalog `GET /v1/dashboard/company` unused

### Branches

#### All Branches

- **UI Completed:**
  - `BranchesPage` (company scope)
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v1/branches?company_id=…`
  - Fallback: `GET /v1/platform/organizations/{org}/companies/{company}/branches`
- **API Incomplete:**
  - —

#### Branch Analytics / Manage Performance (MVP flags off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No analytics APIs

### Employees

#### Users & Roles

- **UI Completed / API:** Same as Branch Manager Users & Roles (scoped company)

#### Attendance (MVP flag off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - —

### Menu

#### Menu Creation / Menus

- **UI Completed / API:** Same as Branch Menu Creation / Menus (company-scoped routes)

#### Menu Availability / Builder / Management / GST / Prep / Modifiers

- **UI Completed:**
  - Availability + GST screens exist when flags on; Builder / Management / Prep / Modifiers Under Construction
- **UI Incomplete:**
  - Same write gaps as branch menu; stubs for builder/management/prep/modifiers
- **API Completed:**
  - Same reads as branch menu / GST where wired
- **API Incomplete:**
  - Same write gaps; no prep/modifier CRUD

### Operations

#### Orders

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No company orders review API

#### Kitchen Display

- **UI Completed / API:** Same as KDS (branch context)

#### Cash Counter / Inventory / Customers (MVP flags off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - —

### Reports

#### Sales / Revenue / Analytics

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction at `/company/report/*` (mock `/reports` hub unused by sidebar)
- **API Completed:**
  - —
- **API Incomplete:**
  - No company reports API

### Settings

#### Company Settings

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No company settings API

---

## Organization Owner / Tenant Admin

### Home

#### Organization dashboard

- **UI Completed:**
  - `OrganizationDashboard` layout
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v2/platform/organizations/{organization_id}/companies`
  - Branches via company branch loaders (same as Companies/Branches helpers)
- **API Incomplete:**
  - Stats / AI / subscription cards mock; catalog `GET /v1/dashboard/organization` unused

### Companies

#### All Companies

- **UI Completed:**
  - `CompaniesPage`
- **UI Incomplete:**
  - —
- **API Completed:**
  - `GET /v2/platform/organizations/{organization_id}/companies`
- **API Incomplete:**
  - —

#### Add Company / Company Analytics (MVP flags off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - No create-company / analytics API from UI

### Branches

#### All Branches

- **UI Completed:**
  - `BranchesPage` (organization scope)
- **UI Incomplete:**
  - —
- **API Completed:**
  - Per company: `GET /v1/branches?company_id=…`
  - Fallback: `GET /v1/platform/organizations/{org}/companies/{company}/branches`
- **API Incomplete:**
  - —

#### Add Branch / Branch Performance (MVP flags off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - —

### Employees

#### Users & Roles

- **UI Completed / API:** Same as Branch/Company Users & Roles (org scope)

#### Attendance (MVP flag off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - —

### Menu (org editors — MVP flags off)

#### Menu Creation / Menus / Management / Builder

- **UI Completed:**
  - Creation / Menus screens exist if flags on; Management / Builder Under Construction
- **UI Incomplete:**
  - VERSION_1 intends org editors hidden (flags default off)
- **API Completed / Incomplete:**
  - Same as company/branch menu where enabled

### Reports

#### Sales / Revenue / Expenses / Taxes / Analytics

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction at `/organization/reports/*`
- **API Completed:**
  - —
- **API Incomplete:**
  - No org reports API; mock `/reports` not linked

### Settings

#### Organization Settings / Subscription

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction (`/organization/settings`, `/organization/settings/billing`)
- **API Completed:**
  - —
- **API Incomplete:**
  - No settings / subscription APIs (dashboard has mock subscription card only)

#### Integrations (MVP flag off)

- **UI Completed:**
  - —
- **UI Incomplete:**
  - Under Construction
- **API Completed:**
  - —
- **API Incomplete:**
  - —

---

## Cross-cutting summary

| Area                                            | Strongest (UI + API)                             | Weakest                                          |
| ----------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Directory                                       | Companies / Branches lists                       | Add company/branch, analytics                    |
| IAM                                             | Users list + create wizard                       | Edit permission hydrate, hard delete, role CRUD  |
| Floors/Tables setup                             | Full floor/section/table API + UI                | Hidden by default feature flag                   |
| Menu                                            | Reads (categories/items/branch menus/GST create) | Menu writes, availability writes, prep/modifiers |
| POS ops                                         | Floor tables + menu catalog + KDS board/status   | Orders/pay/shift/reservation/ready/due (mock UI) |
| Reports / Settings / HR / Inventory / Customers | —                                                | Almost all Under Construction                    |

---

## Legend notes

1. **Mock UI ≠ incomplete UI** — many POS screens are design-complete but listed under **API Incomplete**.
2. **Feature flags** (`FEATURE_FLAGS` in `src/integrations/growthbook/featureFlags.ts`) hide many items from MVP nav; screens may still exist.
3. **Catalog unused** means path exists in `ApiUrlsV1` / `handler.ts` for mocked mode but the live screen does not call it.
