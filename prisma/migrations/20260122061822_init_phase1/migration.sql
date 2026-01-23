/*
  Warnings:

  - You are about to drop the `Hotel` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'HOTEL_ADMIN', 'SALES', 'OPERATIONS', 'FINANCE');

-- DropForeignKey
ALTER TABLE "Hotel" DROP CONSTRAINT "Hotel_createdById_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "hotelId" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OPERATIONS',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "Hotel";

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "subdomain" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_subdomain_key" ON "hotel"("subdomain");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
