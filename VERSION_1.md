# Hospixo Restaurant MVP Role and Sidebar Guide

Proposed release scope • 18 October 2026 • Product, engineering, design and QA handover

Enable a focused restaurant workflow: configure a branch and menu, seat guests, take orders, prepare food, settle bills, close the cash counter and review sales. Use the role lists below to configure navigation and plan implementation.

This is a proposed MVP configuration based on the sidebar list supplied for this request. It does not certify that the screens or APIs are implemented or ready for release. Flag names are proposed logical keys; map them to existing repository conventions before implementation.

### **Configuration decisions**

| **State**       | **Meaning**                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| **Include**     | Required MVP capability. Enable after its end-to-end acceptance checks pass.                          |
| **Consolidate** | Keep the workflow inside a parent screen, tab, filter or action. Hide the<br>duplicate sidebar entry. |
| **Defer**       | Hide in the default MVP configuration. Do not enable until separately scoped<br>and validated.        |

### **Role scope**

| **Role**                              | **Default scope and landing page**                      |
| ------------------------------------- | ------------------------------------------------------- |
| **Captain / Server**                  | Assigned branch and permitted tables or orders; Tables. |
| **Cashier / Counter Staff**           | Assigned branch and counter or shift; New Order.        |
| **Kitchen Manager**                   | Assigned branch and prep stations; Kitchen Display.     |
| **Chef**                              | Assigned prep station; full-screen KDS without sidebar. |
| **Branch / Store Manager**            | Assigned branch; Dashboard.                             |
| **Company Admin / Owner**             | Assigned company and its branches; Dashboard.           |
| **Organization Owner / Tenant Admin** | Assigned organization and its companies; Dashboard.     |

### **Access rule**

Effective access requires an enabled release flag, the applicable subscription entitlement when used, an explicit role permission, and a matching organization/company/branch scope. Sidebar visibility is only navigation. APIs must enforce authorization independently. Missing or unknown flags default to disabled.

Owner and manager roles do not automatically inherit every operational action. An owner who also works at a counter receives an explicit branch cashier assignment. Aggregate dashboards never grant access to another tenant or unrestricted staff actions.

## **Captain and Cashier**

### **Captain sidebar**

| **Current item**      | **MVP decision**             | **Required behavior**                                                     |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| **Tables**            | Include                      | Table status, open table order and<br>permitted table assignment.         |
| **Orders**            | Include                      | Create or update assigned unbilled orders;<br>submit kitchen tickets.     |
| **Dine-In**           | Consolidate into Tables      | Open dine-in flow from the table; no<br>second sidebar destination.       |
| **Ready Orders**      | Include                      | Ready queue and mark food served;<br>assigned branch only.                |
| **Menu Availability** | Consolidate into order entry | Read-only availability indicators. Captain<br>cannot change stock status. |

Final sidebar: Tables | Orders | Ready Orders. Flags: tables, orders, kitchen.ready_queue; menu.availability is a dependency inside order entry.

Captain actions: select items and modifiers, record notes, add items before settlement, send new kitchen tickets and mark served. Restrict access to assigned work. No payments, refunds, price edits, discounts, post-submit voids or staff administration by default. Manager-approved corrections must be auditable.

### **Cashier sidebar**

| **Current item** | **MVP decision**              | **Required behavior**                                                  |
| ---------------- | ----------------------------- | ---------------------------------------------------------------------- |
| **Dashboard**    | Defer                         | Use New Order as the landing page.                                     |
| **New Order**    | Include                       | Counter/takeaway entry; dine-in access<br>where assigned.              |
| **Orders**       | Include                       | Branch orders with Live, Ready, All and Due<br>filters.                |
| **Dine-In**      | Include                       | Table access linked to the same order and<br>bill.                     |
| **Billing**      | Include                       | Bill preview, approved adjustments,<br>settlement and receipt reprint. |
| **Payments**     | Consolidate into Billing      | Cash/payment records and due status<br>within bill details.            |
| **Customers**    | Consolidate into Billing      | Optional customer name/contact capture;<br>no standalone CRM.          |
| **Reports**      | Consolidate into Cash Counter | Own shift collections and closing summary<br>only.                     |

