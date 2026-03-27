/*
  Warnings:

  - Added the required column `condition` to the `tool_versions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ToolCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');

-- AlterTable
ALTER TABLE "tool_versions" DROP COLUMN "condition",
ADD COLUMN     "condition" "ToolCondition" NOT NULL;
