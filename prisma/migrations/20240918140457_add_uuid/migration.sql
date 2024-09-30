/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[premium_uuid]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "oldUsers" ADD COLUMN     "premium_uuid" TEXT,
ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "premium_uuid" TEXT,
ADD COLUMN     "uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_premium_uuid_key" ON "users"("premium_uuid");
