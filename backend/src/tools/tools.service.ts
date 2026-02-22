import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolDto, UpdateToolDto } from './dto/tool.dto';
import { Tool } from '@prisma/client';

@Injectable()
export class ToolsService {
    constructor(private prisma: PrismaService) { }

    async create(ownerId: string, createToolDto: CreateToolDto): Promise<any> {
        const { name, description, categoryId, pricePerDay, replacementValue, condition, latitude, longitude, images, ...toolData } = createToolDto;

        return this.prisma.$transaction(async (tx) => {
            // Create the parent Tool
            const tool = await tx.tool.create({
                data: {
                    ...toolData,
                    ownerId,
                },
            });

            // Create the first version
            const version = await tx.toolVersion.create({
                data: {
                    toolId: tool.id,
                    name,
                    description,
                    categoryId,
                    pricePerDay,
                    replacementValue,
                    condition,
                    latitude,
                    longitude,
                    images: images || [],
                },
            });

            // Link the parent tool to this active version
            return tx.tool.update({
                where: { id: tool.id },
                data: { activeVersionId: version.id },
                include: { activeVersion: { include: { category: true } } }
            });
        });
    }

    async findAll(excludeOwnerId?: string): Promise<any[]> {
        const tools = await this.prisma.tool.findMany({
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
                activeVersion: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        // Flatten for frontend compatibility
        return tools.map(t => ({
            ...t,
            ...(t.activeVersion || {}),
            id: t.id, // Preserve master tool ID
        }));
    }

    async findOne(id: string): Promise<any> {
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
                activeVersion: {
                    include: {
                        category: true,
                    },
                },
                blocks: true,
            },
        });

        if (!tool) {
            throw new NotFoundException(`Tool with ID ${id} not found`);
        }

        return {
            ...tool,
            ...(tool.activeVersion || {}),
            id: tool.id, // Preserve master tool ID
        };
    }

    async findByOwner(ownerId: string): Promise<any[]> {
        const tools = await this.prisma.tool.findMany({
            where: { ownerId },
            include: {
                activeVersion: {
                    include: {
                        category: true,
                    },
                },
                blocks: true,
            },
        });

        // Flatten for frontend compatibility
        return tools.map(t => ({
            ...t,
            ...(t.activeVersion || {}),
            id: t.id, // Preserve master tool ID
        }));
    }

    async update(
        id: string,
        ownerId: string,
        updateToolDto: UpdateToolDto,
    ): Promise<any> {
        const tool = await this.findOne(id);
        if (tool.ownerId !== ownerId) {
            throw new NotFoundException(
                'You do not have permission to update this tool',
            );
        }

        // Isolate the availability flag (only field that updates parent)
        const { isAvailable, ...versionData } = updateToolDto;

        return this.prisma.$transaction(async (tx) => {
            // 1. If availability changed, update parent tool
            if (isAvailable !== undefined) {
                await tx.tool.update({
                    where: { id },
                    data: { isAvailable },
                });
            }

            // 2. Map existing active version data, overridden by the incoming changes
            if (Object.keys(versionData).length > 0) {
                const newVersion = await tx.toolVersion.create({
                    data: {
                        toolId: id,
                        name: versionData.name ?? tool.name,
                        description: versionData.description ?? tool.description,
                        categoryId: versionData.categoryId ?? tool.categoryId,
                        pricePerDay: versionData.pricePerDay ?? tool.pricePerDay,
                        replacementValue: versionData.replacementValue ?? tool.replacementValue,
                        condition: versionData.condition ?? tool.condition,
                        latitude: versionData.latitude ?? tool.latitude,
                        longitude: versionData.longitude ?? tool.longitude,
                        images: versionData.images ?? tool.images,
                    },
                });

                // 3. Move the pointer to the newly created version
                await tx.tool.update({
                    where: { id },
                    data: { activeVersionId: newVersion.id },
                });
            }

            return this.findOne(id);
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
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const tool = await this.prisma.tool.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        status: { in: ['PENDING', 'APPROVED'] },
                        endDate: { gte: today },
                    },
                    select: {
                        startDate: true,
                        endDate: true,
                    },
                },
                blocks: {
                    where: {
                        date: { gte: today },
                    },
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

        const todayDate = new Date();
        todayDate.setUTCHours(0, 0, 0, 0);
        const todayString = todayDate.toISOString().split('T')[0];

        // 1. Past dates restriction
        const hasPastDates = manualBlockedDates.some(date => date < todayString);
        if (hasPastDates) {
            throw new BadRequestException('Cannot block dates in the past');
        }

        // 2. Active bookings restriction
        const activeBookings = await this.prisma.booking.findMany({
            where: {
                toolId: id,
                status: { in: ['PENDING', 'APPROVED'] },
                endDate: { gte: todayDate },
            },
        });

        const bookedDates = new Set<string>();
        activeBookings.forEach((booking) => {
            const curr = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            while (curr <= end) {
                bookedDates.add(curr.toISOString().split('T')[0]);
                curr.setDate(curr.getDate() + 1);
            }
        });

        const conflicts = manualBlockedDates.filter((date) => bookedDates.has(date));
        if (conflicts.length > 0) {
            throw new BadRequestException(`Cannot block dates that have pending or approved requests: ${conflicts.join(', ')}`);
        }

        // 3. Apply changes (only affecting future dates)
        await this.prisma.$transaction([
            this.prisma.toolDateBlock.deleteMany({
                where: {
                    toolId: id,
                    date: { gte: todayDate }
                },
            }),
            ...manualBlockedDates.map((dateString) =>
                this.prisma.toolDateBlock.create({
                    data: {
                        toolId: id,
                        date: new Date(`${dateString}T00:00:00Z`),
                    },
                }),
            ),
        ]);

        return this.getAvailability(id);
    }
}
