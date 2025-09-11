import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const issuer = this.config.get<string>('CLERK_JWT_ISSUER'); // e.g. https://<your-subdomain>.clerk.accounts.dev
      const audience = this.config.get<string>('CLERK_JWT_AUDIENCE'); // your API audience if set
      if (!issuer)
        throw new UnauthorizedException(
          'Auth misconfigured: CLERK_JWT_ISSUER missing',
        );

      const jwks = createRemoteJWKSet(
        new URL(`${issuer}/.well-known/jwks.json`),
      );
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: audience || undefined,
      });
      if (!payload.sub)
        throw new UnauthorizedException('Token missing subject');
      request.user = { id: payload.sub };

      console.log('✅ Clerk User ID extracted:', payload.sub);
      return true;
    } catch (error) {
      console.error('❌ Token decode failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
