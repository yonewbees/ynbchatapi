/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Access` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceToken]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Access_token_key" ON "Access"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceToken_key" ON "Device"("deviceToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
