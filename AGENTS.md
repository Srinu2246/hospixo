# Project Coding Rules

New screens follow the Point of Sale (POS) feature. Copy that shape. Do not invent a second layout for hospital modules.

Reference implementation:

- Routes: `src/app/pos/point-of-sale/` and `src/app/pos/captain-flow/`
- Screens: `src/features/pos/point-of-sale/`
- Hooks: `src/lib/hooks/pos/point-of-sale/`
- Schemas: `src/lib/schemas/pos/point-of-sale/`
- Endpoint catalog: `src/services/api/ApiUrlsV1.ts`
- Shared UI: `src/components/shared/`
- Mock data: `src/lib/mocks/pos/`

## 1. Stack

- Next.js 14.2.25 (App Router), React 18.3, TypeScript strict
- MUI v9 + Emotion
- TanStack React Query v5 for server data
- React Hook Form v7 + Zod v4 for validated forms
- Zustand v5 for client-only UI state
- pnpm 11. Dev server: `pnpm dev` on port 3004
- Path alias: `@/*` → `src/*`

## 2. Folder map

```text
src/
├── app/
│   ├── layout.tsx
│   ├── sidebar.ts               # Navigation and permission catalog
│   ├── api/v1/[...path]/route.ts # Protected route in front of the backend
│   └── <module>/<screen>/page.tsx # Screen routes. No screen UI.
├── features/
│   └── <domain>/<module>/
│       ├── <screen>/            # One folder per screen
│       │   ├── <Screen>.tsx
│       │   └── index.ts         # Public barrel
│       └── components/          # UI shared by screens in this module
├── components/
│   ├── layout/                  # App shell
│   └── shared/
│       ├── app/                 # Sidebar, top navbar
│       ├── ui/                  # Cards, grids, modals, chips
│       ├── form-fields/         # Inputs, dropdowns, filters, buttons
│       └── <widget-group>/      # Widgets reused by more than one module
├── lib/
│   ├── theme/mui/               # Color, spacing, type, shape tokens
│   ├── helpers/                 # Pure functions used app-wide
│   ├── mocks/<domain>/          # Mock rows and their view types
│   ├── hooks/<domain>/<module>/ # Hooks, same nesting as features/
│   └── schemas/<domain>/<module>/ # Zod schemas, same nesting as features/
├── services/api/                # Endpoint catalog and HTTP clients
│   ├── ApiUrlsV1.ts             # Only place endpoint paths are defined
│   ├── serverClient.ts          # Server-only backend client
│   ├── browserClient.ts         # Browser client used by TanStack Query
│   └── types.ts                 # Shared error type and response reader
├── providers/                   # Theme and React Query providers
├── stores/                      # Zustand. Client UI state only
└── types/                       # Models shared by more than one domain
```

POS today maps to that tree as `features/pos/point-of-sale/<screen>/`. Captain Flow does not get its own feature copy. Its routes render the same POS screens with different props.

## 3. Where a file goes

Put the file in the narrowest folder that still lets every caller import it.

| What you are adding                      | Where it goes                                             | POS example                                                          |
| ---------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| URL entry                                | `src/app/<module>/<screen>/page.tsx`                      | `src/app/pos/point-of-sale/due-payments/page.tsx`                    |
| Screen UI                                | `src/features/<domain>/<module>/<screen>/`                | `due-payments/DuePaymentsPage.tsx`                                   |
| Dialog or card used by one screen        | Same screen folder                                        | `reservation/ReservationDialog.tsx`                                  |
| UI used by several screens in one module | `features/<domain>/<module>/components/`                  | `point-of-sale/components/PaymentMethodSection.tsx`                  |
| UI used by more than one module          | `src/components/shared/ui/` or `form-fields/`             | `DataGrid`, `Input`, `Modal`                                         |
| Shell chrome                             | `src/components/shared/app/` and `src/components/layout/` | `Sidebar`, `AppShell`                                                |
| Mock rows and view types                 | `src/lib/mocks/<domain>/<name>.mocks.ts`                  | `usePosDuePayments.mocks.ts`                                         |
| Pure helper for one screen               | `<screen>/helpers/`                                       | status color lookup next to the dashboard                            |
| Pure helper used app-wide                | `src/lib/helpers/`                                        | `posStatusHelpers.ts`                                                |
| Hook for one screen                      | `src/lib/hooks/<domain>/<module>/<screen>/useThing.ts`    | `lib/hooks/pos/point-of-sale/reservation/useReservationFilters.ts`   |
| Hook shared in one module                | `src/lib/hooks/<domain>/<module>/useThing.ts`             | `lib/hooks/pos/point-of-sale/usePosCart.ts`                          |
| Hook used app-wide                       | `src/lib/hooks/useThing.ts`                               | `lib/hooks/useDebouncedValue.ts`                                     |
| Zod schema for one form                  | `src/lib/schemas/<domain>/<module>/<screen>/`             | `lib/schemas/pos/point-of-sale/reservation/reservationFormSchema.ts` |
| Zod schema shared in one module          | `src/lib/schemas/<domain>/<module>/`                      | `lib/schemas/pos/point-of-sale/paymentFormSchema.ts`                 |
| Zod schema used app-wide                 | `src/lib/schemas/`                                        | `lib/schemas/phoneSchema.ts`                                         |
| Client UI state                          | `src/stores/`                                             | `sidebarStore`, `themeStore`                                         |
| Endpoint path                            | `src/services/api/ApiUrlsV1.ts`                           | `ApiUrlsV1.pos.pointOfSale.reservation`                              |
| Server fetch                             | `src/services/api/serverClient.ts`                        | `serverApi.get` in a Server Component                                |
| Browser fetch                            | `src/lib/hooks/api/`                                      | `useApiQuery`, `useApiMutation`                                      |
| Nav item or permission                   | `src/app/sidebar.ts`                                      | POS and Captain Flow entries                                         |

