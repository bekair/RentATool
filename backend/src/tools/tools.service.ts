import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolDto, UpdateToolDto } from './dto/tool.dto';
import { Tool } from '@prisma/client';

@Injectable()
export class ToolsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, createToolDto: CreateToolDto): Promise<Tool> {
    return this.prisma.tool.create({
      data: {
        ...createToolDto,
        ownerId,
      },
    });
  }

  async findAll(excludeOwnerId?: string): Promise<Tool[]> {
    return this.prisma.tool.findMany({
      where: {
        isAvailable: true,
        ...(excludeOwnerId ? { ownerId: { not: excludeOwnerId } } : {}),
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            verificationTier: true,
          },
        },
        category: true,
      },
    });
  }

  async findOne(id: string): Promise<Tool> {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            verificationTier: true,
          },
        },
        category: true,
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} not found`);
    }

    return tool;
  }

  async findByOwner(ownerId: string): Promise<Tool[]> {
    return this.prisma.tool.findMany({
      where: { ownerId },
    });
  }

  async update(
    id: string,
    ownerId: string,
    updateToolDto: UpdateToolDto,
  ): Promise<Tool> {
    // Ensure the owner is the one updating
    const tool = await this.findOne(id);
    if (tool.ownerId !== ownerId) {
      throw new NotFoundException(
        'You do not have permission to update this tool',
      );
    }

    return this.prisma.tool.update({
      where: { id },
      data: updateToolDto,
    });
  }

  async remove(id: string, ownerId: string): Promise<Tool> {
    const tool = await this.findOne(id);
    if (tool.ownerId !== ownerId) {
      throw new NotFoundException(
        'You do not have permission to delete this tool',
      );
    }

    return this.prisma.tool.delete({
      where: { id },
    });
  }

  async getAvailability(id: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] },
          },
          select: {
            startDate: true,
            endDate: true,
          },
        },
        blocks: {
          select: {
            date: true,
          },
        },
      },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} not found`);
    }

    const bookedDates: string[] = [];
    tool.bookings.forEach((booking) => {
      const curr = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      while (curr <= end) {
        // Format to YYYY-MM-DD
        bookedDates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const manualBlockedDates = tool.blocks.map(
      (b) => b.date.toISOString().split('T')[0],
    );

    // Deduplicate arrays
    return {
      bookedDates: [...new Set(bookedDates)],
      manualBlockedDates: [...new Set(manualBlockedDates)],
    };
  }

  async updateAvailability(
    id: string,
    ownerId: string,
    manualBlockedDates: string[],
  ) {
    const tool = await this.findOne(id);
    if (tool.ownerId !== ownerId) {
      throw new NotFoundException(
        'You do not have permission to update this tool',
      );
    }

    // Use a transaction to delete all old blocks and create new ones
    await this.prisma.$transaction([
      this.prisma.toolDateBlock.deleteMany({
        where: { toolId: id },
      }),
      ...manualBlockedDates.map((dateString) =>
        this.prisma.toolDateBlock.create({
          data: {
            toolId: id,
            // Parse YYYY-MM-DD into a UTC date at midnight
            date: new Date(`${dateString}T00:00:00Z`),
          },
        }),
      ),
    ]);

    return this.getAvailability(id);
  }
}
