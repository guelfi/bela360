import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../../config';
import { AuthenticationError } from '../errors';

// O payload real do JWT emitido em auth.service.ts (TokenPayload) e
// { userId, businessId, role } - NAO { businessId, phone } como o tipo
// JWTPayload de @bela360/shared sugeria (tipo desatualizado, nao usado aqui
// de proposito). req.user ja esta tipado corretamente em types/express.d.ts.
interface DecodedToken {
  userId: string;
  businessId: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Extrai o token do cookie httpOnly (fonte primaria, usada pelo frontend
 * web) com fallback para o header Authorization: Bearer (scripts, testes,
 * chamadas server-to-server).
 */
function extractToken(req: Request): string {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AuthenticationError('Token não fornecido');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    throw new AuthenticationError('Token mal formatado');
  }

  return parts[1];
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    req.user = {
      userId: decoded.userId,
      businessId: decoded.businessId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Token inválido'));
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expirado'));
      return;
    }

    next(error);
  }
}
