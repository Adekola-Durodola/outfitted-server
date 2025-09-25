import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(); // No auth header, continue without user

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secret',
      });
      // attach to request
      (req as any).user = { id: payload.sub };
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
    next();
  }
}
