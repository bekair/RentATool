import { IsNotEmpty, IsString } from 'class-validator';

export class SetDefaultPaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId!: string;
}

