import { CompactTablesContent } from './compact-tables-content';
import type { TablesPageViewModel } from './use-tables-page';

export function TablesMobileContent(props: Readonly<TablesPageViewModel>) {
  return <CompactTablesContent {...props} layout="mobile" />;
}
