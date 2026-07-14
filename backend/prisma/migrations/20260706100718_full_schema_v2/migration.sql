/*
  Warnings:

  - The values [TRUE_FALSE,SUBJECTIVE,PARAGRAPH,NUMERICAL] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `submitted_answer` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_questions` on the `exam_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `negative_marks` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `proctoring_settings` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `randomize_questions` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `selection_rules` on the `exams` table. All the data in the column will be lost.
  - You are about to alter the column `subject` on the `exams` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `correct_answer` on the `question_bank` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `question_bank` table. All the data in the column will be lost.
  - You are about to alter the column `subject` on the `question_bank` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `marks` on the `results` table. All the data in the column will be lost.
  - Added the required column `title` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMarks` to the `results` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RandomizationMode" AS ENUM ('FIXED', 'SHUFFLED_ORDER', 'PER_STUDENT_UNIQUE');

-- CreateEnum
CREATE TYPE "public"."ProctorEventType" AS ENUM ('WEBCAM_SNAPSHOT', 'GAZE_LOG', 'TAB_SWITCH');

-- CreateEnum
CREATE TYPE "public"."GradingStatus" AS ENUM ('PENDING', 'AI_GRADED', 'IN_REVIEW', 'GRADED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuestionType_new" AS ENUM ('MCQ', 'MULTI_SELECT', 'SHORT_ANSWER', 'LONG_ANSWER', 'IMAGE_UPLOAD');
ALTER TABLE "public"."question_bank" ALTER COLUMN "question_type" TYPE "public"."QuestionType_new" USING ("question_type"::text::"public"."QuestionType_new");
-- ALTER TABLE "public"."exam_selection_rules" ALTER COLUMN "question_type" TYPE "public"."QuestionType_new" USING ("question_type"::text::"public"."QuestionType_new");
ALTER TYPE "public"."QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "public"."QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_exam_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exams" DROP CONSTRAINT "exams_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."question_bank" DROP CONSTRAINT "question_bank_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_exam_session_id_fkey";

-- AlterTable
ALTER TABLE "public"."answers" DROP COLUMN "submitted_answer",
ADD COLUMN     "submitted_file_url" TEXT,
ADD COLUMN     "submitted_text" TEXT;

-- AlterTable
ALTER TABLE "public"."exam_sessions" DROP COLUMN "assigned_questions",
ADD COLUMN     "tab_switch_warnings" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."exams" DROP COLUMN "negative_marks",
DROP COLUMN "proctoring_settings",
DROP COLUMN "randomize_questions",
DROP COLUMN "selection_rules",
ADD COLUMN     "gaze_sensitivity" "public"."GazeSensitivity" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "max_tab_switch_warnings" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "negative_marking_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "randomization_mode" "public"."RandomizationMode" NOT NULL DEFAULT 'PER_STUDENT_UNIQUE',
ADD COLUMN     "title" VARCHAR(200) NOT NULL,
ADD COLUMN     "webcam_monitoring_enabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "subject" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."question_bank" DROP COLUMN "correct_answer",
DROP COLUMN "options",
ADD COLUMN     "model_answer_text" TEXT,
ADD COLUMN     "negative_marks" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "subject" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."results" DROP COLUMN "marks",
ADD COLUMN     "totalMarks" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "public"."options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "option_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_selection_rules" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "subject" VARCHAR(100),
    "question_type" "public"."QuestionType",
    "difficulty_level" "public"."DifficultyLevel",
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_selection_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "marks_override" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_questions" (
    "id" TEXT NOT NULL,
    "exam_session_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "marks_allocated" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answer_options" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proctor_events" (
    "id" TEXT NOT NULL,
    "exam_session_id" TEXT NOT NULL,
    "event_type" "public"."ProctorEventType" NOT NULL,
    "snapshot_url" TEXT,
    "gaze_direction" TEXT,
    "gaze_confidence" DOUBLE PRECISION,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proctor_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjective_gradings" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "status" "public"."GradingStatus" NOT NULL DEFAULT 'PENDING',
    "ai_score" DOUBLE PRECISION,
    "ai_confidence" DOUBLE PRECISION,
    "examiner_id" TEXT,
    "examiner_score" DOUBLE PRECISION,
    "feedback" TEXT,
    "graded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjective_gradings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_access_tokens" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "exam_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "options_question_id_idx" ON "public"."options"("question_id");

-- CreateIndex
CREATE INDEX "exam_selection_rules_exam_id_idx" ON "public"."exam_selection_rules"("exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_exam_id_question_id_key" ON "public"."exam_questions"("exam_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_questions_exam_session_id_question_id_key" ON "public"."session_questions"("exam_session_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_questions_exam_session_id_sequence_order_key" ON "public"."session_questions"("exam_session_id", "sequence_order");

-- CreateIndex
CREATE UNIQUE INDEX "answer_options_answer_id_option_id_key" ON "public"."answer_options"("answer_id", "option_id");

-- CreateIndex
CREATE INDEX "proctor_events_exam_session_id_event_type_idx" ON "public"."proctor_events"("exam_session_id", "event_type");

-- CreateIndex
CREATE INDEX "proctor_events_occurred_at_idx" ON "public"."proctor_events"("occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "subjective_gradings_answer_id_key" ON "public"."subjective_gradings"("answer_id");

-- CreateIndex
CREATE INDEX "subjective_gradings_status_idx" ON "public"."subjective_gradings"("status");

-- CreateIndex
CREATE INDEX "subjective_gradings_examiner_id_idx" ON "public"."subjective_gradings"("examiner_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_access_tokens_token_key" ON "public"."exam_access_tokens"("token");

-- CreateIndex
CREATE INDEX "exam_access_tokens_exam_id_student_id_idx" ON "public"."exam_access_tokens"("exam_id", "student_id");

-- CreateIndex
CREATE INDEX "answers_student_id_idx" ON "public"."answers"("student_id");

-- CreateIndex
CREATE INDEX "exam_sessions_exam_id_status_idx" ON "public"."exam_sessions"("exam_id", "status");

-- CreateIndex
CREATE INDEX "exams_subject_idx" ON "public"."exams"("subject");

-- CreateIndex
CREATE INDEX "exams_start_time_end_time_idx" ON "public"."exams"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "question_bank_difficulty_level_idx" ON "public"."question_bank"("difficulty_level");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- AddForeignKey
ALTER TABLE "public"."question_bank" ADD CONSTRAINT "question_bank_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."options" ADD CONSTRAINT "options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exams" ADD CONSTRAINT "exams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_selection_rules" ADD CONSTRAINT "exam_selection_rules_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_questions" ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_questions" ADD CONSTRAINT "exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_questions" ADD CONSTRAINT "session_questions_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_questions" ADD CONSTRAINT "session_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_options" ADD CONSTRAINT "answer_options_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_options" ADD CONSTRAINT "answer_options_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proctor_events" ADD CONSTRAINT "proctor_events_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjective_gradings" ADD CONSTRAINT "subjective_gradings_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjective_gradings" ADD CONSTRAINT "subjective_gradings_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_access_tokens" ADD CONSTRAINT "exam_access_tokens_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_access_tokens" ADD CONSTRAINT "exam_access_tokens_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
