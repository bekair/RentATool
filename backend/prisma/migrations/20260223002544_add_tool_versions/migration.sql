/*
  Warnings:

  - You are about to drop the column `categoryId` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerDay` on the `tools` table. All the data in the column will be lost.
  - You are about to drop the column `replacementValue` on the `tools` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activeVersionId]` on the table `tools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `toolVersionId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tools" DROP CONSTRAINT "tools_categoryId_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "toolVersionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tools" DROP COLUMN "categoryId",
DROP COLUMN "condition",
DROP COLUMN "description",
DROP COLUMN "images",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "name",
DROP COLUMN "pricePerDay",
DROP COLUMN "replacementValue",
ADD COLUMN     "activeVersionId" TEXT;

-- CreateTable
CREATE TABLE "tool_versions" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "pricePerDay" DOUBLE PRECISION NOT NULL,
    "replacementValue" DOUBLE PRECISION,
    "condition" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tools_activeVersionId_key" ON "tools"("activeVersionId");

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "tool_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_versions" ADD CONSTRAINT "tool_versions_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_versions" ADD CONSTRAINT "tool_versions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_toolVersionId_fkey" FOREIGN KEY ("toolVersionId") REFERENCES "tool_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
