import { NextResponse, type NextRequest } from 'next/server';

import { serverApi } from '@/services/api/serverClient';
import { ApiError, type HttpMethod, type QueryParams } from '@/services/api/types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    path: string[];
  };
};

async function handle(
  request: NextRequest,
  method: HttpMethod,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const path = pathnameFromSegments(context.params.path);
    const data = await callServerApi(
      method,
      path,
      searchParamsOf(request),
      await readJsonBody(request, method),
    );

    if (data === undefined) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return handle(request, 'GET', context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return handle(request, 'POST', context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return handle(request, 'PUT', context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, 'PATCH', context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, 'DELETE', context);
}

function callServerApi(
  method: HttpMethod,
  path: string,
  params: QueryParams,
  body: unknown,
): Promise<unknown> {
  if (method === 'GET') return serverApi.get(path, params);
  if (method === 'PUT') return serverApi.put(path, body);
  if (method === 'PATCH') return serverApi.patch(path, body);
  if (method === 'DELETE') return serverApi.delete(path);
  return serverApi.post(path, body);
}

function pathnameFromSegments(segments: string[]): string {
  if (
    !segments?.length ||
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new ApiError('Unknown endpoint', 404);
  }

  return `/v1/${segments.join('/')}`;
}

function searchParamsOf(request: NextRequest): QueryParams {
  const params: QueryParams = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

async function readJsonBody(request: NextRequest, method: HttpMethod): Promise<unknown> {
  if (method === 'GET') return undefined;

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;

  try {
    return await request.json();
  } catch {
    throw new ApiError('Invalid JSON body', 400);
  }
}

function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error('API route failed');
  return NextResponse.json({ message: 'Request failed' }, { status: 500 });
}
