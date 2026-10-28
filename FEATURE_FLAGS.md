# Feature flags — what each one turns on

Source: `src/integrations/growthbook/featureFlags.ts`  
Today every flag is a **sidebar (nav) switch**. When the flag is **ON**, that menu item appears; the screen behind it may include list / add / edit / deactivate actions as listed below.

**Default:** `ON` = shown in MVP · `OFF` = hidden until you enable it in GrowthBook

---

## Captain

| Flag                          | Default | Opens                | Actions you get on that screen                                    |
| ----------------------------- | ------- | -------------------- | ----------------------------------------------------------------- |
| `captain_pos_tables_nav`      | ON      | Tables               | View floor · filter tables · open table · start order             |
| `captain_pos_orders_nav`      | ON      | Orders               | View list · search/filter · open order · go to settle / add items |
| `captain_pos_readyOrders_nav` | ON      | Ready Orders         | View ready queue · mark served · view details                     |
| `captain_pos_dineIn_nav`      | OFF     | Dine-In (order menu) | Browse menu · add to cart · checkout flow                         |

---

## Cashier

| Flag                               | Default | Opens              | Actions you get on that screen                           |
| ---------------------------------- | ------- | ------------------ | -------------------------------------------------------- |
| `cashier_pos_newOrder_nav`         | ON      | New Order (tables) | View tables · open table · create takeaway/dine-in order |
| `cashier_pos_orders_nav`           | ON      | Orders             | View list · filter · open order                          |
| `cashier_pos_dineIn_nav`           | ON      | Dine-In            | Floor view · select table · order                        |
| `cashier_pos_billing_nav`          | ON      | Billing            | Same as orders settle path · bill preview · payment UI   |
| `cashier_pos_cashCounter_nav`      | ON      | Cash Counter       | View shift · open shift · close shift                    |
| `cashier_pos_dashboard_nav`        | OFF     | Dashboard          | View POS metrics / widgets                               |
| `cashier_pos_payments_nav`         | OFF     | Payments (due)     | View due list · settle (UI)                              |
| `cashier_management_customers_nav` | OFF     | Customers          | (screen under construction)                              |
| `cashier_management_reports_nav`   | OFF     | Reports            | (screen under construction)                              |

---

## Kitchen

| Flag                          | Default | Opens           | Actions you get on that screen                         |
| ----------------------------- | ------- | --------------- | ------------------------------------------------------ |
| `kitchen_kds_display_nav`     | ON      | Kitchen Display | View tickets · start preparing · mark ready · complete |
| `kitchen_kds_incoming_nav`    | OFF     | Incoming Orders | Same KDS (incoming filter/alias)                       |
| `kitchen_kds_preparing_nav`   | OFF     | Preparing       | Same KDS (preparing filter/alias)                      |
| `kitchen_kds_readyOrders_nav` | OFF     | Ready Orders    | Ready list view (separate from KDS)                    |

---

## Branch manager

### Home / Employees

| Flag                                 | Default | Opens         | Actions you get on that screen                                                                                                            |
| ------------------------------------ | ------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `branch_home_dashboard_nav`          | ON      | Dashboard     | View branch sales / ops widgets                                                                                                           |
| `branch_employees_usersAndRoles_nav` | ON      | Users & Roles | **List** users · **Add** user (wizard) · **Edit** profile · **Deactivate** (status) · assign roles · set permissions · create custom role |
| `branch_employees_attendance_nav`    | OFF     | Attendance    | (under construction)                                                                                                                      |
| `branch_employees_schedule_nav`      | OFF     | Schedule      | (under construction)                                                                                                                      |

### POS

| Flag                              | Default | Opens                    | Actions you get on that screen                        |
| --------------------------------- | ------- | ------------------------ | ----------------------------------------------------- |
| `branch_pos_pointOfSale_nav`      | ON      | Point of Sale (launcher) | Enter POS workspace                                   |
| `branch_pos_dashboard_nav`        | OFF     | POS Dashboard            | View POS metrics                                      |
| `branch_pos_tables_nav`           | ON      | Tables                   | View floor · open table · order                       |
| `branch_pos_dineIn_nav`           | ON      | Dine In                  | Floor dine-in mode                                    |
| `branch_pos_takeAway_nav`         | ON      | Take Away                | Menu · cart · checkout                                |
| `branch_pos_readyList_nav`        | ON      | Ready List               | View ready · mark served                              |
| `branch_pos_allOrders_nav`        | ON      | All Orders               | List · filter · open · settle                         |
| `branch_pos_cashShift_nav`        | ON      | Cash Shift               | Open / close shift                                    |
| `branch_pos_duePayments_nav`      | ON      | Due Payments             | View dues · settle UI                                 |
| `branch_pos_reservation_nav`      | OFF     | Reservation              | List · **Add** · **Edit** · cancel · check-in (local) |
| `branch_pos_onlineOrders_nav`     | OFF     | Online Orders            | (under construction)                                  |
| `branch_pos_captainFlow_nav`      | OFF     | Captain Flow group       | Nested captain POS                                    |
| `branch_pos_captainTables_nav`    | OFF     | Captain Tables           | Same as captain tables                                |
| `branch_pos_captainOrderMenu_nav` | OFF     | Captain Order Menu       | Menu / cart                                           |
| `branch_pos_captainReadyList_nav` | OFF     | Captain Ready List       | Ready queue                                           |
| `branch_pos_captainAllOrders_nav` | OFF     | Captain All Orders       | Orders list                                           |

