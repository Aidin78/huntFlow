-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN "jobListingId" TEXT;

-- CreateIndex
CREATE INDEX "JobApplication_jobListingId_idx" ON "JobApplication"("jobListingId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_userId_jobListingId_key" ON "JobApplication"("userId", "jobListingId");

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
