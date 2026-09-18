-- AlterTable
ALTER TABLE "loan_settings" ADD COLUMN     "signatory_line_add_friend_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signatory_line_add_friend_url" TEXT;
