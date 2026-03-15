import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PayoutOnboardingStatus } from '@prisma/client';
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
  headers?: Record<string, string>;
};

const MOBILE_PAYMENT_DETAILS_DEEP_LINK = 'shareatool://payment-details';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: true,
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

    return this.mapSummary(user as any);
  }

  async listMyPaymentMethods(
    userId: string,
    options?: { limit?: number; startingAfter?: string },
  ) {
    const limit = this.clampPaymentMethodLimit(options?.limit);
    const startingAfter = options?.startingAfter?.trim() || undefined;

    const paymentProfile = await this.prisma.paymentProfile.findUnique({
      where: { userId },
      include: {
        customerProfile: true,
      },
    });

    const customerId = paymentProfile?.customerProfile?.providerCustomerId;
    if (!customerId) {
      return {
        items: [],
        hasMore: false,
        nextCursor: null,
      };
    }

    try {
      const customer = await this.stripeRequest('GET', `/v1/customers/${customerId}`, {
        expand: ['invoice_settings.default_payment_method'],
      });

      const stripePaymentMethods = await this.stripeRequest(
        'GET',
        '/v1/payment_methods',
        {
          customer: customerId,
          type: 'card',
          limit,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        },
      );

      const defaultPaymentMethod =
        customer?.invoice_settings?.default_payment_method;
      const defaultPaymentMethodId =
        typeof defaultPaymentMethod === 'string'
          ? defaultPaymentMethod
          : defaultPaymentMethod?.id || null;

      const methods = Array.isArray(stripePaymentMethods?.data)
        ? stripePaymentMethods.data
        : [];

      const items = methods
        .filter((method: any) => Boolean(method?.id && method?.card))
        .map((method: any) => ({
          id: method.id as string,
          brand: method.card.brand || null,
          last4: method.card.last4 || null,
          expMonth: method.card.exp_month || null,
          expYear: method.card.exp_year || null,
          isDefault:
            Boolean(defaultPaymentMethodId) && method.id === defaultPaymentMethodId,
        }));

      return {
        items,
        hasMore: Boolean(stripePaymentMethods?.has_more),
        nextCursor:
          stripePaymentMethods?.has_more && items.length > 0
            ? items[items.length - 1].id
            : null,
      };
    } catch (error) {
      if (!this.isMissingStripeCustomerError(error)) {
        throw error;
      }

      if (paymentProfile) {
        await this.prisma.paymentCustomerProfile.update({
          where: { paymentProfileId: paymentProfile.id },
          data: {
            providerCustomerId: null,
            hasDefaultPaymentMethod: false,
            defaultPaymentMethodBrand: null,
            defaultPaymentMethodLast4: null,
            defaultPaymentMethodExpMonth: null,
            defaultPaymentMethodExpYear: null,
          },
        });
      }

      return {
        items: [],
        hasMore: false,
        nextCursor: null,
      };
    }
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

    const customerId = await this.ensureStripeCustomer({
      userId,
      email: user.email,
      paymentProfileId: paymentProfile.id,
      existingCustomerId: customerProfile.providerCustomerId || null,
    });

    const setupIntent = await this.stripeRequest('POST', '/v1/setup_intents', {
      customer: customerId,
      usage: 'off_session',
      payment_method_types: ['card'],
      'metadata[userId]': userId,
    });

    const ephemeralKey = await this.stripeRequest(
      'POST',
      '/v1/ephemeral_keys',
      { customer: customerId },
      {
        headers: {
          'Stripe-Version': '2024-06-20',
        },
      },
    );

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId,
      ephemeralKeySecret: ephemeralKey.secret,
    };
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    const normalizedPaymentMethodId = paymentMethodId?.trim();
    if (!normalizedPaymentMethodId) {
      throw new BadRequestException('Missing payment method id.');
    }

    const paymentProfile = await this.prisma.paymentProfile.findUnique({
      where: { userId },
      include: {
        customerProfile: true,
      },
    });

    const customerProfile = paymentProfile?.customerProfile;
    if (!paymentProfile || !customerProfile?.providerCustomerId) {
      throw new BadRequestException(
        'Add a card first before selecting a default payment method.',
      );
    }

    const customerId = customerProfile.providerCustomerId;

    try {
      const paymentMethod = await this.stripeRequest(
        'GET',
        `/v1/payment_methods/${normalizedPaymentMethodId}`,
      );

      if (paymentMethod?.type !== 'card') {
        throw new BadRequestException(
          'Only card payment methods can be selected as default.',
        );
      }

      if (paymentMethod?.customer !== customerId) {
        throw new BadRequestException(
          'This payment method does not belong to your account.',
        );
      }

      await this.stripeRequest('POST', `/v1/customers/${customerId}`, {
        'invoice_settings[default_payment_method]': normalizedPaymentMethodId,
      });

      await this.prisma.paymentCustomerProfile.update({
        where: { paymentProfileId: paymentProfile.id },
        data: {
          hasDefaultPaymentMethod: true,
          defaultPaymentMethodBrand: paymentMethod?.card?.brand || null,
          defaultPaymentMethodLast4: paymentMethod?.card?.last4 || null,
          defaultPaymentMethodExpMonth: paymentMethod?.card?.exp_month || null,
          defaultPaymentMethodExpYear: paymentMethod?.card?.exp_year || null,
        },
      });

      return {
        success: true,
        defaultPaymentMethod: {
          id: normalizedPaymentMethodId,
          brand: paymentMethod?.card?.brand || null,
          last4: paymentMethod?.card?.last4 || null,
          expMonth: paymentMethod?.card?.exp_month || null,
          expYear: paymentMethod?.card?.exp_year || null,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (this.isMissingStripeCustomerError(error)) {
        await this.prisma.paymentCustomerProfile.update({
          where: { paymentProfileId: paymentProfile.id },
          data: {
            providerCustomerId: null,
            hasDefaultPaymentMethod: false,
            defaultPaymentMethodBrand: null,
            defaultPaymentMethodLast4: null,
            defaultPaymentMethodExpMonth: null,
            defaultPaymentMethodExpYear: null,
          },
        });

        throw new BadRequestException(
          'Customer account was reset. Add a card again.',
        );
      }

      if (this.isMissingStripePaymentMethodError(error)) {
        throw new BadRequestException('Selected payment method no longer exists.');
      }

      throw error;
    }
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
    const payoutAccount = await this.getOrCreatePayoutAccount(
      paymentProfile.id,
    );

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
        this.buildStripeExpressAccountParams(
          user as any,
          userId,
          stripeCountry,
        ),
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

    if (!connectAccountId) {
      throw new ServiceUnavailableException(
        'Unable to determine Stripe account id.',
      );
    }

    const link = await this.createStripeAccountLink(connectAccountId);

    return {
      url: link.url,
      expiresAt: link.expires_at,
      accountId: connectAccountId,
    };
  }

  async createPayoutDashboardLink(userId: string) {
    const paymentProfile = await this.getOrCreatePaymentProfile(userId);
    const payoutAccount = await this.getOrCreatePayoutAccount(
      paymentProfile.id,
    );

    if (!payoutAccount.providerAccountId) {
      throw new BadRequestException(
        'Start payout onboarding before opening payout management.',
      );
    }

    try {
      const link = await this.createStripeDashboardLoginLink(
        payoutAccount.providerAccountId,
      );

      return {
        url: link.url,
        created: link.created,
      };
    } catch (error) {
      if (!this.isMissingStripeConnectedAccountError(error)) {
        throw error;
      }

      await this.prisma.$transaction([
        this.prisma.paymentPayoutAccount.update({
          where: { paymentProfileId: paymentProfile.id },
          data: {
            providerAccountId: null,
            onboardingStatus: PayoutOnboardingStatus.NOT_STARTED,
            chargesEnabled: false,
            payoutsEnabled: false,
          },
        }),
      ]);

      throw new BadRequestException(
        'Your payout account was reset. Please start payout onboarding again.',
      );
    }
  }
  async handleConnectRefresh(accountId: string) {
    if (!accountId) {
      throw new BadRequestException(
        'Missing required query parameter: account',
      );
    }

    const payoutAccount = await this.prisma.paymentPayoutAccount.findUnique({
      where: { providerAccountId: accountId },
    });

    if (!payoutAccount) {
      throw new NotFoundException('Payout account not found');
    }

    const link = await this.createStripeAccountLink(accountId);
    return link.url;
  }

  getConnectReturnRedirectUrl(accountId?: string) {
    return this.buildMobilePaymentDetailsUrl({
      stripe: 'connect-return',
      account: accountId,
    });
  }

  getBillingReturnRedirectUrl() {
    return this.buildMobilePaymentDetailsUrl({
      stripe: 'billing-return',
    });
  }

  async createBookingPaymentIntent(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        renter: {
          select: { email: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.renterId !== userId) {
      throw new BadRequestException('Only the renter can pay this booking.');
    }

    if (
      booking.status === 'REJECTED' ||
      booking.status === 'CANCELLED' ||
      booking.status === 'COMPLETED'
    ) {
      throw new BadRequestException('This booking is not payable.');
    }

    if (booking.stripeTransferId) {
      throw new BadRequestException('Payout has already been released.');
    }

    const paymentProfile = await this.getOrCreatePaymentProfile(userId);
    const customerProfile = await this.getOrCreateCustomerProfile(
      paymentProfile.id,
    );
    const customerId = await this.ensureStripeCustomer({
      userId,
      email: booking.renter.email,
      paymentProfileId: paymentProfile.id,
      existingCustomerId: customerProfile.providerCustomerId || null,
    });

    const amount = this.toStripeAmountCents(booking.totalPrice);
    let paymentIntent: any = null;

    if (booking.stripePaymentIntentId) {
      try {
        paymentIntent = await this.stripeRequest(
          'GET',
          `/v1/payment_intents/${booking.stripePaymentIntentId}`,
        );
      } catch (error) {
        if (!this.isMissingStripePaymentIntentError(error)) {
          throw error;
        }

        paymentIntent = null;
      }
    }

    if (
      !paymentIntent ||
      paymentIntent.status === 'canceled' ||
      paymentIntent.status === 'requires_payment_method'
    ) {
      paymentIntent = await this.stripeRequest(
        'POST',
        '/v1/payment_intents',
        {
          amount,
          currency: (booking.currency || 'eur').toLowerCase(),
          customer: customerId,
          transfer_group: `booking_${booking.id}`,
          'automatic_payment_methods[enabled]': true,
          'metadata[bookingId]': booking.id,
          'metadata[renterId]': booking.renterId,
          'metadata[ownerId]': booking.ownerId,
        },
        {
          headers: {
            'Idempotency-Key': `booking-payment-intent-${booking.id}`,
          },
        },
      );

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentStatus: paymentIntent.status,
          paymentAmountCents: amount,
          currency: (booking.currency || 'eur').toLowerCase(),
        },
      });
    }

    const ephemeralKey = await this.stripeRequest(
      'POST',
      '/v1/ephemeral_keys',
      { customer: customerId },
      {
        headers: {
          'Stripe-Version': '2024-06-20',
        },
      },
    );

    return {
      bookingId: booking.id,
      customerId,
      paymentIntentId: paymentIntent.id,
      paymentIntentStatus: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
    };
  }

  async syncBookingPayment(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.renterId !== userId) {
      throw new BadRequestException('Only the renter can sync payment status.');
    }

    if (!booking.stripePaymentIntentId) {
      throw new BadRequestException(
        'No payment intent exists for this booking.',
      );
    }

    const paymentIntent = await this.stripeRequest(
      'GET',
      `/v1/payment_intents/${booking.stripePaymentIntentId}`,
    );

    const isPaid = paymentIntent.status === 'succeeded';
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentStatus: paymentIntent.status,
        paidAt: isPaid ? new Date() : booking.paidAt,
        paymentAmountCents:
          typeof paymentIntent.amount_received === 'number' &&
          paymentIntent.amount_received > 0
            ? paymentIntent.amount_received
            : booking.paymentAmountCents,
      },
    });

    return {
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
      paymentIntentStatus: paymentIntent.status,
      isPaid,
    };
  }

  async releaseBookingPayoutForCompletedBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        owner: {
          include: {
            paymentProfile: {
              include: {
                payoutAccount: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Booking must be completed before releasing payout.',
      );
    }

    if (booking.stripeTransferId) {
      return {
        bookingId: booking.id,
        transferId: booking.stripeTransferId,
        alreadyReleased: true,
      };
    }

    if (!booking.stripePaymentIntentId) {
      throw new BadRequestException('No payment found for this booking.');
    }

    const payoutAccountId =
      booking.owner?.paymentProfile?.payoutAccount?.providerAccountId;
    if (!payoutAccountId) {
      throw new BadRequestException(
        'Owner payout account is not ready. Complete payout setup first.',
      );
    }

    const paymentIntent = await this.stripeRequest(
      'GET',
      `/v1/payment_intents/${booking.stripePaymentIntentId}`,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(
        `Payment is not completed yet (status: ${paymentIntent.status}).`,
      );
    }

    const sourceTransaction =
      typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : null;
    if (!sourceTransaction) {
      throw new ServiceUnavailableException(
        'Unable to release payout: source charge not found.',
      );
    }

    const amount =
      booking.paymentAmountCents ||
      this.toStripeAmountCents(booking.totalPrice);

    const transfer = await this.stripeRequest('POST', '/v1/transfers', {
      amount,
      currency: (booking.currency || 'eur').toLowerCase(),
      destination: payoutAccountId,
      source_transaction: sourceTransaction,
      transfer_group: `booking_${booking.id}`,
      'metadata[bookingId]': booking.id,
      'metadata[ownerId]': booking.ownerId,
      'metadata[renterId]': booking.renterId,
    });

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripeTransferId: transfer.id,
        payoutReleasedAt: new Date(),
      },
    });

    return {
      bookingId: booking.id,
      transferId: transfer.id,
      released: true,
    };
  }

  async refundBookingPaymentIfNeeded(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || !booking.stripePaymentIntentId) {
      return { skipped: true, reason: 'no_payment' };
    }

    if (booking.stripeTransferId) {
      return { skipped: true, reason: 'transfer_already_released' };
    }

    if (booking.stripeRefundId) {
      return { skipped: true, reason: 'already_refunded' };
    }

    const paymentIntent = await this.stripeRequest(
      'GET',
      `/v1/payment_intents/${booking.stripePaymentIntentId}`,
    );

    if (paymentIntent.status !== 'succeeded') {
      return { skipped: true, reason: 'payment_not_succeeded' };
    }

    const refund = await this.stripeRequest('POST', '/v1/refunds', {
      payment_intent: booking.stripePaymentIntentId,
    });

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripeRefundId: refund.id,
        refundedAt: new Date(),
        stripePaymentStatus: 'refunded',
      },
    });

    return {
      bookingId: booking.id,
      refundId: refund.id,
      refunded: true,
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

    if (customerProfile.providerCustomerId) {
      try {
        const customer = await this.stripeRequest(
          'GET',
          `/v1/customers/${customerProfile.providerCustomerId}`,
          {
            expand: ['invoice_settings.default_payment_method'],
          },
        );

        let defaultPaymentMethod =
          customer?.invoice_settings?.default_payment_method;
        let defaultPaymentMethodId: string | null =
          typeof defaultPaymentMethod === 'string' && defaultPaymentMethod
            ? defaultPaymentMethod
            : null;

        if (typeof defaultPaymentMethod === 'string' && defaultPaymentMethod) {
          defaultPaymentMethod = await this.stripeRequest(
            'GET',
            `/v1/payment_methods/${defaultPaymentMethod}`,
          );
        }

        let card = defaultPaymentMethod?.card;
        if (!card) {
          const paymentMethods = await this.stripeRequest(
            'GET',
            '/v1/payment_methods',
            {
              customer: customerProfile.providerCustomerId,
              type: 'card',
              limit: 1,
            },
          );

          const firstCardMethod =
            Array.isArray(paymentMethods?.data) && paymentMethods.data.length > 0
              ? paymentMethods.data[0]
              : null;

          if (firstCardMethod?.card) {
            card = firstCardMethod.card;
            defaultPaymentMethodId = firstCardMethod.id || null;

            // Ensure Stripe customer has a default card so future reads are consistent.
            if (
              defaultPaymentMethodId &&
              !customer?.invoice_settings?.default_payment_method
            ) {
              await this.stripeRequest(
                'POST',
                `/v1/customers/${customerProfile.providerCustomerId}`,
                {
                  'invoice_settings[default_payment_method]':
                    defaultPaymentMethodId,
                },
              );
            }
          }
        }

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
      } catch (error) {
        if (!this.isMissingStripeCustomerError(error)) {
          throw error;
        }

        customerUpdate.providerCustomerId = null;
        customerUpdate.hasDefaultPaymentMethod = false;
        customerUpdate.defaultPaymentMethodBrand = null;
        customerUpdate.defaultPaymentMethodLast4 = null;
        customerUpdate.defaultPaymentMethodExpMonth = null;
        customerUpdate.defaultPaymentMethodExpYear = null;
      }
    }

    if (payoutAccount.providerAccountId) {
      try {
        const account = await this.stripeRequest(
          'GET',
          `/v1/accounts/${payoutAccount.providerAccountId}`,
        );

        const requirementsDue = Array.isArray(
          account?.requirements?.currently_due,
        )
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
      } catch (error) {
        if (!this.isMissingStripeConnectedAccountError(error)) {
          throw error;
        }

        await this.prisma.$transaction([
          this.prisma.paymentPayoutAccount.update({
            where: { paymentProfileId: paymentProfile.id },
            data: {
              providerAccountId: null,
              onboardingStatus: PayoutOnboardingStatus.NOT_STARTED,
              chargesEnabled: false,
              payoutsEnabled: false,
            },
          }),
        ]);
      }
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

    return this.getSummary(userId);
  }

  private isMissingStripeConnectedAccountError(error: unknown): boolean {
    const candidate = [
      (error as any)?.message,
      (error as any)?.response?.message,
      (error as any)?.response?.error?.message,
      (error as any)?.response?.error?.code,
    ]
      .filter((value) => typeof value === 'string')
      .map((value) => String(value).toLowerCase());

    return candidate.some(
      (value) =>
        value.includes('no such account') || value.includes('resource_missing'),
    );
  }
  private mapSummary(user: any) {
    const paymentProfile = user.paymentProfile;
    const customerProfile = paymentProfile?.customerProfile;
    const payoutAccount = paymentProfile?.payoutAccount;

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
      hasDefaultPaymentMethod: Boolean(
        customerProfile?.hasDefaultPaymentMethod,
      ),
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

  private async ensureStripeCustomer(params: {
    userId: string;
    email: string;
    paymentProfileId: string;
    existingCustomerId?: string | null;
  }): Promise<string> {
    const { userId, email, paymentProfileId, existingCustomerId } = params;

    if (existingCustomerId) {
      try {
        await this.stripeRequest('GET', `/v1/customers/${existingCustomerId}`);
        return existingCustomerId;
      } catch (error) {
        if (!this.isMissingStripeCustomerError(error)) {
          throw error;
        }
      }
    }

    const customer = await this.stripeRequest('POST', '/v1/customers', {
      email,
      'metadata[userId]': userId,
    });

    const customerId = customer.id as string;
    await this.prisma.paymentCustomerProfile.update({
      where: { paymentProfileId },
      data: {
        providerCustomerId: customerId,
        hasDefaultPaymentMethod: false,
        defaultPaymentMethodBrand: null,
        defaultPaymentMethodLast4: null,
        defaultPaymentMethodExpMonth: null,
        defaultPaymentMethodExpYear: null,
      },
    });

    return customerId;
  }

  private isMissingStripeCustomerError(error: unknown): boolean {
    const candidate = [
      (error as any)?.message,
      (error as any)?.response?.message,
      (error as any)?.response?.error?.message,
      (error as any)?.response?.error?.code,
    ]
      .filter((value) => typeof value === 'string')
      .map((value) => String(value).toLowerCase());

    return candidate.some(
      (value) =>
        value.includes('no such customer') ||
        value.includes('resource_missing'),
    );
  }

  private isMissingStripePaymentIntentError(error: unknown): boolean {
    const candidate = [
      (error as any)?.message,
      (error as any)?.response?.message,
      (error as any)?.response?.error?.message,
      (error as any)?.response?.error?.code,
    ]
      .filter((value) => typeof value === 'string')
      .map((value) => String(value).toLowerCase());

    return candidate.some(
      (value) =>
        value.includes('no such paymentintent') ||
        value.includes('no such payment_intent') ||
        value.includes('resource_missing'),
    );
  }

  private isMissingStripePaymentMethodError(error: unknown): boolean {
    const candidate = [
      (error as any)?.message,
      (error as any)?.response?.message,
      (error as any)?.response?.error?.message,
      (error as any)?.response?.error?.code,
    ]
      .filter((value) => typeof value === 'string')
      .map((value) => String(value).toLowerCase());

    return candidate.some(
      (value) =>
        value.includes('no such paymentmethod') ||
        value.includes('no such payment_method') ||
        value.includes('resource_missing'),
    );
  }

  private toStripeAmountCents(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid booking amount.');
    }

    return Math.round(amount * 100);
  }

  private buildStripeExpressAccountParams(
    user: any,
    userId: string,
    stripeCountry: string,
  ): Record<string, StripeRequestValue> {
    const params: Record<string, StripeRequestValue> = {
      type: 'express',
      country: stripeCountry,
      email: user?.email,
      business_type: 'individual',
      'capabilities[card_payments][requested]': true,
      'capabilities[transfers][requested]': true,
      'metadata[userId]': userId,
    };

    const profile = user?.profile;
    const address = this.resolvePrimaryAddress(user);

    if (profile?.firstName) {
      params['individual[first_name]'] = profile.firstName;
    }
    if (profile?.lastName) {
      params['individual[last_name]'] = profile.lastName;
    }
    if (profile?.phone) {
      params['individual[phone]'] = profile.phone;
    }
    if (user?.email) {
      params['individual[email]'] = user.email;
    }

    if (profile?.birthDate) {
      const birthDate = new Date(profile.birthDate);
      if (!Number.isNaN(birthDate.getTime())) {
        params['individual[dob][day]'] = birthDate.getUTCDate();
        params['individual[dob][month]'] = birthDate.getUTCMonth() + 1;
        params['individual[dob][year]'] = birthDate.getUTCFullYear();
      }
    }

    const countryCode =
      this.normalizeCountryCode(address?.country) || stripeCountry;
    if (countryCode) {
      params['individual[address][country]'] = countryCode;
    }
    if (address?.street) {
      params['individual[address][line1]'] = address.street;
    }
    if (address?.addressLine2) {
      params['individual[address][line2]'] = address.addressLine2;
    }
    if (address?.city) {
      params['individual[address][city]'] = address.city;
    }
    if (address?.state) {
      params['individual[address][state]'] = address.state;
    }
    if (address?.postalCode) {
      params['individual[address][postal_code]'] = address.postalCode;
    }

    return params;
  }

  private resolvePrimaryAddress(user: any): any | null {
    if (!Array.isArray(user?.addresses) || user.addresses.length === 0) {
      return null;
    }

    const byDefault = user.addresses.find((item: any) => item?.isDefault);
    if (byDefault) {
      return byDefault;
    }

    return user.addresses[0] || null;
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

  private getStripeSecretKey(): string {
    return this.getRequiredEnv('STRIPE_SECRET_KEY');
  }

  private buildStripeConnectRefreshUrl(accountId: string): string {
    const baseUrl = this.buildPublicBackendUrl('/payments/stripe/refresh');
    return this.appendQueryParams(baseUrl, { account: accountId });
  }

  private buildStripeConnectReturnUrl(accountId: string): string {
    const baseUrl = this.buildPublicBackendUrl('/payments/stripe/return');
    return this.appendQueryParams(baseUrl, { account: accountId });
  }

  private buildPublicBackendUrl(path: string): string {
    const baseUrl = this.getRequiredEnv('PUBLIC_BACKEND_URL').replace(
      /\/$/,
      '',
    );
    return `${baseUrl}${path}`;
  }

  private buildMobilePaymentDetailsUrl(
    params: Record<string, string | undefined>,
  ): string {
    return this.appendQueryParams(MOBILE_PAYMENT_DETAILS_DEEP_LINK, params);
  }

  private appendQueryParams(
    baseUrl: string,
    params: Record<string, string | undefined>,
  ): string {
    const entries = Object.entries(params).filter(([, value]) =>
      Boolean(value),
    );
    if (entries.length === 0) {
      return baseUrl;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    const query = entries
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`,
      )
      .join('&');

    return `${baseUrl}${separator}${query}`;
  }

  private async createStripeAccountLink(accountId: string) {
    return this.stripeRequest('POST', '/v1/account_links', {
      account: accountId,
      refresh_url: this.buildStripeConnectRefreshUrl(accountId),
      return_url: this.buildStripeConnectReturnUrl(accountId),
      type: 'account_onboarding',
    });
  }

  private async createStripeDashboardLoginLink(accountId: string) {
    return this.stripeRequest('POST', `/v1/accounts/${accountId}/login_links`);
  }

  private async stripeRequest(
    method: 'GET' | 'POST',
    path: string,
    params: Record<string, StripeRequestValue> = {},
    options: StripeRequestOptions = {},
  ) {
    const secretKey = this.getStripeSecretKey();
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
      ...(options.headers || {}),
    };

    const init: RequestInit = { method, headers };

    if (method === 'GET') {
      const qs = searchParams.toString();
      if (qs) {
        url = `${url}?${qs}`;
      }
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
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

  private clampPaymentMethodLimit(value: number | undefined): number {
    if (!Number.isFinite(value)) {
      return 3;
    }

    return Math.min(Math.max(Math.trunc(value as number), 1), 20);
  }
}
