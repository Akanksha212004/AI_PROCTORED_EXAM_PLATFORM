-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'EXAMINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'SUBJECTIVE', 'PARAGRAPH', 'NUMERICAL');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."GazeSensitivity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank" (
    "id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "public"."QuestionType" NOT NULL,
    "options" JSONB,
    "correct_answer" JSONB,
    "model_answer_file_url" TEXT,
    "marks" INTEGER NOT NULL,
    "difficulty_level" "public"."DifficultyLevel" NOT NULL,
    "subject" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exams" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "negative_marks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT true,
    "selection_rules" JSONB NOT NULL,
    "proctoring_settings" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_sessions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "assigned_questions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answers" (
    "id" TEXT NOT NULL,
    "exam_session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "submitted_answer" JSONB NOT NULL,
    "time_of_submission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."results" (
    "id" TEXT NOT NULL,
    "exam_session_id" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "ai_score" DOUBLE PRECISION,
    "final_examiner_score" DOUBLE PRECISION,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "question_bank_subject_idx" ON "public"."question_bank"("subject");

-- CreateIndex
CREATE INDEX "question_bank_question_type_idx" ON "public"."question_bank"("question_type");

-- CreateIndex
CREATE UNIQUE INDEX "exam_sessions_student_id_exam_id_key" ON "public"."exam_sessions"("student_id", "exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_exam_session_id_question_id_key" ON "public"."answers"("exam_session_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "results_exam_session_id_key" ON "public"."results"("exam_session_id");

-- AddForeignKey
ALTER TABLE "public"."question_bank" ADD CONSTRAINT "question_bank_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exams" ADD CONSTRAINT "exams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_sessions" ADD CONSTRAINT "exam_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_sessions" ADD CONSTRAINT "exam_sessions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_exam_session_id_fkey" FOREIGN KEY ("exam_session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
