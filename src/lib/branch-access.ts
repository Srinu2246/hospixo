import { listBranches } from '@/lib/api/branches';
import { resolveAccessLevel } from '@/lib/auth/access-level';

type BranchAccessUser = Readonly<{
  scope?: string | null;
  branch_id?: number | string | null;
  roles?: readonly string[] | null;
  company_id?: number | string | null;
}>;

type BranchAccessResult =
  Readonly<{ ok: true }> | Readonly<{ ok: false; message: string; status: 400 | 403 }>;

function toPositiveBranchId(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Check that branch-scoped users cannot access another branch. */
export async function authorizeBranchAccess(
  user: BranchAccessUser,
  branchId: number | string,
  _options: Readonly<{ token?: string | null }> = {},
): Promise<BranchAccessResult> {
  const targetId = toPositiveBranchId(branchId);
  if (targetId == null) {
    return { ok: false, message: 'A valid branch is required.', status: 400 };
  }

  // Mirrors floors-server.ts's isBranchScoped: any user whose resolved access
  // level is branch-scoped (hierarchy "branch" or an operational role) must be
  // pinned to their own assigned branch, regardless of the raw `scope` string.
  const level = resolveAccessLevel({
    roles: user.roles ?? [],
    scope: user.scope ?? '',
    company_id: toPositiveBranchId(user.company_id),
    branch_id: toPositiveBranchId(user.branch_id),
  });
  const isBranchScoped =
    level === 'branch' || level === 'counter' || level === 'captain' || level === 'kitchen';

  if (isBranchScoped) {
    const assignedId = toPositiveBranchId(user.branch_id);
    if (assignedId == null || assignedId !== targetId) {
      return { ok: false, message: 'You do not have access to this branch.', status: 403 };
    }
    return { ok: true };
  }

  const token = _options.token;
  if (!token) {
    return { ok: false, message: 'You do not have access to this branch.', status: 403 };
  }

  try {
    const branches = await listBranches(token);
    const allowed = branches.items.some((branch) => toPositiveBranchId(branch.id) === targetId);
    return allowed
      ? { ok: true }
      : { ok: false, message: 'You do not have access to this branch.', status: 403 };
  } catch {
    return { ok: false, message: 'You do not have access to this branch.', status: 403 };
  }
}