Promote a file only after a second caller needs it. A reservation dialog that only reservations use stays in `reservation/`. A payment block used by takeaway, dine-in, and orders moves to `point-of-sale/components/`.

## 4. How to add a screen

Follow the due-payments and dine-in screens.

1. Add a route folder whose path matches the URL.
2. Keep `page.tsx` as a server component that renders one feature screen and passes route data in.
3. Build the screen in `src/features/.../<screen>/` as a named export with `'use client'` when it uses state, events, or browser APIs.
4. Add `index.ts` that re-exports the public component and its props type.
5. Read lists and option sets from `src/lib/mocks/<domain>/`.
6. Put hooks in `src/lib/hooks/<domain>/<module>/<screen>/` and Zod schemas in `src/lib/schemas/<domain>/<module>/<screen>/`. Match the feature path.
7. Build the layout from `src/components/shared/ui` and `form-fields` before writing a new primitive.
8. Register the route in `src/app/sidebar.ts` when it belongs in navigation.

Route:

```tsx
import { DuePaymentsPage } from '@/features/pos/point-of-sale/due-payments';

export default function PosDuePaymentsPage() {
  return <DuePaymentsPage />;
}
```

Dynamic and query params stay in the route and are passed as props:

```tsx
import { DineInPage } from '@/features/pos/point-of-sale/dine-in';

interface PosDineInTableRouteProps {
  params: { tableId: string };
}

export default function PosDineInTableRoute({ params }: PosDineInTableRouteProps) {
  return <DineInPage initialTableId={params.tableId} />;
}
```

Checkout and success URLs reuse the same screen with a step prop. They do not duplicate the screen.

```tsx
import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function TakeawayCheckoutPage() {
  return <OrderSettle initialStep="checkout" />;
}
```

A second flow reuses the screen:

```tsx
import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

export default function CaptainFlowTablesPage() {
  return <PosTableSelection isDineIn={false} />;
}
```

## 5. How to write a feature screen

- One screen component per file. PascalCase file name matches the export (`DuePaymentsPage.tsx`).
- Named export is required. The barrel re-exports it. Pages import from the folder (`@/features/pos/point-of-sale/due-payments`), not from a deep relative path.
- Props are an exported interface. Comment each prop when the name is not obvious. Type the props parameter as `Readonly<Props>` when the component takes props.
- Put a short file comment that lists the sections of the screen.
- Keep filtering, dialog open state, and row selection in the screen with `useState`. When that logic is reused or the screen file is hard to scan, move it to `src/lib/hooks/<domain>/<module>/<screen>/`.
- Do not fetch with raw `fetch` inside the screen. Use a mock module until the API exists. Initial data comes from `serverApi` in the route. Search, filters, pagination, and background refresh go through `useApiQuery`.
- Do not copy list data into a Zustand store.

```tsx
'use client';

export interface DineInPageProps {
  initialTableId?: string;
}

export function DineInPage({ initialTableId }: Readonly<DineInPageProps> = {}) {
  return <PosTableSelection isDineIn initialTableId={initialTableId} />;
}
```

```ts
export * from './DineInPage';
```

