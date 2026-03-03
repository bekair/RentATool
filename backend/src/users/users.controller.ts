import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto } from './dto/user.dto';
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

    @Patch('me/profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        await this.usersService.updateProfile(req.user.id, updateProfileDto);
        return this.usersService.findById(req.user.id); // Return full updated user
    }

    @Post('me/addresses')
    @UseGuards(JwtAuthGuard)
    async addAddress(@Request() req, @Body() createAddressDto: CreateAddressDto) {
        await this.usersService.createAddress(req.user.id, createAddressDto);
        return this.usersService.findById(req.user.id);
    }

    @Patch('me/addresses/:id')
    @UseGuards(JwtAuthGuard)
    async updateAddress(
        @Request() req,
        @Param('id') addressId: string,
        @Body() updateAddressDto: Partial<CreateAddressDto>
    ) {
        await this.usersService.updateAddress(req.user.id, addressId, updateAddressDto);
        return this.usersService.findById(req.user.id);
    }

    @Delete('me/addresses/:id')
    @UseGuards(JwtAuthGuard)
    async deleteAddress(@Request() req, @Param('id') addressId: string) {
        await this.usersService.deleteAddress(req.user.id, addressId);
        return { success: true };
    }
}
