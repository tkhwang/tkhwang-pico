import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { type RequestWithUser } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});

export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user?.id;
});

export const UserToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const [type, token] = (request.headers.authorization ?? '').split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : undefined;
  },
);