Local pieces of that screen (dialogs, row cards, cancel confirms) live in the same folder and are exported from the same `index.ts` when another screen in the module needs them.

## 6. Shared components

Search these before adding a component:

- `src/components/shared/ui/` — `Card`, `DataGrid`, `Modal`, `StatusChip`, `AlertMessage`, `Toast`, `Loading`, `Breadcrumbs`, `CardItemSection`
- `src/components/shared/form-fields/` — `Input`, `Dropdown`, `SearchBar`, `FilterBar`, `FilterChips`, `CalendarPicker`, `MobileNumberInput`, `ActionButton`, `Tabs`
- `src/components/shared/restaurant-menu/` — menu card and order summary used by more than one POS flow
- `src/features/pos/point-of-sale/components/` — order review, payment method, ordered items, ready-order card, success receipt

A shared component:

- Lives in its own PascalCase file
- Exports a props interface and a named function
- Accepts `sx` for layout overrides from the caller
- Uses MUI primitives and theme tokens
- Has no knowledge of a single screen's route

Screen-specific column renderers stay in the screen. The grid itself stays in `DataGrid`.

## 7. Hooks

Every hook lives under `src/lib/hooks/`. The folders mirror `src/features/`.

```text
src/features/pos/point-of-sale/reservation/ReservationList.tsx
src/lib/hooks/pos/point-of-sale/reservation/useReservationFilters.ts
src/lib/hooks/pos/point-of-sale/usePosCart.ts
src/lib/hooks/useDebouncedValue.ts
```

| Scope                         | Path                                                   |
| ----------------------------- | ------------------------------------------------------ |
| One screen                    | `src/lib/hooks/<domain>/<module>/<screen>/useThing.ts` |
| Several screens in one module | `src/lib/hooks/<domain>/<module>/useThing.ts`          |
| More than one domain          | `src/lib/hooks/useThing.ts`                            |

Rules:

- Do not add `hooks/` inside `src/features/` or a top-level `src/hooks/`.
- The file name matches the function: `useReservationFilters.ts` exports `useReservationFilters`.
- A hook returns data and handlers. It does not return JSX.
- Import with the `@/` alias: `@/lib/hooks/pos/point-of-sale/reservation/useReservationFilters`.
- Add `index.ts` in a screen or module folder when that folder exports more than one hook.
- Server lists use React Query (`useQuery`, `useMutation`) inside the hook. Query keys include the domain and the params.
- Do not wrap React Query results in Zustand.

## 8. Schemas and forms

Validated forms use React Hook Form and Zod. Every schema lives under `src/lib/schemas/`. The folders mirror `src/features/`, the same way hooks do.

```text
src/features/pos/point-of-sale/reservation/ReservationDialog.tsx
src/lib/schemas/pos/point-of-sale/reservation/reservationFormSchema.ts
```

| Scope                         | Path                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| One screen                    | `src/lib/schemas/<domain>/<module>/<screen>/<name>Schema.ts` |
| Several screens in one module | `src/lib/schemas/<domain>/<module>/<name>Schema.ts`          |
| More than one domain          | `src/lib/schemas/<name>Schema.ts`                            |

```ts
import { z } from 'zod';

export const reservationFormSchema = z.object({
  guest: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  guestCount: z.number().int().min(1).max(10),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;
```

- Do not add `schemas/` inside `src/features/`.
- The schema file exports the schema and `z.infer` type. Components do not re-declare that type by hand.
- Shared field widgets stay in `src/components/shared/form-fields/`. The schema stays in `src/lib/schemas/`.
- Import with the `@/` alias: `@/lib/schemas/pos/point-of-sale/reservation/reservationFormSchema`.
- A schema used by two screens in the same module moves up to `src/lib/schemas/<domain>/<module>/`.
- A schema used by two domains moves up to `src/lib/schemas/`.

## 9. Types, mocks, and helpers

Until an endpoint exists, the view model and the rows live together:

```text
src/lib/mocks/pos/usePosDuePayments.mocks.ts
```

That file exports the item type, status unions, option lists, and `MOCK_*` constants. The screen imports from that file. Re-export the mock from the screen barrel only when other screens import the screen folder for that data.

When the API exists:

- The response schema in `src/lib/schemas/<domain>/<module>/<screen>/` is the only model. The mock rows, the hook, and the screen all use `z.infer` from it.
- Update the mock rows so `schema.parse(MOCK_ROWS)` succeeds. Do not keep a separate mock interface once that schema exists.
- Register the `ApiUrlsV1` path in `src/services/api/handler.ts` with those mock rows.
- The React Query hook in `src/lib/hooks/<domain>/<module>/<screen>/` calls `useApiQuery` or `useApiMutation`.
- The live screen imports the hook, not the mock file. `pnpm run start-mocked` still serves those rows through `handler.ts`.

