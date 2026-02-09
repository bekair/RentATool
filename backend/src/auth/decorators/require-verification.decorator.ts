import { SetMetadata } from '@nestjs/common';
import { VerificationTier } from '@prisma/client';
import { VERIFICATION_TIER_KEY } from '../guards/verification-tier.guard';

export const RequireVerification = (tier: VerificationTier) =>
    SetMetadata(VERIFICATION_TIER_KEY, tier);
