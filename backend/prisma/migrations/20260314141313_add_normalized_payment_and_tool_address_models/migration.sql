-- CreateEnum
CREATE TYPE "ProviderAccountType" AS ENUM ('CUSTOMER', 'CONNECT');

-- CreateEnum
CREATE TYPE "ProviderAccountStatus" AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'INCOMPLETE', 'COMPLETE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'PROCESSING', 'SUCCEEDED', 'CANCELED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "BookingPayoutStatus" AS ENUM ('PENDING', 'RELEASED', 'FAILED', 'REVERSED');

-- AlterTable
ALTER TABLE "tool_versions" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'eur';

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "providerPaymentIntentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "BookingPaymentStatus" NOT NULL DEFAULT 'REQUIRES_PAYMENT_METHOD',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_payouts" (
    "id" TEXT NOT NULL,
    "bookingPaymentId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "destinationProviderAccountId" TEXT NOT NULL,
    "providerTransferId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "BookingPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_refunds" (
    "id" TEXT NOT NULL,
    "bookingPaymentId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "providerRefundId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_addresses" (
    "id" TEXT NOT NULL,
    "toolVersionId" TEXT NOT NULL,
    "label" TEXT,
    "street" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_provider_accounts" (
    "id" TEXT NOT NULL,
    "paymentProfileId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "accountType" "ProviderAccountType" NOT NULL,
    "providerAccountId" TEXT,
    "country" TEXT NOT NULL,
    "status" "ProviderAccountStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "hasDefaultPaymentMethod" BOOLEAN NOT NULL DEFAULT false,
    "defaultPaymentMethodBrand" TEXT,
    "defaultPaymentMethodLast4" TEXT,
    "defaultPaymentMethodExpMonth" INTEGER,
    "defaultPaymentMethodExpYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_provider_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_bookingId_key" ON "booking_payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_providerPaymentIntentId_key" ON "booking_payments"("providerPaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payouts_providerTransferId_key" ON "booking_payouts"("providerTransferId");

-- CreateIndex
CREATE INDEX "booking_payouts_bookingPaymentId_idx" ON "booking_payouts"("bookingPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_refunds_providerRefundId_key" ON "booking_refunds"("providerRefundId");

-- CreateIndex
CREATE INDEX "booking_refunds_bookingPaymentId_idx" ON "booking_refunds"("bookingPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "tool_addresses_toolVersionId_key" ON "tool_addresses"("toolVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_accounts_providerAccountId_key" ON "payment_provider_accounts"("providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_accounts_paymentProfileId_provider_account_key" ON "payment_provider_accounts"("paymentProfileId", "provider", "accountType");

-- AddForeignKey
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_payouts" ADD CONSTRAINT "booking_payouts_bookingPaymentId_fkey" FOREIGN KEY ("bookingPaymentId") REFERENCES "booking_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_refunds" ADD CONSTRAINT "booking_refunds_bookingPaymentId_fkey" FOREIGN KEY ("bookingPaymentId") REFERENCES "booking_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_addresses" ADD CONSTRAINT "tool_addresses_toolVersionId_fkey" FOREIGN KEY ("toolVersionId") REFERENCES "tool_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_provider_accounts" ADD CONSTRAINT "payment_provider_accounts_paymentProfileId_fkey" FOREIGN KEY ("paymentProfileId") REFERENCES "payment_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
