/*
  Warnings:

  - You are about to drop the column `whatsapp` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappNumber` on the `event_config` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `staff` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" DROP COLUMN "whatsapp";

-- AlterTable
ALTER TABLE "event_config" DROP COLUMN "whatsappNumber",
ADD COLUMN     "contactNumber" TEXT DEFAULT '+62 812-3456-7890';

-- AlterTable
ALTER TABLE "staff" DROP COLUMN "whatsapp";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "whatsapp";
