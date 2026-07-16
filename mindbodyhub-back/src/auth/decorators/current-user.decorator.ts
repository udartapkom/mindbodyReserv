import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/user-role.enum';

export type AuthUser = {
  id: string;
  phone: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
