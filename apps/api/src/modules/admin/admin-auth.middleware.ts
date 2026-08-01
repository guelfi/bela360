import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { AuthenticationError } from '../../common/errors';

interface DecodedAdminToken {
  sub: string;
  email: string;
  type: 'platform_admin';
}

// Middleware paralelo ao authMiddleware de tenant - nao importa nem
// estende ele. Le um cookie com nome distinto (admin_accessToken) e
// verifica contra um secret dedicado (PLATFORM_ADMIN_JWT_SECRET), entao
// um token de tenant nunca e aceito aqui e vice-versa.
export function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const cookieToken = req.cookies?.admin_accessToken;
    const authHeader = req.headers.authorization;
    const token =
      cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

    if (!token) {
      throw new AuthenticationError('Token não fornecido');
    }

    const decoded = jwt.verify(token, env.PLATFORM_ADMIN_JWT_SECRET) as DecodedAdminToken;
    if (decoded.type !== 'platform_admin') {
      throw new AuthenticationError('Token inválido');
    }

    req.platformAdmin = { id: decoded.sub, email: decoded.email };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expirado'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Token inválido'));
      return;
    }
    next(error);
  }
}
