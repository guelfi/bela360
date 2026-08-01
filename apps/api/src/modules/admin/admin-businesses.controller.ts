import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config';
import { NotFoundError } from '../../common/errors';

export class AdminBusinessesController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const businesses = await prisma.business.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          phone: true,
          email: true,
          type: true,
          status: true,
          createdAt: true,
          _count: { select: { users: true, clients: true, appointments: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: businesses });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await prisma.business.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          name: true,
          slug: true,
          phone: true,
          email: true,
          type: true,
          status: true,
          address: true,
          city: true,
          state: true,
          createdAt: true,
          users: { select: { id: true, name: true, email: true, role: true, isActive: true } },
          _count: { select: { users: true, clients: true, appointments: true, services: true } },
        },
      });
      if (!business) {
        throw new NotFoundError('Negócio não encontrado');
      }
      res.json({ success: true, data: business });
    } catch (error) {
      next(error);
    }
  }
}

export const adminBusinessesController = new AdminBusinessesController();
