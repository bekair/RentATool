import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    toolId: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsNumber()
    totalPrice: number;
}

export class UpdateBookingStatusDto {
    @IsString()
    @IsNotEmpty()
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}
