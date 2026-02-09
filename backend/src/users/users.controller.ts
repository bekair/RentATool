import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        const users = await this.usersService.findAll();
        // Remove password hashes from response for security
        return users.map(user => {
            const { passwordHash, ...result } = user;
            return result;
        });
    }

    @Get('me/stats')
    @UseGuards(JwtAuthGuard)
    async getMyStats(@Request() req) {
        return this.usersService.getStats(req.user.id);
    }
}
