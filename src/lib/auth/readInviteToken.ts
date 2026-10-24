type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? '';
}

/** Pull `token` out of a query key when the `=` was encoded as `%3D`. */
function tokenFromKey(key: string): string {
  const match = /^token=(.+)$/.exec(key.trim());
  return match?.[1]?.trim() ?? '';
}

/**
 * Invitation links from email sometimes arrive as `?token%3D<token>` instead of
 * `?token=<token>`, so the token is not a normal query value.
 */
export function readInviteToken(params: SearchParams): string {
  const direct = firstParam(params.token);
  if (direct) return direct;

  for (const key of Object.keys(params)) {
    const embedded = tokenFromKey(key);
    if (embedded) return embedded;
  }

  return '';
}

export function readInviteTokenFromSearch(search: string): string {
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) return '';

  const params = new URLSearchParams(query);
  const record: SearchParams = {};
  params.forEach((value, key) => {
    if (record[key] === undefined) record[key] = value;
  });

  const parsed = readInviteToken(record);
  if (parsed) return parsed;

  try {
    const decoded = decodeURIComponent(query);
    if (decoded === query) return '';
    const decodedParams = new URLSearchParams(decoded);
    const decodedRecord: SearchParams = {};
    decodedParams.forEach((value, key) => {
      if (decodedRecord[key] === undefined) decodedRecord[key] = value;
    });
    return readInviteToken(decodedRecord);
  } catch {
    return '';
  }
}
