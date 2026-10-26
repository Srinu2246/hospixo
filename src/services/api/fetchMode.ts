/**
 * Controls where list/detail GETs run.
 *
 * - `NEXT_PUBLIC_API_SERVER_FETCH=true` → load in the route with `serverApi` (RSC).
 *   Browser GETs via `api` / React Query are disabled so DevTools does not show `/api/...` reads.
 * - `false` / unset → client may call same-origin BFF (`/api/v1|v2`) as today.
 *
 * Mutations (POST/PUT/PATCH/DELETE) and auth stay on the client BFF either way.
 * Must be NEXT_PUBLIC_ so the browser and server share the same mode.
 */
export function isApiServerFetchEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_API_SERVER_FETCH?.trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'on';
}

export function isApiClientFetchEnabled(): boolean {
  return !isApiServerFetchEnabled();
}
