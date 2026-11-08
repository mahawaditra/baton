-- CreateEnum
CREATE TYPE "SurveyForm" AS ENUM ('baton', 'logistik');

-- CreateTable
CREATE TABLE "survey_participations" (
    "request_id" UUID NOT NULL,

    CONSTRAINT "survey_participations_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form" "SurveyForm" NOT NULL,
    "year" INTEGER NOT NULL,
    "question_version" INTEGER NOT NULL,
    "ratings" JSONB NOT NULL,
    "comments" JSONB NOT NULL,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "survey_responses_form_year_idx" ON "survey_responses"("form", "year");

-- AddForeignKey
ALTER TABLE "survey_participations" ADD CONSTRAINT "survey_participations_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "borrowing_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
