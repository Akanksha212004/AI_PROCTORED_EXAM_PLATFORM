-- CreateEnum
CREATE TYPE "public"."ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."exams" ADD COLUMN     "passing_marks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "public"."ExamStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "total_marks" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "exams_status_idx" ON "public"."exams"("status");
