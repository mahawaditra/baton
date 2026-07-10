/*
  Warnings:

  - You are about to drop the `TestPing` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InstrumentStatus" AS ENUM ('available', 'reserved', 'borrowed', 'placed', 'unavailable');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('ok', 'need_repair', 'retired', 'lost');

-- CreateEnum
CREATE TYPE "BorrowingRequestStatus" AS ENUM ('submitted', 'reviewing', 'contract_generated', 'documents_uploaded', 'ready_to_pickup', 'active', 'returned', 'rejected', 'overdue');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('initial', 'extension');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('signed_contract', 'deposit_proof', 'ktp_scan');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AddendumTiming" AS ENUM ('initial', 'final');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'admin');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('assign_instrument', 'approve_documents', 'reject_documents', 'confirm_ready', 'confirm_handover', 'confirm_return', 'confirm_extension', 'update_instrument', 'update_goods', 'update_loan_settings', 'export_snapshot', 'reject_request', 'add_admin', 'remove_admin');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('borrowing_request', 'loan_period', 'instrument', 'goods', 'loan_settings');

-- DropTable
DROP TABLE "TestPing";

-- CreateTable
CREATE TABLE "instruments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "section" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "serial_number" TEXT,
    "condition" "ItemCondition" NOT NULL DEFAULT 'ok',
    "status" "InstrumentStatus" NOT NULL DEFAULT 'available',
    "is_loanable" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT NOT NULL DEFAULT 'Sekre',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" "ItemCondition" NOT NULL DEFAULT 'ok',
    "location" TEXT NOT NULL DEFAULT 'RB1',
    "registration_no" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "due_date" DATE NOT NULL,
    "deposit_amount" INTEGER NOT NULL DEFAULT 100000,
    "deposit_partial_amount" INTEGER NOT NULL DEFAULT 50000,
    "deposit_grace_days" INTEGER NOT NULL DEFAULT 14,
    "bank_name" TEXT NOT NULL,
    "bank_account" TEXT NOT NULL,
    "bank_holder" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "loan_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borrowing_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" TEXT NOT NULL,
    "access_code" TEXT NOT NULL,
    "instrument_id" UUID,
    "instrument_type_requested" TEXT NOT NULL,
    "borrower_name" TEXT NOT NULL,
    "borrower_email" TEXT NOT NULL,
    "borrower_phone" TEXT NOT NULL,
    "borrower_line_id" TEXT NOT NULL,
    "borrower_year" TEXT NOT NULL,
    "borrower_ktp_number" TEXT,
    "borrower_address_ktp" TEXT,
    "borrower_address_domicile" TEXT,
    "borrower_faculty" TEXT,
    "guardian_name" TEXT,
    "guardian_phone" TEXT,
    "guardian_address_ktp" TEXT,
    "deposit_refund_amount" INTEGER,
    "status" "BorrowingRequestStatus" NOT NULL DEFAULT 'submitted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "borrowing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "period_type" "PeriodType" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "start_date" DATE,
    "actual_return_date" DATE,
    "contract_drive_file_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "period_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "drive_file_id" TEXT NOT NULL,
    "review_status" "DocumentReviewStatus" NOT NULL DEFAULT 'pending',
    "reviewer_notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addendums" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "period_id" UUID NOT NULL,
    "timing" "AddendumTiming" NOT NULL,
    "instrument_type" TEXT NOT NULL,
    "instrument_brand" TEXT,
    "instrument_serial" TEXT,
    "completeness" TEXT NOT NULL,
    "body_condition" TEXT NOT NULL,
    "accessories_condition" TEXT,
    "drive_file_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addendums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "google_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL,
    "drive_file_id" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "borrowing_requests_ticket_id_key" ON "borrowing_requests"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_google_id_key" ON "admins"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "loan_settings" ADD CONSTRAINT "loan_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowing_requests" ADD CONSTRAINT "borrowing_requests_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_periods" ADD CONSTRAINT "loan_periods_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "borrowing_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "loan_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addendums" ADD CONSTRAINT "addendums_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "loan_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
