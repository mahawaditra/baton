ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_admin_id_fkey";
ALTER TABLE "inventory_snapshots" DROP CONSTRAINT "inventory_snapshots_created_by_fkey";
ALTER TABLE "annual_reports" DROP CONSTRAINT "annual_reports_created_by_fkey";

ALTER TABLE "activity_logs" ADD COLUMN "admin_name" TEXT,
ALTER COLUMN "admin_id" DROP NOT NULL;

ALTER TABLE "inventory_snapshots" ADD COLUMN "creator_name" TEXT,
ALTER COLUMN "created_by" DROP NOT NULL;

ALTER TABLE "annual_reports" ADD COLUMN "creator_name" TEXT,
ALTER COLUMN "created_by" DROP NOT NULL;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "annual_reports" ADD CONSTRAINT "annual_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
