/*
  Warnings:

  - Made the column `responderId` on table `Assignment` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AssignmentPriority" AS ENUM ('normal', 'urgent');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'acknowledged', 'declined', 'completed');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "message" TEXT,
ADD COLUMN     "priority" "AssignmentPriority" NOT NULL DEFAULT 'normal',
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "responderId" SET NOT NULL;
