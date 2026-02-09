import { Injectable, ConflictException, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, VerificationTier } from '@prisma/client';
import { CreateUserDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(createUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                passwordHash,
                displayName: createUserDto.displayName,
                city: createUserDto.city,
                verificationTier: VerificationTier.UNVERIFIED,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async validatePassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.passwordHash);
    }

    async updateVerificationTier(
        userId: string,
        tier: VerificationTier,
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                verificationTier: tier,
                verifiedAt: tier !== VerificationTier.UNVERIFIED ? new Date() : undefined,
            },
        });
    }

    async getStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                _count: {
                    select: {
                        tools: true,
                        receivedBookings: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            listedCount: user._count.tools,
            rentalCount: user._count.receivedBookings,
            rating: 4.9, // Placeholder until reviews are implemented
        };
    }
}
