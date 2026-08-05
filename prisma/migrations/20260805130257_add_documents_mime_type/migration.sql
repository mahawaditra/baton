/*
  Warnings:

  - Added the required column `mime_type` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "mime_type" TEXT NOT NULL;
