import { NextResponse } from 'next/server';

import { loadPosCashShiftData } from '@/features/pos/api/cash-shift.server';
import { jsonOk } from '@/lib/api/route-response';

export async function GET() {
  try {
    const data = await loadPosCashShiftData();
    return jsonOk(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load cash counter.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
