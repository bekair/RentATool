import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginDto } from '../users/dto/user.dto';

export interface JwtPayload {
    sub: string;
    email: string;
}

export interface AuthResponse {
    accessToken: string;
    user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
        const user = await this.usersService.create(createUserDto);
        return this.generateAuthResponse(user);
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await this.usersService.validatePassword(
            user,
            loginDto.password,
        );
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateAuthResponse(user);
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            // In a real app, generate a token and send an email here.
            // For now, we simulate success to avoid enumeration attacks (safe) 
            // or just confirm it works (dev).
            console.log(`[Mock Email Service] Sending reset link to ${email}`);
        }
        return { message: 'If an account exists, a reset link has been sent.' };
    }

    async validateUserById(userId: string): Promise<User | null> {
        return this.usersService.findById(userId);
    }

    private generateAuthResponse(user: User): AuthResponse {
        const payload: JwtPayload = { sub: user.id, email: user.email };
        const { passwordHash, ...userWithoutPassword } = user;

        return {
            accessToken: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }
}
