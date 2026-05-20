-- CreateEnum
CREATE TYPE "UserFileKind" AS ENUM ('RESUME');

-- CreateTable
CREATE TABLE "JobSeekerProfile" (
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "currentResumeFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSeekerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "UserFileKind" NOT NULL DEFAULT 'RESUME',
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationThread" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationMessage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN "coverLetter" TEXT,
ADD COLUMN "resumeFileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "JobSeekerProfile_currentResumeFileId_key" ON "JobSeekerProfile"("currentResumeFileId");

-- CreateIndex
CREATE INDEX "UserFile_userId_idx" ON "UserFile"("userId");

-- CreateIndex
CREATE INDEX "UserFile_kind_idx" ON "UserFile"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationThread_jobApplicationId_key" ON "ApplicationThread"("jobApplicationId");

-- CreateIndex
CREATE INDEX "ApplicationMessage_threadId_createdAt_idx" ON "ApplicationMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "ApplicationMessage_senderUserId_idx" ON "ApplicationMessage"("senderUserId");

-- CreateIndex
CREATE INDEX "JobApplication_resumeFileId_idx" ON "JobApplication"("resumeFileId");

-- AddForeignKey
ALTER TABLE "JobSeekerProfile" ADD CONSTRAINT "JobSeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSeekerProfile" ADD CONSTRAINT "JobSeekerProfile_currentResumeFileId_fkey" FOREIGN KEY ("currentResumeFileId") REFERENCES "UserFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "UserFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationThread" ADD CONSTRAINT "ApplicationThread_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationMessage" ADD CONSTRAINT "ApplicationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ApplicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationMessage" ADD CONSTRAINT "ApplicationMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
