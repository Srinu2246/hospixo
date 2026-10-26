import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import type { CreateMenuItemTagBody } from '@/lib/schemas/menu/menuItemTagsSchema';
import { ApiError } from '@/services/api/types';

export function menuItemTagNameToCode(name: string): string {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
  return normalized.length > 0 ? normalized : 'TAG';
}

export function buildCreateMenuItemTagBody(input: {
  name: string;
  code?: string;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
}): CreateMenuItemTagBody {
  const name = input.name.trim();
  const code = (input.code?.trim() || menuItemTagNameToCode(name)).slice(0, 64);

  if (input.pageScope === 'company' || input.pageScope === 'organization') {
    return { name, code };
  }

  if (input.pageScope === 'branch') {
    if (input.branchId == null || input.branchId <= 0) {
      throw new ApiError('Branch is required to create a tag for this account.', 400);
    }
    return {
      name,
      code,
      scope: 'branch',
      assign_branch_id: input.branchId,
    };
  }

  return { name, code };
}
