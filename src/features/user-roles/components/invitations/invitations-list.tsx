'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { routes } from '@/config/routes';
import type { InvitationsListPageData } from '@/lib/invitations-server';

type InvitationsListProps = Readonly<{
  data: InvitationsListPageData;
}>;

/**
 * Invitations list UI (CSR shell).
 * Rows come from the Server Component — no client mount fetch.
 */
export function InvitationsList({ data }: InvitationsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function pushQuery(next: { page?: number; status?: string }) {
    const params = new URLSearchParams();
    const page = next.page ?? data.page;
    const status = next.status ?? data.status;

    if (page > 1) params.set('page', String(page));
    if (status) params.set('status', status);

    const qs = params.toString();
    startTransition(() => {
      router.push(
        qs
          ? `${routes.platform.usersRoles.invitations}?${qs}`
          : routes.platform.usersRoles.invitations,
      );
    });
  }

  if (data.error) {
    return (
      <p role="alert">
        {data.error}{' '}
        {/sign in required/i.test(data.error) ? (
          <Link href={routes.auth.login}>Go to login</Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              startTransition(() => router.refresh());
            }}
          >
            Retry
          </button>
        )}
      </p>
    );
  }

  return (
    <div>
      <h1>Invitations</h1>
      {isPending ? <p>Updating…</p> : null}
      {data.items.length === 0 ? (
        <p>No invitations.</p>
      ) : (
        <ul>
          {data.items.map((invite) => (
            <li key={invite.id}>
              <Link href={`${routes.platform.usersRoles.invitations}/${invite.id}`}>
                {invite.email} — {invite.status}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data.totalPages > 1 ? (
        <nav aria-label="Invitations pagination">
          <button
            type="button"
            disabled={data.page <= 1 || isPending}
            onClick={() => pushQuery({ page: data.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            disabled={data.page >= data.totalPages || isPending}
            onClick={() => pushQuery({ page: data.page + 1 })}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
