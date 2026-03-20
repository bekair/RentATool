import {
  Body,
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
import { SetDefaultPaymentMethodDto } from './dto/set-default-payment-method.dto';
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
  @Get('me/payment-methods')
  listMyPaymentMethods(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('startingAfter') startingAfter?: string,
  ) {
    const parsedLimit = this.parseListLimit(limit);

    return this.paymentsService.listMyPaymentMethods((req.user as any).id, {
      limit: parsedLimit,
      startingAfter,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/setup-intent')
  createSetupIntent(@Req() req: Request) {
    return this.paymentsService.createSetupIntent((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/default-payment-method')
  setMyDefaultPaymentMethod(
    @Req() req: Request,
    @Body() body: SetDefaultPaymentMethodDto,
  ) {
    return this.paymentsService.setDefaultPaymentMethod(
      (req.user as any).id,
      body.paymentMethodId,
    );
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

  private parseListLimit(limit?: string): number {
    if (!limit) {
      return 3;
    }

    const parsed = Number.parseInt(limit, 10);
    if (Number.isNaN(parsed)) {
      return 3;
    }

    return Math.min(Math.max(parsed, 1), 20);
  }
}
