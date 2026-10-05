export function sanitizeUrlPath(path: string): string {
  return path.split('?')[0] ?? path;
}
