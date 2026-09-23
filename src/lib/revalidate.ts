import { revalidatePath } from "next/cache";

export function revalidateRequestViews(
  requestId: string,
  options: {
    instrumentIds?: (string | null | undefined)[];
    archive?: boolean;
  } = {},
) {
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  revalidatePath("/dashboard");
  revalidatePath("/activity");

  const instrumentIds = (options.instrumentIds ?? []).filter(
    (id): id is string => Boolean(id),
  );
  for (const id of instrumentIds) {
    revalidatePath(`/instruments/${id}`);
  }
  if (instrumentIds.length > 0) {
    revalidatePath("/instruments");
  }

  if (options.archive) {
    revalidatePath("/archive");
  }
}
