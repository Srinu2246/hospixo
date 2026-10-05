/**
 * BFF: Users collection
 * - GET  /api/users  → GET  /api/v1/users   (list — Users & Roles page)
 * - POST /api/users  → POST /api/v1/users   (create — Add User review, invite off)
 *
 * POST runs withCallerScope so company_id / branch_id come from the session when needed.
 */

import { createUser, listUsers } from '@/lib/api/users';
import type { CreateUserInput, ListUsersQuery, UserStatus } from '@/types/users';
import { jsonOk, requireAccessToken, usersApiError, withCallerScope } from '@/lib/users-api-route';

function parseListQuery(url: URL): ListUsersQuery {
  const page = url.searchParams.get('page');
  const pageSize = url.searchParams.get('page_size');
  const branchId = url.searchParams.get('branch_id');

  return {
    q: url.searchParams.get('q') ?? undefined,
    search: url.searchParams.get('search') ?? undefined,
    status: (url.searchParams.get('status') as UserStatus | null) ?? undefined,
    branch_id: branchId ? Number(branchId) : undefined,
    page: page ? Number(page) : undefined,
    page_size: pageSize ? Number(pageSize) : undefined,
  };
}

/** GET /api/users → GET /api/v1/users */
export async function GET(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const data = await listUsers(auth.token, parseListQuery(new URL(request.url)));
    return jsonOk(data);
  } catch (err) {
    return usersApiError(err, 'Unable to load users.');
  }
}

/** POST /api/users → POST /api/v1/users */
export async function POST(request: Request) {
  const auth = await requireAccessToken();
  if (auth.error) return auth.error;

  try {
    const body = (await request.json()) as CreateUserInput;
    const scoped = await withCallerScope({ ...body });
    const data = await createUser(auth.token, scoped);
    return jsonOk(data, { status: 201 });
  } catch (err) {
    return usersApiError(err, 'Unable to create user.');
  }
}
