import { revalidatePath } from "next/cache";

export function revalidateRequestViews(
  requestId: string,
  options: {
    instrumentIds?: (string | null | undefined)[];
    archive?: boolean;
  } = {},
) {
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/activity");

  const instrumentIds = (options.instrumentIds ?? []).filter(
    (id): id is string => Boolean(id),
  );
  for (const id of instrumentIds) {
    revalidatePath(`/admin/instruments/${id}`);
  }
  if (instrumentIds.length > 0) {
    revalidatePath("/admin/instruments");
  }

  if (options.archive) {
    revalidatePath("/admin/archive");
  }
}
