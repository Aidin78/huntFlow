-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('INTERN', 'ENTRY', 'MID', 'SENIOR', 'LEAD');

-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "city" TEXT,
    "workArrangement" "WorkArrangement" NOT NULL DEFAULT 'ONSITE',
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'MID',
    "salaryText" TEXT,
    "sourceUrl" TEXT,
    "companyId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobListing_companyId_idx" ON "JobListing"("companyId");

-- CreateIndex
CREATE INDEX "JobListing_city_idx" ON "JobListing"("city");

-- CreateIndex
CREATE INDEX "JobListing_workArrangement_idx" ON "JobListing"("workArrangement");

-- CreateIndex
CREATE INDEX "JobListing_experienceLevel_idx" ON "JobListing"("experienceLevel");

-- CreateIndex
CREATE INDEX "JobListing_title_idx" ON "JobListing"("title");

-- CreateIndex
CREATE INDEX "JobListing_isActive_publishedAt_idx" ON "JobListing"("isActive", "publishedAt");

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
