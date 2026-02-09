import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                UsersService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-jwt-token'),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    describe('register', () => {
        it('should create a new user and return auth response', async () => {
            const result = await authService.register({
                email: 'test@example.com',
                password: 'password123',
                displayName: 'Test User',
            });

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe('test@example.com');
            expect(result.user.displayName).toBe('Test User');
            expect(result.user).not.toHaveProperty('passwordHash');
        });

        it('should throw ConflictException for duplicate email', async () => {
            await authService.register({
                email: 'duplicate@example.com',
                password: 'password123',
                displayName: 'User 1',
            });

            await expect(
                authService.register({
                    email: 'duplicate@example.com',
                    password: 'password456',
                    displayName: 'User 2',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should return auth response for valid credentials', async () => {
            await authService.register({
                email: 'login@example.com',
                password: 'password123',
                displayName: 'Login User',
            });

            const result = await authService.login({
                email: 'login@example.com',
                password: 'password123',
            });

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe('login@example.com');
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            await expect(
                authService.login({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            await authService.register({
                email: 'wrongpass@example.com',
                password: 'correctpassword',
                displayName: 'Wrong Pass User',
            });

            await expect(
                authService.login({
                    email: 'wrongpass@example.com',
                    password: 'wrongpassword',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