### Orders hub (duplicate nav)

| Flag                             | Default | Opens             | Actions              |
| -------------------------------- | ------- | ----------------- | -------------------- |
| `branch_orders_onlineOrders_nav` | OFF     | Online Orders hub | (under construction) |
| `branch_orders_liveOrders_nav`   | OFF     | Live Orders hub   | (under construction) |
| `branch_orders_readyOrders_nav`  | OFF     | Ready Orders hub  | (under construction) |
| `branch_orders_allOrders_nav`    | OFF     | All Orders hub    | (under construction) |

### Menu

| Flag                             | Default | Opens             | Actions you get on that screen                                                                 |
| -------------------------------- | ------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `branch_menu_hub_nav`            | ON      | Menu section      | Shows the Menu group in sidebar                                                                |
| `branch_menu_creation_nav`       | ON      | Menu Creation     | **List** items · **Add** item · **Edit** item · **View** · **Deactivate** item · categories UI |
| `branch_menu_menus_nav`          | ON      | Menus (sessions)  | **List** · **Add** session · **Edit** · activate / deactivate (local write today)              |
| `branch_menu_availability_nav`   | ON      | Menu Availability | Mark available / 86 · update availability                                                      |
| `branch_menu_gstRates_nav`       | OFF     | GST Rates         | **List** · **Add** rate · **View** detail                                                      |
| `branch_menu_prepStations_nav`   | OFF     | Prep Stations     | (under construction)                                                                           |
| `branch_menu_modifierGroups_nav` | OFF     | Modifier Groups   | (under construction)                                                                           |

### Management

| Flag                                       | Default | Opens                   | Actions you get on that screen                              |
| ------------------------------------------ | ------- | ----------------------- | ----------------------------------------------------------- |
| `branch_management_kitchenDisplay_nav`     | ON      | Kitchen Display         | Start · ready · complete tickets                            |
| `branch_management_cashCounter_nav`        | ON      | Cash Counter            | Shift open/close (prefer POS cash-shift)                    |
| `branch_management_reports_nav`            | ON      | Reports                 | (path under construction; `/reports` hub exists separately) |
| `branch_management_settings_nav`           | ON      | Settings                | (under construction)                                        |
| `branch_management_tables_nav`             | OFF     | Management Tables       | (under construction — use POS Tables)                       |
| `branch_management_dineIn_nav`             | OFF     | Management Dine-In      | (under construction)                                        |
| `branch_management_duePayments_nav`        | OFF     | Management Due Payments | (under construction)                                        |
| `branch_management_inventory_nav`          | OFF     | Inventory               | (under construction)                                        |
| `branch_management_customers_nav`          | OFF     | Customers               | (under construction)                                        |
| `branch_management_floorAndTableSetup_nav` | OFF     | Floor & Table Set-up    | **Add** floor/section/tables · **Edit** · archive / restore |

---

## Company

