import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.substring(7)
      : authorization;

    if (!token) {
      throw new UnauthorizedException('Token tidak valid');
    }

    const user = await this.authService.getUserBySessionToken(token);

    if (!user) {
      throw new UnauthorizedException('Session tidak valid atau sudah expired');
    }

    // Attach user to request object
    (request as any).user = user;

    return true;
  }
}
