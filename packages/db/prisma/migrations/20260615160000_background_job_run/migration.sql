-- CreateTable
CREATE TABLE "BackgroundJobRun" (
    "jobKey" TEXT NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackgroundJobRun_pkey" PRIMARY KEY ("jobKey")
);
