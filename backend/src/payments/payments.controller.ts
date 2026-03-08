import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('me/summary')
  getMySummary(@Req() req: Request) {
    return this.paymentsService.getSummary((req.user as any).id);
  }

  @Post('me/setup-intent')
  createSetupIntent(@Req() req: Request) {
    return this.paymentsService.createSetupIntent((req.user as any).id);
  }

  @Post('me/connect-account-link')
  createConnectAccountLink(@Req() req: Request) {
    return this.paymentsService.createConnectAccountLink((req.user as any).id);
  }

  @Post('me/refresh-status')
  refreshStatus(@Req() req: Request) {
    return this.paymentsService.refreshStatus((req.user as any).id);
  }
}
