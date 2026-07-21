-- AlterEnum
ALTER TYPE "public"."ProctorEventType" ADD VALUE 'MULTI_FACE_DETECTED';

-- AlterTable
ALTER TABLE "public"."proctor_events" ADD COLUMN     "face_count" INTEGER;
