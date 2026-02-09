import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { CreateUserDto, LoginDto } from '../users/dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        const { passwordHash, ...user } = req.user;
        return user;
    }
}
