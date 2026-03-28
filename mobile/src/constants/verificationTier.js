import { VerificationTier } from '../generated/api-enums';

export const isVerifiedTier = (tier) => tier && tier !== VerificationTier.UNVERIFIED;