Final sidebar: New Order | Orders | Dine-In | Billing | Cash Counter. Cash Counter is added from the existing manager workflow because opening and closing a cashier shift is necessary for accountable collections.

Flags: pos.order_entry, orders, tables, billing, payments.record, cash_counter. Customer capture is enabled within billing only. Record cash and configured non-cash tender references; a manual UPI/card record must never imply provider verification. Online collection integration has a separate flag.

Cashier can collect and reprint settled receipts, open/close an assigned shift and view own totals. Discounts, voids, refunds and reopening closed shifts require separate manager permissions. No unrestricted sales reports or menu edits.

## **Kitchen Manager and Chef**

### **Kitchen Manager sidebar**

| **Current item**    | **MVP decision**     | **Required behavior**                                                   |
| ------------------- | -------------------- | ----------------------------------------------------------------------- |
| **Kitchen Display** | Include              | Station-filtered ticket queue with pending,                             |
|                     |                      | preparing and ready states.                                             |
| **Incoming Orders** | Consolidate into KDS | Incoming tab or filter.                                                 |
| **Preparing**       | Consolidate into KDS | Preparing tab or filter.                                                |
| **Ready Orders**    | Consolidate into KDS | Ready tab or filter; share canonical order<br>state with service staff. |

Final sidebar: Kitchen Display. Flag: kitchen.kds. Do not create separate implementations for incoming, preparing and ready tickets.

### **Kitchen Manager actions**

View assigned branch stations, start preparation, mark items/tickets ready and view item quantities, modifiers, allergy notes and preparation notes. Surface canceled items and order amendments distinctly so the kitchen does not prepare obsolete quantities.

Allow Menu Availability as a KDS action only with an explicit availability-update permission. It marks an item unavailable for sale; it does not change inventory quantities, recipes or prices. Staff should see unavailable items promptly in order entry.

Do not expose customer contact information, payment controls, revenue reports, employee management or recipe costing to kitchen users.

### **Chef mode**

No sidebar. Open the full-screen KDS directly after sign-in or station selection. Reuse kitchen.kds and the same ticket model. Chef sees assigned station tickets and may start preparation or mark ready only when granted those actions.

Provide a small station selector when multiple stations are assigned, connection status, sign-out and accessible touch targets. These controls do not require sidebar destinations. Kitchen Manager may view all assigned branch stations; Chef remains station-scoped.

### **Required kitchen behavior**

| **Scenario**                          | **Expected result**                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| **Repeated submit or reconnect**      | No duplicate kitchen ticket or duplicated preparation quantity.                         |
| **Add-on after initial submission**   | Show a new or clearly identified incremental ticket.                                    |
| **Cancel or change after submission** | Auditable manager-authorized change and visible kitchen notification.                   |
| **Ready versus served**               | Kitchen marks ready; Captain marks served. Never treat either as payment<br>settlement. |
| **Connection lost**                   | Show stale/offline state. Do not silently claim a status change succeeded.              |

## **Branch Manager and Store Manager**

| **Current group and items**                           | **MVP decision**                                                                                           |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Home: Dashboard**                                   | Include basic branch sales, order counts, due balances and counter status.                                 |
| **Employees: Users & Roles**                          | Include branch invitations/assignments and approved role templates.                                        |
| **Employees: Attendance, Schedule**                   | Defer both.                                                                                                |
| **POS: Point of Sale, Captain Flow**                  | Include Point of Sale as a workspace launcher; Captain Flow is a mode within<br>it.                        |
| **Orders: Online Orders**                             | Defer external marketplace/aggregator integrations.                                                        |
| **Orders: Live Orders, Ready Orders, All Orders**     | Consolidate under Orders with tabs/filters.                                                                |
| **Menu: Menu Management**                             | Include branch assignment and permitted branch configuration; shared item<br>authoring belongs to company. |
| **Menu: Menu Availability**                           | Include available/unavailable control.                                                                     |
| **Menu: Menu Pricing Setup**                          | Consolidate into Menu; explicit branch-price permission only.                                              |
| **Management: Tables, Dine-In, Floor & Table Set-up** | Use Tables for service; put floor/table setup under Settings.                                              |
| **Management: Cash Counter, Due Payments**            | Include Cash Counter; put Due Payments under Orders and Billing.                                           |
| **Management: Kitchen Display**                       | Include assigned branch KDS.                                                                               |
| **Management: Inventory**                             | Defer stock ledger, procurement, recipes and costing.                                                      |
| **Management: Customers**                             | Consolidate optional details into orders/billing.                                                          |
| **Management: Reports, Settings**                     | Include basic branch reports and essential branch settings.                                                |

