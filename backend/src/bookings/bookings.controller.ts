import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
        return this.bookingsService.create(req.user.id, createBookingDto);
    }

    @Get('renter')
    findMyRentals(@Request() req) {
        return this.bookingsService.findByRenter(req.user.id);
    }

    @Get('owner')
    findReceivedRequests(@Request() req) {
        return this.bookingsService.findByOwner(req.user.id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Request() req,
        @Body() updateDto: UpdateBookingStatusDto,
    ) {
        return this.bookingsService.updateStatus(id, req.user.id, updateDto);
    }
}
