import { z } from "zod";

export type FieldErrors = Partial<Record<string, string>>;

export function validationErrors<T>(error: z.ZodError<T>): {
  error: string | null;
  fieldErrors: FieldErrors;
} {
  const flattened = z.flattenError(error);
  const fieldErrors: FieldErrors = {};
  for (const [field, messages] of Object.entries<string[] | undefined>(
    flattened.fieldErrors,
  )) {
    const first = messages?.[0];
    if (first) fieldErrors[field] = first;
  }
  return { error: flattened.formErrors[0] ?? null, fieldErrors };
}

export function hasFieldErrors(fieldErrors: FieldErrors): boolean {
  return Object.values(fieldErrors).some(Boolean);
}