### **Final branch sidebar**

Dashboard | Users & Roles | Point of Sale | Orders | Menu | Tables | Cash Counter | Kitchen Display | Reports | Settings

### **Sidebar inside POS routes**

| **Existing POS item**                                 | **MVP destination**                        |
| ----------------------------------------------------- | ------------------------------------------ |
| **Tables, Dine-In**                                   | Tables; dine-in opens from a table.        |
| **Ready List, All Orders, Live Orders, Due Payments** | Orders with Ready, All, Live and Due tabs. |
| **Cash Counter**                                      | Keep Cash Counter.                         |
| **Kitchen Display**                                   | Keep Kitchen Display for authorized users. |

Final POS workspace: Tables | New Order | Orders | Billing | Cash Counter | Kitchen Display. Show each item only when the assigned role permits it. A Captain opening /pos must retain the Captain menu and restrictions.

### **Manager authority**

Approve bounded discounts, cancellations and voids; review cash variances; view branch reports; configure tables, counters and stations. Refunds require a separately validated refund workflow and permission, and remain disabled until ready. Branch managers cannot grant company/organization roles, edit central tax rules or access another branch by changing an ID.

## **Company Admin and Owner**

| **Current group and items**                                          | **MVP decision**                                                                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Home: Dashboard**                                                  | Include company totals with branch/date filters.                                                                             |
| **Branches: All Branches**                                           | Include branch list and essential branch setup action for authorized company<br>admins.                                      |
| **Branches: Branch Analytics, Branch Performance**                   | Consolidate simple branch comparisons into Dashboard or Reports; defer<br>advanced analysis.                                 |
| **Employees: Users & Roles**                                         | Include company and branch assignments using approved role templates.                                                        |
| **Employees: Attendance**                                            | Defer.                                                                                                                       |
| **Menu: Menu Creation, Menus, Menu Management,**<br>**Menu Builder** | Consolidate into one Menu destination with create/edit, assignment and<br>publish actions.                                   |
| **Menu: Menu Availability**                                          | Consolidate into Menu; require a selected branch.                                                                            |
| **Menu: GST Rates**                                                  | Consolidate into Menu tax setup; restricted company tax configuration.                                                       |
| **Menu: Prep Stations**                                              | Consolidate into Menu setup with branch selection.                                                                           |
| **Menu: Modifier Groups**                                            | Consolidate into Menu setup; include only modifiers supported end to end.                                                    |
| **Operations: Orders**                                               | Include read/review across assigned company branches.                                                                        |
| **Operations: Kitchen Display, Cash Counter**                        | Consolidate as branch-context workspace links; operational actions need<br>explicit assignments.                             |
| **Operations: Inventory**                                            | Defer.                                                                                                                       |
| **Operations: Customers**                                            | Defer standalone CRM; retain customer data in authorized order details.                                                      |
| **Reports: Sales, Revenue, Analytics**                               | Consolidate into Reports for sales, collections, taxes, discounts, voids and<br>branch comparison; defer advanced analytics. |
| **Settings: Company Settings**                                       | Include essential company profile and billing/receipt configuration.                                                         |

### **Final company sidebar**

Dashboard | Branches | Users & Roles | Menu | Orders | Reports | Company Settings

### **Minimum menu setup**

Support categories, items, variants where used, prices, tax mapping, required modifier groups, branch menu assignment, prep station routing, availability and an explicit publish state. Use one canonical menu model. Do not create separate authoring experiences for Menu Creation, Menu Builder and Menu Management.

### **Minimum owner reports**

Show gross sales, discounts, voids/cancellations, net sales with a stated tax basis, tax, recorded collections by tender, due balances and cash variance. Sales and collections must remain distinct. Compare branches only within the company. Do not label revenue or cash collections as profit without validated cost data.

