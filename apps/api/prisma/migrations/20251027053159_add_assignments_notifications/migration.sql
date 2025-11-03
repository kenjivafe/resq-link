-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('push', 'sms');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'delivered', 'failed', 'retried');

-- AlterTable
ALTER TABLE "Incident" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RateLimitRecord" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "windowStart" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastAttemptAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" UUID NOT NULL,
    "incidentId" UUID NOT NULL,
    "responderId" UUID,
    "assignedBy" UUID,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "incidentId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_incidentId_idx" ON "Assignment"("incidentId");

-- CreateIndex
CREATE INDEX "Assignment_responderId_idx" ON "Assignment"("responderId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_incidentId_idx" ON "NotificationLog"("incidentId");

-- CreateIndex
CREATE INDEX "NotificationLog_status_sentAt_idx" ON "NotificationLog"("status", "sentAt");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;
