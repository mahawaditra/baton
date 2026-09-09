-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'transfer_to_ongoing';

-- AlterTable
ALTER TABLE "borrowing_requests" ADD COLUMN     "carried_over_at" TIMESTAMP(3);
