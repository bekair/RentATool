CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');
CREATE TYPE "PayoutOnboardingStatus" AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'INCOMPLETE', 'COMPLETE');
CREATE TYPE "ProviderRequirementStatus" AS ENUM ('CURRENTLY_DUE');

CREATE TABLE "payment_profiles" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_customer_profiles" (
  "id" TEXT NOT NULL,
  "paymentProfileId" TEXT NOT NULL,
  "providerCustomerId" TEXT,
  "hasDefaultPaymentMethod" BOOLEAN NOT NULL DEFAULT false,
  "defaultPaymentMethodBrand" TEXT,
  "defaultPaymentMethodLast4" TEXT,
  "defaultPaymentMethodExpMonth" INTEGER,
  "defaultPaymentMethodExpYear" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_customer_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_payout_accounts" (
  "id" TEXT NOT NULL,
  "paymentProfileId" TEXT NOT NULL,
  "providerAccountId" TEXT,
  "onboardingStatus" "PayoutOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_payout_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_provider_account_requirements" (
  "id" TEXT NOT NULL,
  "payoutAccountId" TEXT NOT NULL,
  "requirementKey" TEXT NOT NULL,
  "requirementStatus" "ProviderRequirementStatus" NOT NULL DEFAULT 'CURRENTLY_DUE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_provider_account_requirements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_profiles_userId_key" ON "payment_profiles"("userId");
CREATE UNIQUE INDEX "payment_customer_profiles_paymentProfileId_key" ON "payment_customer_profiles"("paymentProfileId");
CREATE UNIQUE INDEX "payment_customer_profiles_providerCustomerId_key" ON "payment_customer_profiles"("providerCustomerId");
CREATE UNIQUE INDEX "payment_payout_accounts_paymentProfileId_key" ON "payment_payout_accounts"("paymentProfileId");
CREATE UNIQUE INDEX "payment_payout_accounts_providerAccountId_key" ON "payment_payout_accounts"("providerAccountId");
CREATE UNIQUE INDEX "payment_provider_account_requirements_unique_key" ON "payment_provider_account_requirements"("payoutAccountId", "requirementKey", "requirementStatus");

ALTER TABLE "payment_profiles" ADD CONSTRAINT "payment_profiles_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_customer_profiles" ADD CONSTRAINT "payment_customer_profiles_paymentProfileId_fkey"
FOREIGN KEY ("paymentProfileId") REFERENCES "payment_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_payout_accounts" ADD CONSTRAINT "payment_payout_accounts_paymentProfileId_fkey"
FOREIGN KEY ("paymentProfileId") REFERENCES "payment_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_provider_account_requirements" ADD CONSTRAINT "payment_provider_account_requirements_payoutAccountId_fkey"
FOREIGN KEY ("payoutAccountId") REFERENCES "payment_payout_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
