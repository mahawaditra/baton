-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'cancel_request';

-- AlterEnum
ALTER TYPE "BorrowingRequestStatus" ADD VALUE 'cancelled';

-- AlterTable
ALTER TABLE "borrowing_requests" ADD COLUMN     "cancellation_reason" TEXT;
