ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS "paymentAmountCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripePaymentStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "stripeTransferId" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutReleasedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "stripeRefundId" TEXT,
  ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_stripePaymentIntentId_key"
ON "bookings"("stripePaymentIntentId");

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_stripeTransferId_key"
ON "bookings"("stripeTransferId");

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_stripeRefundId_key"
ON "bookings"("stripeRefundId");
