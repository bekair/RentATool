import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolDto, UpdateToolDto } from './dto/tool.dto';
import { Tool } from '@prisma/client';

@Injectable()
export class ToolsService {
    constructor(private prisma: PrismaService) { }

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

    async update(id: string, ownerId: string, updateToolDto: UpdateToolDto): Promise<Tool> {
        // Ensure the owner is the one updating
        const tool = await this.findOne(id);
        if (tool.ownerId !== ownerId) {
            throw new NotFoundException('You do not have permission to update this tool');
        }

        return this.prisma.tool.update({
            where: { id },
            data: updateToolDto,
        });
    }

    async remove(id: string, ownerId: string): Promise<Tool> {
        const tool = await this.findOne(id);
        if (tool.ownerId !== ownerId) {
            throw new NotFoundException('You do not have permission to delete this tool');
        }

        return this.prisma.tool.delete({
            where: { id },
        });
    }
}
