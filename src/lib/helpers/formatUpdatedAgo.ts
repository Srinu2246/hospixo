/** Relative “Updated … ago” label from an ISO timestamp. */
export function formatUpdatedAgo(value: string | null | undefined): string {
  if (!value) return 'Updated recently';
  const at = Date.parse(value);
  if (Number.isNaN(at)) return 'Updated recently';

  const minutes = Math.max(1, Math.round((Date.now() - at) / 60_000));
  if (minutes < 60) return `Updated ${minutes} mins ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Updated ${hours} hrs ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Updated 1 day ago';
  if (days < 14) return `Updated ${days} days ago`;

  const weeks = Math.round(days / 7);
  if (weeks < 8) return `Updated ${weeks} weeks ago`;

  return `Updated ${Math.round(days / 30)} months ago`;
}
