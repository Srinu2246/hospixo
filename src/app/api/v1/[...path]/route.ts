import { createVersionedHandlers } from '@/app/api/versionedProxy';

export const dynamic = 'force-dynamic';

const handlers = createVersionedHandlers('v1');

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
