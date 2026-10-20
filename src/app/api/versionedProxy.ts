import { NextResponse, type NextRequest } from 'next/server';

import { serverApi } from '@/services/api/serverClient';
import { ApiError, type HttpMethod, type QueryParams } from '@/services/api/types';

type ApiVersion = 'v1' | 'v2';

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export function createVersionedHandlers(version: ApiVersion) {
  async function handle(
    request: NextRequest,
    method: HttpMethod,
    context: RouteContext,
  ): Promise<NextResponse> {
    try {
      const { path: pathSegments } = await context.params;
      const path = pathnameFromSegments(version, pathSegments);
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

  return {
    GET: (request: NextRequest, context: RouteContext) => handle(request, 'GET', context),
    POST: (request: NextRequest, context: RouteContext) => handle(request, 'POST', context),
    PUT: (request: NextRequest, context: RouteContext) => handle(request, 'PUT', context),
    PATCH: (request: NextRequest, context: RouteContext) => handle(request, 'PATCH', context),
    DELETE: (request: NextRequest, context: RouteContext) => handle(request, 'DELETE', context),
  };
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

function pathnameFromSegments(version: ApiVersion, segments: string[]): string {
  if (
    !segments?.length ||
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new ApiError('Unknown endpoint', 404);
  }

  return `/${version}/${segments.join('/')}`;
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
    // Pass through the exact backend body when we have it.
    if (error.details != null && typeof error.details === 'object') {
      return NextResponse.json(error.details, { status: error.status });
    }
    if (typeof error.details === 'string' && error.details.trim()) {
      return NextResponse.json({ message: error.details }, { status: error.status });
    }
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error('API route failed');
  return NextResponse.json({ message: 'Request failed' }, { status: 500 });
}
