/*
  Warnings:

  - Made the column `displayName` on table `user_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `user_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `user_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "displayName" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
