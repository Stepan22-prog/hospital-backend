import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayload } from '../types/auth.type';

export const CurrentUser = createParamDecorator(
  (data: keyof JWTPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user[data] : user;
  },
);
