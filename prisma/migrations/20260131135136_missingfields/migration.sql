/*
  Warnings:

  - A unique constraint covering the columns `[customerAccessToken]` on the table `booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `venue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `venue` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('STAFF', 'CUSTOMER_PORTAL');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "actualPax" INTEGER,
ADD COLUMN     "customerAccessToken" TEXT,
ADD COLUMN     "dietaryRequests" TEXT,
ADD COLUMN     "guaranteedPax" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublicBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "layoutType" TEXT,
ADD COLUMN     "serviceChargeRateSnapshot" DECIMAL(65,30) NOT NULL DEFAULT 10,
ADD COLUMN     "source" "BookingSource" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "taxStrategySnapshot" "TaxStrategy" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "vatRateSnapshot" DECIMAL(65,30) NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "type" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "receivedById" TEXT;

-- AlterTable
ALTER TABLE "venue" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "booking_customerAccessToken_key" ON "booking"("customerAccessToken");

-- CreateIndex
CREATE UNIQUE INDEX "venue_slug_key" ON "venue"("slug");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
