import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { BookingStatus, PreferredPickupWindow } from '@prisma/client';

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

  @IsString()
  @IsNotEmpty()
  @Length(20, 500)
  usePurposeNote: string;

  @IsEnum(PreferredPickupWindow)
  preferredPickupWindow: PreferredPickupWindow;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  @IsIn([
    BookingStatus.APPROVED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
    BookingStatus.COMPLETED,
  ])
  status: BookingStatus;
}
