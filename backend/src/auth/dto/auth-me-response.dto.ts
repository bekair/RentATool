import { VerificationTier } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProfileSummaryDto {
  @ApiPropertyOptional()
  displayName?: string | null;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;

  @ApiPropertyOptional()
  phoneCode?: string | null;

  @ApiPropertyOptional()
  phoneNumber?: string | null;
}

class AddressSummaryDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  label?: string | null;

  @ApiPropertyOptional()
  street?: string | null;

  @ApiPropertyOptional()
  city?: string | null;

  @ApiPropertyOptional()
  country?: string | null;
}

export class AuthMeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: VerificationTier })
  verificationTier: VerificationTier;

  @ApiPropertyOptional({ type: ProfileSummaryDto })
  profile?: ProfileSummaryDto | null;

  @ApiPropertyOptional({ type: [AddressSummaryDto] })
  addresses?: AddressSummaryDto[];
}
