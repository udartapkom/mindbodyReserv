import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/user-role.enum';
import { UserTariff } from '../../users/user-tariff.enum';

export type AuthUser = {
  id: string;
  phone: string;
  role: UserRole;
  tariff: UserTariff;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser | null }>();
    return request.user ?? null;
  },
);
