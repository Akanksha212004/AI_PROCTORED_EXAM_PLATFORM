-- AlterEnum
ALTER TYPE "public"."ProctorEventType" ADD VALUE 'MOBILE_PHONE_DETECTED';

-- AlterTable
ALTER TABLE "public"."proctor_events" ADD COLUMN     "mobile_device_bounding_box" JSONB,
ADD COLUMN     "mobile_device_confidence" DOUBLE PRECISION;
