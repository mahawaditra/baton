export function calculateDepositRefund(params: {
  daysLate: number;
  depositAmount: number;
  depositGraceDays: number;
  depositPartialAmount: number;
}): number {
  const { daysLate, depositAmount, depositGraceDays, depositPartialAmount } =
    params;
  if (daysLate <= 0) return depositAmount;
  if (daysLate <= depositGraceDays) return depositPartialAmount;
  return 0;
}

export function determineInstrumentStatusOnReturn(
  condition: "ok" | "need_repair" | "retired" | "lost",
  requestedStatus: "available" | "unavailable",
): "available" | "unavailable" {
  return condition === "retired" || condition === "lost"
    ? "unavailable"
    : requestedStatus;
}
