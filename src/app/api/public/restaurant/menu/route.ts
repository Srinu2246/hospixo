/**
 * BFF: Public guest menu
 * GET /api/public/restaurant/menu → GET backend /v1/public/restaurant/menu
 */

import { NextResponse } from 'next/server';

import { fetchPublicRestaurantMenu } from '@/lib/api/public-restaurant-menu';
import type { PublicRestaurantMenuQuery } from '@/features/floor-table-setup/types/public-restaurant-menu';
import { ApiError } from '@/services/api/types';

function parseRequiredId(raw: string | null): number | null {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseQuery(searchParams: URLSearchParams): PublicRestaurantMenuQuery | null {
  const floor_id = parseRequiredId(searchParams.get('floor_id'));
  const section_id = parseRequiredId(searchParams.get('section_id'));
  const branch_id = parseRequiredId(searchParams.get('branch_id'));
  const menu_id = parseRequiredId(searchParams.get('menu_id'));

  if (floor_id == null || section_id == null || branch_id == null || menu_id == null) {
    return null;
  }

  return { floor_id, section_id, branch_id, menu_id };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseQuery(searchParams);

  if (query == null) {
    return NextResponse.json(
      {
        success: false,
        message: 'floor_id, section_id, branch_id, and menu_id are required positive numbers.',
      },
      { status: 400 },
    );
  }

  try {
    const data = await fetchPublicRestaurantMenu(query);
    return NextResponse.json({ success: true, data, message: 'OK' });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Unable to load public restaurant menu.';
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status: status >= 400 ? status : 500 });
  }
}
