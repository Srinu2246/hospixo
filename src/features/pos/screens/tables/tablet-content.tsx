import { CompactTablesContent } from './compact-tables-content';
import type { TablesPageViewModel } from './use-tables-page';

export function TablesTabletContent(props: Readonly<TablesPageViewModel>) {
  return <CompactTablesContent {...props} layout="tablet" />;
}
