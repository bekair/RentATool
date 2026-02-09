import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationTier } from '@prisma/client';

export const VERIFICATION_TIER_KEY = 'verificationTier';

@Injectable()
export class VerificationTierGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredTier = this.reflector.getAllAndOverride<VerificationTier>(
            VERIFICATION_TIER_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredTier) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const tierOrder = [
            VerificationTier.UNVERIFIED,
            VerificationTier.TIER_1,
            VerificationTier.TIER_2,
            VerificationTier.TIER_3,
        ];

        const userTierIndex = tierOrder.indexOf(user.verificationTier);
        const requiredTierIndex = tierOrder.indexOf(requiredTier);

        if (userTierIndex < requiredTierIndex) {
            throw new ForbiddenException(
                `This action requires ${requiredTier} verification tier`,
            );
        }

        return true;
    }
}