Company admins may manage branches and permitted staff in their company, but cannot alter organization ownership or subscription settings. A branch selector is mandatory before branch-level operational actions.

## **Organization Owner and Tenant Admin**

| **Current group and items**                  | **MVP decision**                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Home: Dashboard**                          | Include organization totals and company breakdown using the same metric<br>definitions as company reports.                             |
| **Companies: All Companies, Add Company**    | Include All Companies; Add Company is an authorized action on that screen.                                                             |
| **Companies: Company Analytics**             | Consolidate basic comparisons into Dashboard/Reports; defer advanced<br>analysis.                                                      |
| **Branches: All Branches, Add Branch**       | Include All Branches filtered by company; Add Branch is an authorized action.                                                          |
| **Branches: Branch Performance**             | Consolidate basic branch comparisons into Reports.                                                                                     |
| **Employees: Users & Roles**                 | Include organization/company/branch role assignments with scope<br>restrictions.                                                       |
| **Employees: Attendance**                    | Defer.                                                                                                                                 |
| **Menu: Menu Creation, Menus, Menu Builder** | Hide organization-level editors. Provide an authorized company-context link to<br>the shared Menu workspace.                           |
| **Reports: Sales, Revenue**                  | Consolidate into Reports with organization/company/branch filters.                                                                     |
| **Reports: Expenses**                        | Defer expense ledger and financial accounting.                                                                                         |
| **Reports: % Taxes**                         | Consolidate tax totals into Reports; no separate sidebar item.                                                                         |
| **Reports: Analytics**                       | Defer advanced forecasting and AI insights; include basic comparisons in<br>Reports.                                                   |
| **Settings: Organization Settings**          | Include profile and essential organization configuration.                                                                              |
| **Settings: Subscription**                   | Include read-only current plan, limits and subscription status within Settings;<br>defer self-service upgrades and automated charging. |
| **Settings: Integrations**                   | Defer standalone integration marketplace and setup UI.                                                                                 |

### **Final organization sidebar**

Dashboard | Companies | Branches | Users & Roles | Reports | Organization Settings

### **Ownership boundaries**

Organization admins manage their tenant structure and assign permitted roles. Organization ownership does not automatically grant payment collection, cash closure, kitchen updates or company menu edits. Provide a scoped company/branch context switch only when the account has the corresponding assignment.

Company and branch creation must respect applicable plan limits and existing provisioning/readiness rules. Keep subscription visibility available to the organization owner without exposing payment credentials to operational staff.

### **Outside this role matrix**

Hospixo internal Super Admin, Support, Ops, Finance and Audit consoles are a separate product surface. Do not expose internal platform controls in tenant sidebars. This document covers only the restaurant tenant roles listed in the request.

## **Feature Flag Configuration**

Use capability flags shared across roles, then map role permissions and scopes separately. Keys below are proposed. Include means a release candidate flag is enabled only after validation; role access is described in the earlier pages.

| **Proposed key**                             | **Default MVP access**                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **dashboard.basic**                          | Branch Manager, Company Admin, Organization Admin; scoped aggregates.                                   |
| **structure.companies**                      | Organization Admin only.                                                                                |
| **structure.branches**                       | Company and Organization Admin; branch manager reads own context.                                       |
| **iam.role_assignments**                     | Managers/admins within their assignment authority; no custom role designer.                             |
| **tables**                                   | Captain, Cashier, Branch Manager.                                                                       |
| **pos.order_entry**                          | Captain, Cashier, Branch Manager; use role-specific modes.                                              |
| **orders**                                   | Service and cashier roles plus managers/admins; admin review is read-only by<br>default.                |
| **kitchen.kds**                              | Kitchen Manager, Chef, Branch Manager; station scope applies.                                           |
| **kitchen.ready_queue**                      | Captain and order-list filters; kitchen uses KDS ready state.                                           |
| **menu.manage**                              | Company Admin; Branch Manager has limited branch configuration.                                         |
| **menu.availability**                        | Read in order entry; write for Branch Manager and explicitly authorized<br>kitchen/company staff.       |
| **menu.tax_setup**                           | Company Admin with tax configuration permission.                                                        |
| **menu.modifiers**                           | Company authoring and supported order-entry consumers.                                                  |
| **menu.prep_stations**                       | Company/Branch setup; kitchen consumes station assignments.                                             |
| **billing**                                  | Cashier and Branch Manager.                                                                             |
| **payments.record**                          | Cashier and Branch Manager; no provider verification implied.                                           |
| **cash_counter**                             | Cashier own shift; Branch Manager branch oversight.                                                     |
| **customers.capture**                        | Optional embedded order/bill details for authorized service staff.                                      |
| **reports.basic**                            | Branch Manager, Company Admin, Organization Admin; own-shift cashier<br>summary is within Cash Counter. |
| **settings.branch / company / organization** | Corresponding management scope only.                                                                    |
| **subscription.view**                        | Organization Admin; read-only panel inside Settings.                                                    |

