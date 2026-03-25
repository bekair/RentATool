import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { Booking, BookingStatus } from '@prisma/client';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  async create(
    renterId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const { startDay, endDay, rangeStart, rangeEnd } =
      this.parseRequestedDateRange(
        createBookingDto.startDate,
        createBookingDto.endDate,
      );

    const tool = await this.prisma.tool.findUnique({
      where: { id: createBookingDto.toolId },
      include: {
        activeVersion: {
          select: {
            currency: true,
            pricePerDay: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: [BookingStatus.PENDING, BookingStatus.APPROVED],
            },
            startDate: {
              lte: rangeEnd,
            },
            endDate: {
              gte: rangeStart,
            },
          },
          select: {
            id: true,
          },
        },
        blocks: {
          where: {
            date: {
              gte: rangeStart,
              lte: rangeEnd,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    if (tool.ownerId === renterId) {
      throw new BadRequestException('You cannot rent your own tool');
    }

    if (!tool.isAvailable) {
      throw new BadRequestException('This tool is currently unavailable');
    }

    if (!tool.activeVersionId) {
      throw new BadRequestException(
        'Tool is not properly configured for renting',
      );
    }

    if (typeof tool.activeVersion?.pricePerDay !== 'number') {
      throw new BadRequestException(
        'Tool is missing pricing information for booking.',
      );
    }

    if (tool.bookings.length > 0 || tool.blocks.length > 0) {
      throw new BadRequestException(
        'Selected dates are not available for this tool.',
      );
    }

    const totalDays = this.daysInclusive(startDay, endDay);
    const totalPrice = this.roundMoney(
      totalDays * tool.activeVersion.pricePerDay,
    );

    return this.prisma.booking.create({
      data: {
        toolId: createBookingDto.toolId,
        toolVersionId: tool.activeVersionId,
        renterId,
        ownerId: tool.ownerId,
        startDate: rangeStart,
        endDate: rangeEnd,
        usePurposeNote: createBookingDto.usePurposeNote.trim(),
        preferredPickupWindow: createBookingDto.preferredPickupWindow,
        totalPrice,
        currency: tool.activeVersion?.currency || 'eur',
        status: BookingStatus.PENDING,
      },
    });
  }

  async findByRenter(renterId: string): Promise<any[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { renterId },
      include: {
        toolVersion: true,
        owner: {
          select: {
            profile: { select: { displayName: true } },
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => ({
      ...b,
      tool: (b as any).toolVersion, // Map for frontend compatibility
      owner: b.owner
        ? { ...b.owner, displayName: (b.owner as any).profile?.displayName }
        : null,
    }));
  }

  async findByOwner(ownerId: string): Promise<any[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { ownerId },
      include: {
        toolVersion: true,
        renter: {
          select: {
            profile: { select: { displayName: true } },
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => ({
      ...b,
      tool: (b as any).toolVersion, // Map for frontend compatibility
      renter: b.renter
        ? { ...b.renter, displayName: (b.renter as any).profile?.displayName }
        : null,
    }));
  }

  async updateStatus(
    id: string,
    userId: string,
    updateDto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only owner can approve/reject
    // Both can cancel
    if (updateDto.status === 'APPROVED' || updateDto.status === 'REJECTED') {
      if (booking.ownerId !== userId) {
        throw new BadRequestException(
          'Only the tool owner can approve or reject bookings',
        );
      }
    }

    if (updateDto.status === 'CANCELLED') {
      if (booking.renterId !== userId && booking.ownerId !== userId) {
        throw new BadRequestException('Not authorized to cancel this booking');
      }
    }

    if (updateDto.status === 'COMPLETED' && booking.ownerId !== userId) {
      throw new BadRequestException(
        'Only the tool owner can mark bookings as completed',
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus[updateDto.status] },
    });

    if (updateDto.status === 'COMPLETED') {
      try {
        await this.paymentsService.releaseBookingPayoutForCompletedBooking(id);
      } catch (error) {
        await this.prisma.booking.update({
          where: { id },
          data: { status: booking.status },
        });
        throw error;
      }
      return updated;
    }

    if (updateDto.status === 'REJECTED' || updateDto.status === 'CANCELLED') {
      await this.paymentsService.refundBookingPaymentIfNeeded(id);
    }

    return updated;
  }

  private parseRequestedDateRange(
    startDateInput: string,
    endDateInput: string,
  ) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid booking date range.');
    }

    const startDay = this.startOfUtcDay(startDate);
    const endDay = this.startOfUtcDay(endDate);

    if (startDay > endDay) {
      throw new BadRequestException(
        'Start date cannot be after end date for a booking request.',
      );
    }

    const today = this.startOfUtcDay(new Date());
    if (startDay < today) {
      throw new BadRequestException(
        'Booking start date cannot be in the past.',
      );
    }

    return {
      startDay,
      endDay,
      rangeStart: startDay,
      rangeEnd: this.endOfUtcDay(endDay),
    };
  }

  private startOfUtcDay(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private endOfUtcDay(date: Date) {
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return endOfDay;
  }

  private daysInclusive(startDay: Date, endDay: Date) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (
      Math.floor((endDay.getTime() - startDay.getTime()) / millisecondsPerDay) +
      1
    );
  }

  private roundMoney(amount: number) {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }
}
