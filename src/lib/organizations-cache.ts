import { queryClient } from '@api/queryClient';

import { organizationQueryKeys } from '@/hooks/organizations/useOrganizationsList';

export function clearOrganizationsCache(): void {
  void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
}
