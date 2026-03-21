-- Remove legacy default payment method snapshot columns.
-- Stripe customer data is now the source of truth for card defaults.

ALTER TABLE "payment_customer_profiles"
  DROP COLUMN "hasDefaultPaymentMethod",
  DROP COLUMN "defaultPaymentMethodBrand",
  DROP COLUMN "defaultPaymentMethodLast4",
  DROP COLUMN "defaultPaymentMethodExpMonth",
  DROP COLUMN "defaultPaymentMethodExpYear";

ALTER TABLE "payment_provider_accounts"
  DROP COLUMN "hasDefaultPaymentMethod",
  DROP COLUMN "defaultPaymentMethodBrand",
  DROP COLUMN "defaultPaymentMethodLast4",
  DROP COLUMN "defaultPaymentMethodExpMonth",
  DROP COLUMN "defaultPaymentMethodExpYear";
