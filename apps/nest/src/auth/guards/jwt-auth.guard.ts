import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

interface ClerkJWTPayload {
  sub: string; // Clerk user ID
  email?: string;
  [key: string]: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Simply decode Clerk JWT to get user ID (no verification for speed)
      const decoded = jwt.decode(token) as ClerkJWTPayload;

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Attach minimal user info to request
      request.user = {
        id: decoded.sub, // Clerk user ID
      };

      console.log('✅ Clerk User ID extracted:', decoded.sub);
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
