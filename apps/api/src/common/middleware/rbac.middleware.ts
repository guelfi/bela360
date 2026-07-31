import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthorizationError } from '../errors';

/**
 * Deve ser usado depois de authMiddleware (precisa de req.user ja
 * populado). Bloqueia o acesso se o papel do usuario autenticado nao
 * estiver na lista de papeis permitidos para a rota.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AuthorizationError('Você não tem permissão para acessar este recurso'));
      return;
    }
    next();
  };
}
