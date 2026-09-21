ALTER TYPE "ActivityAction" ADD VALUE 'handover_ketua';
ALTER TYPE "ActivityAction" ADD VALUE 'complete_handover';

ALTER TABLE "admins" ADD COLUMN "handover_at" TIMESTAMP(3);

CREATE TABLE "tombstones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "term_year" INTEGER NOT NULL,
    "ketua_name" TEXT NOT NULL,
    "ketua_section" TEXT NOT NULL,
    "ketua_angkatan" TEXT NOT NULL,
    "staff_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photo_drive_file_id" TEXT,
    "ketua_admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tombstones_pkey" PRIMARY KEY ("id")
);