Pure functions:

- No JSX, no `fetch`, no `localStorage`.
- Screen-only helpers go in `<screen>/helpers/`.
- Helpers used by more than one screen go in `src/lib/helpers/` and are exported from `src/lib/helpers/index.ts`.

## 10. Data and API

Endpoint paths exist only in `ApiUrlsV1` from `src/services/api/ApiUrlsV1.ts`. The object follows `src/features/<domain>/<module>/<screen>`. Captain Flow uses the POS paths. Do not add a second path list, and do not add a new route file per endpoint. `src/app/api/v1/[...path]/route.ts` already forwards every path in the catalog.

```text
Server Component → serverApi → backend
Client hook → useApiQuery / useApiMutation → /api/v1 → serverApi → backend
```

### How to write one API

1. Add the path in `ApiUrlsV1` with `resource()`. Nest it like the feature folder.
2. Load the first view in the route with `serverApi` and pass it as `initialData`.
3. Put the screen hook in `src/lib/hooks/<domain>/<module>/<screen>/`. It calls `useApiQuery` or `useApiMutation`. Do not put that hook in `src/features/` or `src/services/api/`.
4. Put one Zod schema in `src/lib/schemas/<domain>/<module>/<screen>/`. That schema is the API response and the mock row. Do not add a second response type.
5. Register the path in `src/services/api/handler.ts` and point it at the mock rows. `pnpm run start-mocked` reads that file.
6. The hook, the schema, and the mock use the same domain, module, and screen folders as the feature.

```text
src/features/pos/point-of-sale/reservation/ReservationList.tsx
src/lib/hooks/pos/point-of-sale/reservation/useReservations.ts
src/lib/schemas/pos/point-of-sale/reservation/reservationSchema.ts
src/lib/mocks/pos/usePosReservations.mocks.ts
src/services/api/handler.ts
```

The mock file imports the schema and checks every row with it. The screen and the hook use `z.infer` from that same schema.

```ts
export const reservationSchema = z.object({
  id: z.string(),
  guestName: z.string(),
  guestCount: z.number().int(),
  status: z.enum(['confirmed', 'checked-in', 'cancelled']),
});

export const reservationListSchema = z.array(reservationSchema);
export type Reservation = z.infer<typeof reservationSchema>;
```

```ts
export const MOCK_RESERVATIONS = reservationListSchema.parse([
  { id: 'res-1', guestName: 'Amanda Sterling', guestCount: 2, status: 'confirmed' },
]);
```

```ts
[ApiUrlsV1.pos.pointOfSale.reservation.list]: MOCK_RESERVATIONS,
```

`resource('/v1/pos/point-of-sale/reservation')` creates:

| Call                     | Method | Path                                    |
| ------------------------ | ------ | --------------------------------------- |
| `reservation.list`       | GET    | `/v1/pos/point-of-sale/reservation`     |
| `reservation.create`     | POST   | same URL                                |
| `reservation.detail(id)` | GET    | `/v1/pos/point-of-sale/reservation/:id` |
| `reservation.update(id)` | PUT    | same item URL                           |
| `reservation.remove(id)` | DELETE | same item URL                           |

A one-off action is a string beside the resource, such as `cancel: '/v1/pos/point-of-sale/reservation/cancel'`.

```ts
reservation: resource('/v1/pos/point-of-sale/reservation'),
```

First paint, in the route:

```tsx
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { serverApi } from '@/services/api/serverClient';
import { ReservationList } from '@/features/pos/point-of-sale/reservation';

export default async function PosReservationPage() {
  const reservations = await serverApi.get(ApiUrlsV1.pos.pointOfSale.reservation.list);
  return <ReservationList initialReservations={reservations} />;
}
```

Search and filters, in the screen:

```tsx
const reservations = useApiQuery({
  path: ApiUrlsV1.pos.pointOfSale.reservation.list,
  params: { search, page, pageSize },
  initialData: initialReservations,
});
```

Create, then refresh the list:

```tsx
const createReservation = useApiMutation({
  path: ApiUrlsV1.pos.pointOfSale.reservation.create,
  method: 'POST',
  invalidatePath: ApiUrlsV1.pos.pointOfSale.reservation.list,
});

createReservation.mutate({ guest, phone, guestCount });
```

