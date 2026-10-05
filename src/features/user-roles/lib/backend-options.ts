import type { ApiBranch } from '@/types/branches';
import type { ApiRole } from '@/types/roles';

export type BackendSelectOption = Readonly<{
  value: string;
  label: string;
}>;

export function toBranchSelectOptions(
  branches: readonly Partial<ApiBranch>[],
): BackendSelectOption[] {
  return branches
    .filter((branch): branch is Partial<ApiBranch> & { id: number | string; name: string } => {
      const id = branch.id;
      return Boolean(id) && Boolean(branch.name);
    })
    .map((branch) => ({
      value: String(branch.id),
      label: branch.name,
    }));
}

export function toRoleSelectOptions(roles: readonly Partial<ApiRole>[]): BackendSelectOption[] {
  return roles
    .filter((role): role is Partial<ApiRole> & { id: number | string; display_name: string } => {
      const id = role.id;
      return Boolean(id) && Boolean(role.display_name);
    })
    .map((role) => ({
      value: String(role.id),
      label: role.display_name,
    }));
}
