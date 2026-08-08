-- CreateIndex
CREATE INDEX "borrowing_requests_status_idx" ON "borrowing_requests"("status");

-- CreateIndex
CREATE INDEX "instruments_status_is_loanable_condition_idx" ON "instruments"("status", "is_loanable", "condition");
