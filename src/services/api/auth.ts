/** Admin auth BFF — raw HTTP only (AGENTS §6). */

export async function postAdminLoginRequest(formData: FormData): Promise<{
  ok: boolean;
  payload: unknown;
}> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });

  const payload = await response.json().catch(() => null);
  return { ok: response.ok, payload };
}

export async function postAdminLogoutRequest(): Promise<Response> {
  return fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  });
}
