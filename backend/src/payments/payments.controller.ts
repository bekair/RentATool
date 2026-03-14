import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/summary')
  getMySummary(@Req() req: Request) {
    return this.paymentsService.getSummary((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/setup-intent')
  createSetupIntent(@Req() req: Request) {
    return this.paymentsService.createSetupIntent((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/connect-account-link')
  createConnectAccountLink(@Req() req: Request) {
    return this.paymentsService.createConnectAccountLink((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/payout-dashboard-link')
  createPayoutDashboardLink(@Req() req: Request) {
    return this.paymentsService.createPayoutDashboardLink((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/refresh-status')
  refreshStatus(@Req() req: Request) {
    return this.paymentsService.refreshStatus((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bookings/:bookingId/payment-intent')
  createBookingPaymentIntent(
    @Req() req: Request,
    @Param('bookingId') bookingId: string,
  ) {
    return this.paymentsService.createBookingPaymentIntent(
      (req.user as any).id,
      bookingId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('bookings/:bookingId/sync-payment')
  syncBookingPayment(
    @Req() req: Request,
    @Param('bookingId') bookingId: string,
  ) {
    return this.paymentsService.syncBookingPayment(
      (req.user as any).id,
      bookingId,
    );
  }

  @Get('stripe/refresh')
  @Redirect()
  async stripeRefresh(@Query('account') accountId?: string) {
    return {
      url: await this.paymentsService.handleConnectRefresh(accountId || ''),
    };
  }

  @Get('stripe/return')
  @Redirect()
  stripeReturn(@Query('account') accountId?: string) {
    return {
      url: this.paymentsService.getConnectReturnRedirectUrl(accountId),
    };
  }

  @Get('stripe/billing-return')
  @Redirect()
  stripeBillingReturn() {
    return {
      url: this.paymentsService.getBillingReturnRedirectUrl(),
    };
  }
}
