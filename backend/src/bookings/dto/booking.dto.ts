import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { PreferredPickupWindow } from '@prisma/client';

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
  @IsString()
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}
