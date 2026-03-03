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
                verificationTier: VerificationTier.UNVERIFIED,
                profile: {
                    create: {
                        firstName: createUserDto.firstName,
                        lastName: createUserDto.lastName,
                        displayName: `${createUserDto.firstName} ${createUserDto.lastName.charAt(0)}.`,
                    }
                }
            },
            include: {
                profile: true,
                addresses: true,
            }
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
                addresses: true,
            }
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                addresses: true,
            }
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            include: {
                profile: true,
                addresses: true,
            }
        });
    }

    async updateProfile(userId: string, data: any) {
        return this.prisma.userProfile.update({
            where: { userId },
            data,
        });
    }

    async createAddress(userId: string, data: any) {
        if (data.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return this.prisma.address.create({
            data: { ...data, userId },
        });
    }

    async updateAddress(userId: string, addressId: string, data: any) {
        // Must belong to user
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) throw new NotFoundException('Address not found');

        if (data.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id: addressId },
            data,
        });
    }

    async deleteAddress(userId: string, addressId: string) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) throw new NotFoundException('Address not found');

        await this.prisma.address.delete({
            where: { id: addressId },
        });

        if (address.isDefault) {
            const firstRemaining = await this.prisma.address.findFirst({
                where: { userId },
            });
            if (firstRemaining) {
                await this.prisma.address.update({
                    where: { id: firstRemaining.id },
                    data: { isDefault: true },
                });
            }
        }
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