### **Default off**

hr.attendance, hr.schedule, inventory, procurement, expenses, customers.crm, analytics.advanced, ai.insights, orders.aggregators, integrations.manage, subscription.self_service and payments.online_collection. Enable a providerspecific payment flow only after separate integration validation.

billing.refunds and pos.offline default OFF pending end-to-end validation. Refunds are required before operational rollout wherever the agreed pilot policy requires them. Offline POS is a distinct release gate, not a sidebar item; it must not be inferred from cached pages.

## **Development and Release Checks**

### **Dependencies and action permissions**

Order entry depends on branch menu, availability, pricing/tax calculation and order lifecycle APIs. Kitchen submission depends on station routing and reliable ticket delivery. Billing depends on authoritative totals, tender recording and settled receipt retrieval. Cash closure depends on recorded tenders and an auditable shift ledger.

Keep action permissions separate from flags: order create/update/submit, kitchen start/ready, service mark-served, availability update, payment record, discount approve, void approve, refund approve, receipt reprint, shift open/close, cash variance review, menu publish, tax configure and role assign. Map these concepts to existing backend permission identifiers; do not invent replacement RBAC during navigation work.

### **Offline and mobile web**

Responsive mobile web is an MVP requirement for Captain and manager views, with cashier and kitchen layouts verified on supported devices. It does not need a sidebar flag. Offline POS requires its own approved scope and validation: local order durability, unique IDs, idempotent sync, conflict handling, tax/price snapshots, receipt policy, kitchen delivery and payment restrictions. Never label an unsynced order as server-confirmed or a payment as provider-verified.

### **Acceptance checklist**

| **Check**            | **Pass condition**                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navigation**       | Each role sees exactly its final sidebar. Empty groups and duplicate<br>destinations are hidden. Correct landing route works.                                                                 |
| **Authorization**    | Direct URLs and API calls reject forbidden actions.<br>Cross-tenant/company/branch/station access is blocked even when flags are<br>enabled.                                                  |
| **Flag behavior**    | Unknown/off flag hides navigation and blocks the capability at the appropriate<br>service boundary. Disabling new sales does not lose in-flight orders, payment<br>records or receipt access. |
| **Order to receipt** | Table or takeaway order reaches kitchen, ready, served where relevant,<br>billing, payment and settled receipt without duplication.                                                           |
| **Corrections**      | Only authorized users approve adjustments; actor, scope, time, reason and<br>before/after values are auditable.                                                                               |
| **Collections**      | Repeated payment requests do not double charge or double record. Due<br>balance and shift totals reconcile with authoritative records.                                                        |
| **Role assignment**  | Managers cannot elevate themselves or assign roles above their authority.<br>Revoked access stops on subsequent authorized requests.                                                          |
| **Data isolation**   | Company/organization dashboards aggregate only permitted scopes. A<br>context switch clears stale scoped data.                                                                                |
| **Failure recovery** | Network loss, retries and stale KDS data are visible. Refresh/reconnect does<br>not create duplicate orders, tickets or payments.                                                             |
| **Device coverage**  | Captain mobile web, cashier workstation and full-screen kitchen flows are<br>usable on supported screen sizes.                                                                                |

### **Implementation order**

1. Map existing routes, flags and permissions to this matrix. 2. Implement scoped navigation and direct-access guards. 3. Complete menu, order, KDS, billing and shift dependencies. 4. Verify basic reports and administrator scope. 5. Enable pilot flags only after acceptance; track deferred modules separately.
