-- AlterTable
ALTER TABLE "public"."answers" ADD COLUMN     "marks_awarded" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."exams" ADD COLUMN     "full_screen_mode_enabled" BOOLEAN NOT NULL DEFAULT true;
