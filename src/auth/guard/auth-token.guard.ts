import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthTokenGard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.extractTokenFromHeader(request);
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }

  extractTokenFromHeader(request: Request) {
    const authorization = request.headers?.authorization;

    if (!authorization) {
      return undefined;
    }

    return authorization.split(' ')[1];
  }
}
