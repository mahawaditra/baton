/*
  Warnings:

  - The values [remove_admin] on the enum `ActivityAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityAction_new" AS ENUM ('assign_instrument', 'notify_available', 'approve_documents', 'reject_documents', 'confirm_ready', 'confirm_handover', 'confirm_return', 'confirm_extension', 'update_instrument', 'update_goods', 'update_loan_settings', 'export_snapshot', 'generate_annual_report', 'reject_request', 'cancel_request', 'add_admin', 'create_instrument', 'create_goods', 'deactivate_admin', 'reactivate_admin');
ALTER TABLE "activity_logs" ALTER COLUMN "action" TYPE "ActivityAction_new" USING ("action"::text::"ActivityAction_new");
ALTER TYPE "ActivityAction" RENAME TO "ActivityAction_old";
ALTER TYPE "ActivityAction_new" RENAME TO "ActivityAction";
DROP TYPE "public"."ActivityAction_old";
COMMIT;

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
