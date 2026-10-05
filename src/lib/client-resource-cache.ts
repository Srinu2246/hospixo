/**
 * In-flight deduplicated, in-memory cached client fetchers (React StrictMode safe).
 */
export function createClientResourceCache<T, Args extends unknown[] = [string]>(
  urlBuilder: (...args: Args) => string,
  keyBuilder: (...args: Args) => string = (...args) => args.map(String).join('::'),
) {
  const inFlightMap = new Map<string, Promise<T>>();
  const cacheMap = new Map<string, T>();

  function clearCache(key?: string): void {
    if (key) {
      cacheMap.delete(key);
      inFlightMap.delete(key);
    } else {
      cacheMap.clear();
      inFlightMap.clear();
    }
  }

  async function fetchResource(
    options: { forceRefresh?: boolean } | undefined,
    ...args: Args
  ): Promise<T> {
    const key = keyBuilder(...args);
    const forceRefresh = options?.forceRefresh ?? false;

    if (!forceRefresh && cacheMap.has(key)) {
      return cacheMap.get(key)!;
    }

    if (!forceRefresh && inFlightMap.has(key)) {
      return inFlightMap.get(key)!;
    }

    const promise = (async () => {
      try {
        const url = urlBuilder(...args);
        const res = await fetch(url, {
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Failed to load resource: ${res.statusText}`);
        }

        const data = (await res.json()) as T;
        cacheMap.set(key, data);
        return data;
      } catch (err) {
        cacheMap.delete(key);
        throw err;
      } finally {
        inFlightMap.delete(key);
      }
    })();

    inFlightMap.set(key, promise);
    return promise;
  }

  function seedCache(data: T, ...args: Args): void {
    const key = keyBuilder(...args);
    cacheMap.set(key, data);
    inFlightMap.delete(key);
  }

  return {
    fetchResource,
    clearCache,
    peekCache: (key: string) => cacheMap.get(key) ?? null,
    seedCache,
  };
}
