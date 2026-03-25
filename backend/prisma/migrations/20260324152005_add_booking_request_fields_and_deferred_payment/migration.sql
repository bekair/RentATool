-- CreateEnum
CREATE TYPE "PreferredPickupWindow" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "preferredPickupWindow" "PreferredPickupWindow" NOT NULL DEFAULT 'FLEXIBLE',
ADD COLUMN     "usePurposeNote" TEXT NOT NULL DEFAULT '';
