import 'server-only';

import WebSocket from 'ws';

import { buildBranchOrderEventsWsUrl } from '@/services/api/ApiUrlsV1';

export function buildPosOrderStreamAuthPayload(input: {
  token: string;
  branchId: number;
  companyId?: number;
}): string {
  const body: Record<string, unknown> = {
    type: 'auth',
    token: input.token,
    branch_id: input.branchId,
  };
  if (input.companyId != null && input.companyId > 0) {
    body.company_id = input.companyId;
  }
  return JSON.stringify(body);
}

export function connectBranchOrderEventsUpstream(options: {
  apiBaseUrl: string;
  branchId: number;
  companyId?: number;
  sessionToken: string;
  useBearerHandshake?: boolean;
  sendAuthMessage?: boolean;
  onMessage: (raw: string) => void;
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (error: Error) => void;
}): WebSocket {
  const url = buildBranchOrderEventsWsUrl(options.apiBaseUrl, options.branchId);
  const headers: Record<string, string> = {};
  if (options.useBearerHandshake !== false) {
    headers.Authorization = `Bearer ${options.sessionToken}`;
    headers['X-Session-Id'] = options.sessionToken;
  }
  headers['X-Branch-Id'] = String(options.branchId);
  if (options.companyId != null && options.companyId > 0) {
    headers['X-Company-Id'] = String(options.companyId);
  }

  const ws = new WebSocket(url, { headers });

  ws.on('open', () => {
    const shouldSendAuth = options.sendAuthMessage === true || options.useBearerHandshake === false;
    if (shouldSendAuth) {
      try {
        ws.send(
          buildPosOrderStreamAuthPayload({
            token: options.sessionToken,
            branchId: options.branchId,
            companyId: options.companyId,
          }),
        );
      } catch {
        /* auth send failed */
      }
    }
    options.onOpen?.();
  });

  ws.on('message', (data) => {
    const raw = typeof data === 'string' ? data : data.toString('utf8');
    options.onMessage(raw);
  });

  ws.on('close', (code, reasonBuffer) => {
    options.onClose?.(code, reasonBuffer.toString('utf8'));
  });

  ws.on('error', (err) => {
    options.onError?.(err instanceof Error ? err : new Error(String(err)));
  });

  return ws;
}
