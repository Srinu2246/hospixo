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
        await readRequestBody(request, method),
        readCatalogueContextHeaders(request),
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
  contextHeaders: Record<string, string>,
): Promise<unknown> {
  const context = { contextHeaders };
  if (method === 'GET') return serverApi.get(path, params, undefined, context);
  if (method === 'PUT') return serverApi.put(path, body, undefined, context);
  if (method === 'PATCH') return serverApi.patch(path, body, undefined, context);
  if (method === 'DELETE') return serverApi.delete(path, undefined, context);
  return serverApi.post(path, body, undefined, context);
}

function readCatalogueContextHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const companyId = request.headers.get('x-company-id');
  const branchId = request.headers.get('x-branch-id');
  if (companyId?.trim()) headers['X-Company-Id'] = companyId.trim();
  if (branchId?.trim()) headers['X-Branch-Id'] = branchId.trim();
  return headers;
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

async function readRequestBody(request: NextRequest, method: HttpMethod): Promise<unknown> {
  if (method === 'GET') return undefined;

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return await request.formData();
  }

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
