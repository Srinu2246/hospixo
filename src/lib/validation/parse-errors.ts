import type { ZodError, ZodType } from 'zod';

/** First issue message for a top-level field on a Zod error. */
export function getZodFieldError(error: ZodError, field: string): string | null {
  const issue = error.issues.find((item) => item.path[0]?.toString() === field);
  return issue?.message ?? null;
}

/** Run a schema and return the first issue message for a top-level field (supports `.superRefine`). */
export function getZodSchemaFieldError(
  schema: ZodType,
  data: unknown,
  field: string,
): string | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return null;
  }
  return getZodFieldError(result.error, field);
}

/** Map the first Zod issue per top-level field key to a single inline message. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}
