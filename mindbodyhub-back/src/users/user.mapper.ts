import { User } from './entities/user.entity';
import { UserPublicProfile } from './user.types';

export function toPublicProfile(user: User): UserPublicProfile {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    tariff: user.tariff,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toAuthUserSummary(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    tariff: user.tariff,
    avatarUrl: user.avatarUrl,
  };
}
