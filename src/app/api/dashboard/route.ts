import { NextResponse } from 'next/server';

import { getAdminSession } from '@/services/auth.server';
import { getDashboardOverview } from '@/services/dashboard.server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await getDashboardOverview();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard',
      },
      { status: 500 },
    );
  }
}
