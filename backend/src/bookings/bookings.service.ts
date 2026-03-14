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
    const tool = await this.prisma.tool.findUnique({
      where: { id: createBookingDto.toolId },
      include: {
        activeVersion: {
          select: {
            currency: true,
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

    if (!tool.activeVersionId) {
      throw new BadRequestException(
        'Tool is not properly configured for renting',
      );
    }

    return this.prisma.booking.create({
      data: {
        toolId: createBookingDto.toolId,
        toolVersionId: tool.activeVersionId,
        renterId,
        ownerId: tool.ownerId,
        startDate: new Date(createBookingDto.startDate),
        endDate: new Date(createBookingDto.endDate),
        totalPrice: createBookingDto.totalPrice,
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

    if (updateDto.status === 'APPROVED') {
      const paymentSync = await this.paymentsService.syncBookingPayment(
        booking.renterId,
        booking.id,
      );
      if (!paymentSync.isPaid) {
        throw new BadRequestException(
          'Payment is not completed yet. The renter must finish checkout first.',
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
}
