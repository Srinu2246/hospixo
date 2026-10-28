# POS real-time order events (WebSocket)

See backend spec for connect URL, auth message, event types, and client algorithm.

## Frontend (this repo)

Browsers use a same-origin **SSE relay** (JWT stays in httpOnly cookie):

- `GET /api/realtime/branch-order-events/stream?branchId=&companyId=`
- `useBranchOrderEventsStream` — shared `EventSource` per branch; handles `ready`, `resync`, `event`, heartbeat.

Kitchen Display loads `kitchen-board` only after `{ "type": "ready" }`, then reloads the board on `resync` and batched `event` signals (no polling while the stream is live). Changing preparation station triggers one intentional reload.
