-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "birthDate" DATE,
    "region" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: move displayName data to user_profiles before dropping
INSERT INTO "user_profiles" ("id", "userId", "displayName", "updatedAt")
SELECT gen_random_uuid(), "id", "displayName", NOW()
FROM "users"
ON CONFLICT ("userId") DO NOTHING;

-- AlterTable: drop old columns from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "displayName";
ALTER TABLE "users" DROP COLUMN IF EXISTS "city";
