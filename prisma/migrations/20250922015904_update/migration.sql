/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `staff` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "googleId" TEXT;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "otp_codes" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "cooldownUntil" TIMESTAMP(3),
ADD COLUMN     "lastAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "googleId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE UNIQUE INDEX "admins_googleId_key" ON "admins"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_googleId_key" ON "staff"("googleId");
