import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { BookingStatus, PreferredPickupWindow } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toolId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ minLength: 20, maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @Length(20, 500)
  usePurposeNote: string;

  @ApiProperty({ enum: PreferredPickupWindow })
  @IsEnum(PreferredPickupWindow)
  preferredPickupWindow: PreferredPickupWindow;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  @IsIn([
    BookingStatus.APPROVED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
  ])
  status: BookingStatus;
}
