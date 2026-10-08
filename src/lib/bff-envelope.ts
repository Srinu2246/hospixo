/** Unwrap `{ success, data }` BFF JSON or pass through raw payloads. */
export function unwrapBffData<T>(payload: unknown): T {
  if (payload != null && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
