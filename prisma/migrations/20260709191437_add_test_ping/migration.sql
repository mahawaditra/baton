-- CreateTable
CREATE TABLE "TestPing" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestPing_pkey" PRIMARY KEY ("id")
);
