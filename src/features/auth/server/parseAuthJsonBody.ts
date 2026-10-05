import { NextResponse } from 'next/server';
import type { z } from 'zod';

export async function parseAuthJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request.';
    return NextResponse.json({ message }, { status: 400 });
  }

  return { data: parsed.data };
}
