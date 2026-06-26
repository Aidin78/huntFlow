-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REMINDER_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'INTERVIEW_UPCOMING';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "notifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN "notifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserNotificationPreferences" ADD COLUMN "notifyStatusEvent" BOOLEAN NOT NULL DEFAULT true;
