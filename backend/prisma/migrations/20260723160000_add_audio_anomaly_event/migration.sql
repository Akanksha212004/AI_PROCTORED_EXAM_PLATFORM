-- AlterEnum
ALTER TYPE "public"."ProctorEventType" ADD VALUE 'AUDIO_ANOMALY';

-- AlterTable
ALTER TABLE "public"."proctor_events" ADD COLUMN     "audio_level" DOUBLE PRECISION;
