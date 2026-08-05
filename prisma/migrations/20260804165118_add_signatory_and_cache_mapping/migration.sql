/*
  Warnings:

  - Added the required column `signatory_address_domicile` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_address_ktp` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_faculty` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_ktp_number` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_name` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_phone` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_section` to the `loan_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatory_year` to the `loan_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "loan_settings" ADD COLUMN     "current_year_folder_id" TEXT,
ADD COLUMN     "current_year_folder_year" INTEGER,
ADD COLUMN     "signatory_address_domicile" TEXT NOT NULL,
ADD COLUMN     "signatory_address_ktp" TEXT NOT NULL,
ADD COLUMN     "signatory_faculty" TEXT NOT NULL,
ADD COLUMN     "signatory_image_drive_id" TEXT,
ADD COLUMN     "signatory_ktp_number" TEXT NOT NULL,
ADD COLUMN     "signatory_name" TEXT NOT NULL,
ADD COLUMN     "signatory_phone" TEXT NOT NULL,
ADD COLUMN     "signatory_section" TEXT NOT NULL,
ADD COLUMN     "signatory_year" TEXT NOT NULL;
