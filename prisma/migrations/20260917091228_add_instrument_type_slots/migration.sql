-- CreateTable
CREATE TABLE "instrument_type_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_type" TEXT NOT NULL,
    "max_concurrent_loans" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "instrument_type_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instrument_type_slots_instrument_type_key" ON "instrument_type_slots"("instrument_type");

-- AddForeignKey
ALTER TABLE "instrument_type_slots" ADD CONSTRAINT "instrument_type_slots_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
