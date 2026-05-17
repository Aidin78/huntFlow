-- CreateTable
CREATE TABLE "EmployerProfile" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "EmployerProfile_companyId_idx" ON "EmployerProfile"("companyId");

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Allow draft listings (never published)
ALTER TABLE "JobListing" ALTER COLUMN "publishedAt" DROP NOT NULL;
ALTER TABLE "JobListing" ALTER COLUMN "publishedAt" DROP DEFAULT;
ALTER TABLE "JobListing" ALTER COLUMN "isActive" SET DEFAULT false;
