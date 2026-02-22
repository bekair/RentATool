import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { Booking, BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

    async create(renterId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
        const tool = await this.prisma.tool.findUnique({
            where: { id: createBookingDto.toolId },
        });

        if (!tool) {
            throw new NotFoundException('Tool not found');
        }

        if (tool.ownerId === renterId) {
            throw new BadRequestException('You cannot rent your own tool');
        }

        if (!tool.activeVersionId) {
            throw new BadRequestException('Tool is not properly configured for renting');
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
                        displayName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return bookings.map(b => ({
            ...b,
            tool: b.toolVersion, // Map for frontend compatibility
        }));
    }

    async findByOwner(ownerId: string): Promise<any[]> {
        const bookings = await this.prisma.booking.findMany({
            where: { ownerId },
            include: {
                toolVersion: true,
                renter: {
                    select: {
                        displayName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return bookings.map(b => ({
            ...b,
            tool: b.toolVersion, // Map for frontend compatibility
        }));
    }

    async updateStatus(id: string, userId: string, updateDto: UpdateBookingStatusDto): Promise<Booking> {
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
                throw new BadRequestException('Only the tool owner can approve or reject bookings');
            }
        }

        if (updateDto.status === 'CANCELLED') {
            if (booking.renterId !== userId && booking.ownerId !== userId) {
                throw new BadRequestException('Not authorized to cancel this booking');
            }
        }

        return this.prisma.booking.update({
            where: { id },
            data: { status: BookingStatus[updateDto.status] },
        });
    }
}