| Flag                                    | Default | Opens              | Actions you get on that screen                                       |
| --------------------------------------- | ------- | ------------------ | -------------------------------------------------------------------- |
| `company_home_dashboard_nav`            | ON      | Dashboard          | View company widgets                                                 |
| `company_branches_allBranches_nav`      | ON      | All Branches       | **List** branches · open branch context                              |
| `company_branches_analytics_nav`        | OFF     | Branch Analytics   | (under construction)                                                 |
| `company_branches_performance_nav`      | OFF     | Manage Performance | (under construction)                                                 |
| `company_employees_usersAndRoles_nav`   | ON      | Users & Roles      | **List** · **Add** · **Edit** · **Deactivate** · roles / permissions |
| `company_employees_attendance_nav`      | OFF     | Attendance         | (under construction)                                                 |
| `company_menu_creation_nav`             | ON      | Menu Creation      | **List** · **Add** · **Edit** · **Deactivate** items                 |
| `company_menu_menus_nav`                | ON      | Menus              | **List** · **Add** · **Edit** sessions                               |
| `company_menu_management_nav`           | OFF     | Menu Management    | (under construction)                                                 |
| `company_menu_availability_nav`         | OFF     | Menu Availability  | Available / 86                                                       |
| `company_menu_builder_nav`              | OFF     | Menu Builder       | (under construction)                                                 |
| `company_menu_gstRates_nav`             | OFF     | GST Rates          | **List** · **Add** · **View**                                        |
| `company_menu_prepStations_nav`         | OFF     | Prep Stations      | (under construction)                                                 |
| `company_menu_modifierGroups_nav`       | OFF     | Modifier Groups    | (under construction)                                                 |
| `company_operations_order_nav`          | ON      | Orders             | (under construction)                                                 |
| `company_operations_kitchenDisplay_nav` | OFF     | Kitchen Display    | KDS actions                                                          |
| `company_operations_cashCounter_nav`    | OFF     | Cash Counter       | (under construction)                                                 |
| `company_operations_inventory_nav`      | OFF     | Inventory          | (under construction)                                                 |
| `company_operations_customers_nav`      | OFF     | Customers          | (under construction)                                                 |
| `company_reports_sales_nav`             | OFF     | Sales report       | (under construction)                                                 |
| `company_reports_revenue_nav`           | OFF     | Revenue report     | (under construction)                                                 |
| `company_reports_analytics_nav`         | OFF     | Analytics          | (under construction)                                                 |
| `company_settings_companySettings_nav`  | ON      | Company Settings   | (under construction)                                                 |

---

## Organization

| Flag                                    | Default | Opens                 | Actions you get on that screen                                       |
| --------------------------------------- | ------- | --------------------- | -------------------------------------------------------------------- |
| `org_home_dashboard_nav`                | ON      | Dashboard             | View org widgets                                                     |
| `org_companies_allCompanies_nav`        | ON      | All Companies         | **List** companies · drill into company                              |
| `org_companies_addCompany_nav`          | OFF     | Add Company           | (under construction — should be **Add** on list)                     |
| `org_companies_analytics_nav`           | OFF     | Company Analytics     | (under construction)                                                 |
| `org_branches_allBranches_nav`          | ON      | All Branches          | **List** branches                                                    |
| `org_branches_addBranch_nav`            | OFF     | Add Branch            | (under construction)                                                 |
| `org_branches_performance_nav`          | OFF     | Branch Performance    | (under construction)                                                 |
| `org_employees_usersAndRoles_nav`       | ON      | Users & Roles         | **List** · **Add** · **Edit** · **Deactivate** · roles / permissions |
| `org_employees_attendance_nav`          | OFF     | Attendance            | (under construction)                                                 |
| `org_menu_creation_nav`                 | OFF     | Menu Creation         | **List** · **Add** · **Edit** · **Deactivate** (hidden in MVP)       |
| `org_menu_menus_nav`                    | OFF     | Menus                 | **List** · **Add** · **Edit**                                        |
| `org_menu_management_nav`               | OFF     | Menu Management       | (under construction)                                                 |
| `org_menu_builder_nav`                  | OFF     | Menu Builder          | (under construction)                                                 |
| `org_reports_sales_nav`                 | ON      | Sales                 | (under construction)                                                 |
| `org_reports_revenue_nav`               | OFF     | Revenue               | (under construction)                                                 |
| `org_reports_expenses_nav`              | OFF     | Expenses              | (under construction)                                                 |
| `org_reports_taxes_nav`                 | OFF     | Taxes                 | (under construction)                                                 |
| `org_reports_analytics_nav`             | OFF     | Analytics             | (under construction)                                                 |
| `org_settings_organizationSettings_nav` | ON      | Organization Settings | (under construction)                                                 |
| `org_settings_subscription_nav`         | ON      | Subscription          | (under construction — read-only intended)                            |
| `org_settings_integrations_nav`         | OFF     | Integrations          | (under construction)                                                 |

---

## Quick example: Users & Roles

When `*_employees_usersAndRoles_nav` is **ON**, the Users & Roles feature includes:

1. **Dashboard / list** — staff table, search, filters
2. **Add** — create-user wizard (template → permissions → review)
3. **Edit** — profile + roles + permissions
4. **Deactivate** — status disable (not hard delete)
5. **Add custom role** — create role template + set permissions

There is **no separate flag yet** for Add vs Edit vs Deactivate — one nav flag shows the whole feature. Action-level flags (e.g. `branch_employees_usersAndRoles_add`) can be added later if you want finer control.

---

## Note

- Flags today = **show / hide sidebar item** only.
- File to edit defaults: `src/integrations/growthbook/featureFlags.ts` (`FEATURE_FLAG_DEFAULTS`).
- Create the **same key names** in the GrowthBook dashboard to override ON/OFF remotely.
