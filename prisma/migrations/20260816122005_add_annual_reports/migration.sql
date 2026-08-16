-- CreateTable
CREATE TABLE "annual_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "period_end" DATE NOT NULL,
    "summary" JSONB NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annual_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "annual_reports" ADD CONSTRAINT "annual_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
