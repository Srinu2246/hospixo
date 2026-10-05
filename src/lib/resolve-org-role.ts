import { listRoles } from '@/lib/api/roles';
import { matchLiveRoleCode } from '@/lib/roles-map';

/**
 * Invitation/user create must send a role_code that exists in this org.
 * UI templates still use Figma ids (`branch-manager` → `branch_manager`) which
 * 400 when the tenant catalog uses a different active code.
 */
export async function resolveOrgRoleCode(token: string, requested: string): Promise<string> {
  const trimmed = requested.trim();
  if (!trimmed) {
    throw new Error('Select a role before continuing.');
  }

  const roles = await listRoles(token);
  const liveCode = matchLiveRoleCode(trimmed, roles.items);
  if (!liveCode) {
    throw new Error(
      `Role '${trimmed}' is not available in this organization. Create or activate it in Users & Roles, then try again.`,
    );
  }

  return liveCode;
}
