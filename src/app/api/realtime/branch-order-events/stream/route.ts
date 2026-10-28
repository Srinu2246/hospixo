import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import WebSocket from 'ws';

import { POS_ORDER_STREAM_FATAL_CLOSE_CODES } from '@/lib/schemas/pos/point-of-sale/orderEvents/posOrderEventSchema';
import { connectBranchOrderEventsUpstream } from '@/services/api/branchOrderEventsRelay';
import { isApiProxyEnabled, isMockApiEnabled } from '@/services/api/handler';

const SESSION_COOKIE = 'session';
const RELAY_HEARTBEAT_MS = 20_000;
const MAX_UPSTREAM_ATTEMPTS = 6;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Same-origin SSE relay → upstream `wss://…/api/v1/ws/branches/{branch_id}/orders`. */
export async function GET(request: NextRequest) {
  if (isMockApiEnabled()) {
    return NextResponse.json({ error: 'Realtime disabled in mock mode' }, { status: 503 });
  }

  if (!isApiProxyEnabled()) {
    return NextResponse.json({ error: 'API proxy disabled' }, { status: 503 });
  }

  const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, '') ?? '';
  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  const branchIdRaw = request.nextUrl.searchParams.get('branchId');
  const branchId = branchIdRaw ? Number(branchIdRaw) : NaN;
  if (!Number.isFinite(branchId) || branchId <= 0) {
    return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
  }

  const companyIdRaw = request.nextUrl.searchParams.get('companyId');
  const companyId = companyIdRaw ? Number(companyIdRaw) : undefined;
  const resolvedCompanyId =
    companyId != null && Number.isFinite(companyId) && companyId > 0 ? companyId : undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const encoder = new TextEncoder();
  let upstream: WebSocket | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let upstreamAttempts = 0;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (chunk: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(chunk));
      };

      const closeAll = (upstreamCode?: number) => {
        if (closed) return;
        closed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        if (upstream && upstream.readyState === WebSocket.OPEN) {
          upstream.close();
        }
        upstream = null;
        if (upstreamCode != null) {
          enqueue(`event: upstream_close\ndata: ${JSON.stringify({ code: upstreamCode })}\n\n`);
        }
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const connectUpstream = () => {
        if (closed) return;
        upstream?.removeAllListeners();
        if (upstream && upstream.readyState === WebSocket.OPEN) {
          upstream.close();
        }

        upstream = connectBranchOrderEventsUpstream({
          apiBaseUrl,
          branchId,
          companyId: resolvedCompanyId,
          sessionToken: token,
          useBearerHandshake: true,
          sendAuthMessage: true,
          onMessage: (raw) => {
            upstreamAttempts = 0;
            enqueue(`data: ${JSON.stringify(raw)}\n\n`);
          },
          onClose: (code) => {
            if (POS_ORDER_STREAM_FATAL_CLOSE_CODES.has(code)) {
              closeAll(code);
              return;
            }
            upstreamAttempts += 1;
            if (upstreamAttempts >= MAX_UPSTREAM_ATTEMPTS) {
              closeAll(code);
              return;
            }
            enqueue(`: upstream-reconnecting\n\n`);
            setTimeout(connectUpstream, Math.min(1000 * upstreamAttempts, 8000));
          },
          onError: () => {
            /* close handler runs next */
          },
        });
      };

      enqueue(': relay-open\n\n');
      heartbeatTimer = setInterval(() => {
        enqueue(': relay-heartbeat\n\n');
      }, RELAY_HEARTBEAT_MS);

      connectUpstream();
      request.signal.addEventListener('abort', () => closeAll());
    },
    cancel() {
      closed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (upstream) upstream.close();
      upstream = null;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
