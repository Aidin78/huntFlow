-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PLATFORM_ADMIN';

-- CreateEnum
CREATE TYPE "SupportInquiryStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterTable
ALTER TABLE "SupportInquiry" ADD COLUMN "status" "SupportInquiryStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN "adminNotes" TEXT,
ADD COLUMN "resolvedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SupportInquiry_status_idx" ON "SupportInquiry"("status");
