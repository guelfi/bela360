import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        businessId: string;
        role: UserRole;
      };
      // Populado pelo admin-auth.middleware.ts (modulo admin) - propriedade
      // separada de `user`, nunca coexistem na mesma requisicao. Sem
      // businessId de proposito: admin de plataforma nao pertence a um
      // tenant.
      platformAdmin?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
