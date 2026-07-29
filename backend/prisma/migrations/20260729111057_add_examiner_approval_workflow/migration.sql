-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "access_request_reason" TEXT,
ADD COLUMN     "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "department" VARCHAR(150),
ADD COLUMN     "designation" VARCHAR(150),
ADD COLUMN     "employee_id" VARCHAR(100),
ADD COLUMN     "institution" VARCHAR(200),
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "years_of_experience" INTEGER;

-- CreateIndex
CREATE INDEX "users_role_approval_status_idx" ON "public"."users"("role", "approval_status");
