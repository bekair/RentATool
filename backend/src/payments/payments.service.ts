import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  PayoutOnboardingStatus,
  ProviderRequirementStatus,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

type StripeRequestValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | null
  | undefined;

type StripeRequestOptions = {
  idempotencyKey?: string;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) { }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: true,
        paymentProfile: {
          include: {
            customerProfile: true,
            payoutAccount: { include: { requirements: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapSummary(user as any);
  }

  async createSetupIntent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const paymentProfile = await this.getOrCreatePaymentProfile(userId);
    const customerProfile = await this.getOrCreateCustomerProfile(
      paymentProfile.id,
    );

    let customerId = customerProfile.providerCustomerId;
    if (!customerId) {
      const customer = await this.stripeRequest('POST', '/v1/customers', {
        email: user.email,
        'metadata[userId]': userId,
      });

      customerId = customer.id;
      await this.prisma.paymentCustomerProfile.update({
        where: { paymentProfileId: paymentProfile.id },
        data: { providerCustomerId: customerId },
      });
    }

    const setupIntent = await this.stripeRequest('POST', '/v1/setup_intents', {
      customer: customerId,
      usage: 'off_session',
      payment_method_types: ['card'],
      'metadata[userId]': userId,
    });

    let billingPortalUrl: string | null = null;
    const billingReturnUrl = this.config.get<string>(
      'STRIPE_BILLING_RETURN_URL',
    );

    if (billingReturnUrl) {
      const portal = await this.stripeRequest(
        'POST',
        '/v1/billing_portal/sessions',
        {
          customer: customerId,
          return_url: billingReturnUrl,
        },
      );
      billingPortalUrl = portal.url;
    }

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      billingPortalUrl,
      customerId,
    };
  }

  async createConnectAccountLink(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const paymentProfile = await this.getOrCreatePaymentProfile(userId);
    const payoutAccount = await this.getOrCreatePayoutAccount(paymentProfile.id);

    let connectAccountId = payoutAccount.providerAccountId;
    if (!connectAccountId) {
      const stripeCountry = this.resolveConnectCountryCode(user as any);
      if (!stripeCountry) {
        throw new BadRequestException(
          'Please add your country to your profile or addresses before starting payout onboarding.',
        );
      }

      const account = await this.stripeRequest(
        'POST',
        '/v1/accounts',
        {
          type: 'express',
          country: stripeCountry,
          email: user.email,
          business_type: 'individual',
          'capabilities[card_payments][requested]': true,
          'capabilities[transfers][requested]': true,
          'metadata[userId]': userId,
        },
        {
          idempotencyKey: 'connect-account-create:' + userId,
        },
      );

      connectAccountId = account.id;
      await this.prisma.paymentPayoutAccount.update({
        where: { paymentProfileId: paymentProfile.id },
        data: {
          providerAccountId: connectAccountId,
          onboardingStatus: PayoutOnboardingStatus.PENDING_REVIEW,
        },
      });
    }

    const refreshUrl = this.getRequiredEnv('STRIPE_CONNECT_REFRESH_URL');
    const returnUrl = this.getRequiredEnv('STRIPE_CONNECT_RETURN_URL');

    const link = await this.stripeRequest('POST', '/v1/account_links', {
      account: connectAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      url: link.url,
      expiresAt: link.expires_at,
      accountId: connectAccountId,
    };
  }

  async refreshStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        paymentProfile: {
          include: {
            customerProfile: true,
            payoutAccount: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const paymentProfile = await this.getOrCreatePaymentProfile(userId);
    const customerProfile =
      user.paymentProfile?.customerProfile ||
      (await this.getOrCreateCustomerProfile(paymentProfile.id));
    const payoutAccount =
      user.paymentProfile?.payoutAccount ||
      (await this.getOrCreatePayoutAccount(paymentProfile.id));

    const customerUpdate: any = {};
    const payoutUpdate: any = {};
    let requirementsDue: string[] = [];

    if (customerProfile.providerCustomerId) {
      const customer = await this.stripeRequest(
        'GET',
        `/v1/customers/${customerProfile.providerCustomerId}`,
        {
          expand: ['invoice_settings.default_payment_method'],
        },
      );

      let defaultPaymentMethod =
        customer?.invoice_settings?.default_payment_method;

      if (typeof defaultPaymentMethod === 'string' && defaultPaymentMethod) {
        defaultPaymentMethod = await this.stripeRequest(
          'GET',
          `/v1/payment_methods/${defaultPaymentMethod}`,
        );
      }

      const card = defaultPaymentMethod?.card;
      if (card) {
        customerUpdate.hasDefaultPaymentMethod = true;
        customerUpdate.defaultPaymentMethodBrand = card.brand || null;
        customerUpdate.defaultPaymentMethodLast4 = card.last4 || null;
        customerUpdate.defaultPaymentMethodExpMonth = card.exp_month || null;
        customerUpdate.defaultPaymentMethodExpYear = card.exp_year || null;
      } else {
        customerUpdate.hasDefaultPaymentMethod = false;
        customerUpdate.defaultPaymentMethodBrand = null;
        customerUpdate.defaultPaymentMethodLast4 = null;
        customerUpdate.defaultPaymentMethodExpMonth = null;
        customerUpdate.defaultPaymentMethodExpYear = null;
      }
    }

    if (payoutAccount.providerAccountId) {
      const account = await this.stripeRequest(
        'GET',
        `/v1/accounts/${payoutAccount.providerAccountId}`,
      );

      requirementsDue = Array.isArray(account?.requirements?.currently_due)
        ? account.requirements.currently_due
        : [];

      const chargesEnabled = Boolean(account?.charges_enabled);
      const payoutsEnabled = Boolean(account?.payouts_enabled);

      let onboardingStatus: PayoutOnboardingStatus =
        PayoutOnboardingStatus.PENDING_REVIEW;
      if (chargesEnabled && payoutsEnabled) {
        onboardingStatus = PayoutOnboardingStatus.COMPLETE;
      } else if (requirementsDue.length > 0) {
        onboardingStatus = PayoutOnboardingStatus.INCOMPLETE;
      }

      payoutUpdate.chargesEnabled = chargesEnabled;
      payoutUpdate.payoutsEnabled = payoutsEnabled;
      payoutUpdate.onboardingStatus = onboardingStatus;
    }

    if (Object.keys(customerUpdate).length > 0) {
      await this.prisma.paymentCustomerProfile.update({
        where: { paymentProfileId: paymentProfile.id },
        data: customerUpdate,
      });
    }

    if (Object.keys(payoutUpdate).length > 0) {
      await this.prisma.paymentPayoutAccount.update({
        where: { paymentProfileId: paymentProfile.id },
        data: payoutUpdate,
      });
    }

    if (payoutAccount.providerAccountId) {
      await this.prisma.paymentProviderAccountRequirement.deleteMany({
        where: {
          payoutAccountId: payoutAccount.id,
          requirementStatus: ProviderRequirementStatus.CURRENTLY_DUE,
        },
      });

      if (requirementsDue.length > 0) {
        await this.prisma.paymentProviderAccountRequirement.createMany({
          data: requirementsDue.map((requirementKey) => ({
            payoutAccountId: payoutAccount.id,
            requirementKey,
            requirementStatus: ProviderRequirementStatus.CURRENTLY_DUE,
          })),
        });
      }
    }

    return this.getSummary(userId);
  }

  private mapSummary(user: any) {
    const paymentProfile = user.paymentProfile;
    const customerProfile = paymentProfile?.customerProfile;
    const payoutAccount = paymentProfile?.payoutAccount;
    const requirementsDue =
      payoutAccount?.requirements
        ?.filter((req: any) => req.requirementStatus === 'CURRENTLY_DUE')
        .map((req: any) => req.requirementKey) || [];

    const readinessBlockers: string[] = [];

    if (!user.profile?.firstName || !user.profile?.lastName) {
      readinessBlockers.push('Complete your profile name.');
    }
    if (!user.profile?.phone) {
      readinessBlockers.push('Add a phone number in your profile.');
    }
    if (!Array.isArray(user.addresses) || user.addresses.length === 0) {
      readinessBlockers.push('Add at least one address.');
    }
    if (!customerProfile?.hasDefaultPaymentMethod) {
      readinessBlockers.push('Add a default payment method for renting.');
    }
    if (!this.resolveConnectCountryCode(user)) {
      readinessBlockers.push(
        'Add your country to your profile or addresses before payout onboarding.',
      );
    }
    if (!payoutAccount?.providerAccountId) {
      readinessBlockers.push('Start payout onboarding to lend tools.');
    }

    return {
      hasDefaultPaymentMethod: Boolean(customerProfile?.hasDefaultPaymentMethod),
      defaultPaymentMethod: customerProfile?.hasDefaultPaymentMethod
        ? {
          brand: customerProfile.defaultPaymentMethodBrand,
          last4: customerProfile.defaultPaymentMethodLast4,
          expMonth: customerProfile.defaultPaymentMethodExpMonth,
          expYear: customerProfile.defaultPaymentMethodExpYear,
        }
        : null,
      hasConnectedPayoutAccount: Boolean(payoutAccount?.providerAccountId),
      payoutOnboardingStatus:
        payoutAccount?.onboardingStatus || PayoutOnboardingStatus.NOT_STARTED,
      chargesEnabled: Boolean(payoutAccount?.chargesEnabled),
      payoutsEnabled: Boolean(payoutAccount?.payoutsEnabled),
      requirementsDue,
      readinessBlockers,
    };
  }

  private async getOrCreatePaymentProfile(userId: string) {
    const existing = await this.prisma.paymentProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.paymentProfile.create({
      data: { userId },
    });
  }

  private async getOrCreateCustomerProfile(paymentProfileId: string) {
    const existing = await this.prisma.paymentCustomerProfile.findUnique({
      where: { paymentProfileId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.paymentCustomerProfile.create({
      data: { paymentProfileId },
    });
  }

  private async getOrCreatePayoutAccount(paymentProfileId: string) {
    const existing = await this.prisma.paymentPayoutAccount.findUnique({
      where: { paymentProfileId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.paymentPayoutAccount.create({
      data: { paymentProfileId },
    });
  }

  private resolveConnectCountryCode(user: any): string | null {
    const candidates: Array<string | undefined | null> = [
      user?.profile?.region,
      user?.addresses?.find((a: any) => a?.isDefault)?.country,
      ...((user?.addresses || []).map((a: any) => a?.country) as Array<
        string | undefined
      >),
    ];

    for (const value of candidates) {
      const code = this.normalizeCountryCode(value);
      if (code) {
        return code;
      }
    }

    return null;
  }

  private normalizeCountryCode(raw: string | null | undefined): string | null {
    if (!raw || typeof raw !== 'string') {
      return null;
    }

    const normalized = raw.trim();
    if (!normalized) {
      return null;
    }

    const upper = normalized.toUpperCase();
    if (/^[A-Z]{2}$/.test(upper)) {
      return upper;
    }

    const byName: Record<string, string> = {
      BELGIUM: 'BE',
      NETHERLANDS: 'NL',
      LUXEMBOURG: 'LU',
      FRANCE: 'FR',
      GERMANY: 'DE',
      SPAIN: 'ES',
      ITALY: 'IT',
      PORTUGAL: 'PT',
      AUSTRIA: 'AT',
      IRELAND: 'IE',
      'UNITED KINGDOM': 'GB',
      UK: 'GB',
      'UNITED STATES': 'US',
      USA: 'US',
      CANADA: 'CA',
    };

    return byName[upper] || null;
  }

  private getRequiredEnv(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new ServiceUnavailableException(
        `Missing required environment variable: ${key}.`,
      );
    }

    return value;
  }

  private async stripeRequest(
    method: 'GET' | 'POST',
    path: string,
    params: Record<string, StripeRequestValue> = {},
    options: StripeRequestOptions = {},
  ) {
    const secretKey = this.getRequiredEnv('STRIPE_SECRET_KEY');
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(`${key}[]`, String(item));
        }
        continue;
      }

      searchParams.append(key, String(value));
    }

    let url = `https://api.stripe.com${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${secretKey}`,
    };

    const init: RequestInit = { method, headers };

    if (method === 'GET') {
      const qs = searchParams.toString();
      if (qs) {
        url = `${url}?${qs}`;
      }
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      if (options.idempotencyKey) {
        headers['Idempotency-Key'] = options.idempotencyKey;
      }
      init.body = searchParams.toString();
    }

    const response = await fetch(url, init);
    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'Stripe request failed';
      throw new BadGatewayException(message);
    }

    return data;
  }
}




