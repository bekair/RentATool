-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "tool_date_blocks" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_date_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tool_date_blocks_toolId_date_key" ON "tool_date_blocks"("toolId", "date");

-- AddForeignKey
ALTER TABLE "tool_date_blocks" ADD CONSTRAINT "tool_date_blocks_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