Update with `method: 'PUT'` and `reservation.update(id)`. Delete with `method: 'DELETE'` and `reservation.remove(id)`.

### API rules

- `API_BASE_URL` and `API_SECRET` are server environment variables. Do not prefix them with `NEXT_PUBLIC_`.
- Auth routes live on `ApiUrlsV1.auth`. Login, register, forgot password, and reset password are public. A successful login stores the session in an httpOnly cookie and removes the token from the response. Every other route requires that cookie.
- `serverApi` in `src/services/api/serverClient.ts` is the only code that calls the backend. It sends `API_SECRET` itself and strips sensitive fields before returning data.
- `pnpm dev` leaves screens as they are. A screen that still imports `src/lib/mocks` keeps rendering that mock. A screen that calls `serverApi` or `useApiQuery` uses the real API.
- `pnpm run start-mocked` sets `API_MOCK=true`. `src/services/api/handler.ts` then returns mock data for every integrated path, including ones that already call the API. Do not branch on that flag inside a screen. Every new `ApiUrlsV1` path gets an entry in `handler.ts` in the same change.
- One schema describes the API response and the mock. After adding an endpoint, update `src/lib/schemas/<domain>/<module>/<screen>/` and parse the mock rows with that schema so both shapes stay the same.
- The browser client never accepts an absolute URL and never attaches `API_SECRET`. Do not call `fetch` with the backend URL from a screen.
- A Server Action is appropriate when a form should submit without a client hook. The action calls `serverApi` and imports its path from `ApiUrlsV1`.
- The screen reads `isPending`, `isError`, and `error` and renders `Loading` or `AlertMessage`.
- Every API hook lives under `src/lib/hooks/`. A hook for one screen is `src/lib/hooks/<domain>/<module>/<screen>/useThing.ts`. A hook shared by screens in that module moves up to `src/lib/hooks/<domain>/<module>/`. Do not add `hooks/` inside `src/features/`.
- Every API schema lives under `src/lib/schemas/`. A schema for one screen is `src/lib/schemas/<domain>/<module>/<screen>/<name>Schema.ts`. A schema shared by screens in that module moves up to `src/lib/schemas/<domain>/<module>/`. Do not add `schemas/` inside `src/features/` or `src/services/`.
- Do not copy server results into Zustand. Zustand stays limited to sidebar and theme state.

## 11. Styling

- Use MUI `Box`, `Stack`, `Typography`, and `sx`.
- Import colors from `@/lib/theme/mui/colors`. Spacing uses the theme scale (`p: 2`, `gap: 1.5`).
- Icons come from `lucide-react` or a direct `@mui/icons-material/<IconName>` import.
- New colors go into `src/lib/theme/mui/colors.ts` before they are used in a component.
- Do not add a global CSS file for a screen.

## 12. Imports and names

Import order:

1. React and Next
2. External packages (`@mui/*`, `lucide-react`)
3. `@/` aliases
4. Relative imports of files in the same screen folder

Use `@/`. Do not write `../../../../`.

| Kind           | Pattern                        | Example                    |
| -------------- | ------------------------------ | -------------------------- |
| Component file | PascalCase                     | `ReservationList.tsx`      |
| Hook file      | camelCase starting with `use`  | `useReservationFilters.ts` |
| Schema file    | camelCase ending with `Schema` | `reservationFormSchema.ts` |
| Mock file      | camelCase ending with `.mocks` | `usePosOrders.mocks.ts`    |
| Helper file    | camelCase                      | `posStatusHelpers.ts`      |
| Constants      | UPPER_SNAKE_CASE               | `MOCK_DUE_PAYMENTS`        |
| Route folder   | kebab-case URL segment         | `due-payments/page.tsx`    |

## 13. App shell

`src/app/layout.tsx` wraps every page with `AppProvider` and `AppShell`. Do not mount a second sidebar or navbar inside a feature screen.

`src/app/sidebar.ts` owns the menu tree and permission strings. A new screen that should appear in the menu gets an entry there. Role checks read that catalog. They are not hardcoded inside the screen.

The root `<html>` keeps `suppressHydrationWarning`.

## 14. Quality bar for every screen

Each screen handles:

- Loading
- Error, with an `AlertMessage`
- Empty list
- The success path
- A layout that still works when the sidebar is collapsed

Before finishing:

```bash
pnpm typecheck
pnpm lint
```

Run `pnpm codequality` before a commit. It runs lint, typecheck, Prettier, cspell, and knip.

Remove temporary `console.log` calls. Comments explain a non-obvious layout or business rule, not the next line of code.
