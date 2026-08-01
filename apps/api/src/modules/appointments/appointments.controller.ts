import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { appointmentsService } from './appointments.service';
import { NotFoundError } from '../../common/errors';

const createAppointmentSchema = z.object({
  clientId: z.string().cuid(),
  professionalId: z.string().cuid(),
  serviceId: z.string().cuid(),
  startTime: z.string().datetime().transform(val => new Date(val)),
  notes: z.string().max(500).optional(),
});

const updateAppointmentSchema = z.object({
  professionalId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  startTime: z.string().datetime().transform(val => new Date(val)).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
});

const filtersSchema = z.object({
  startDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  professionalId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  clientId: z.string().cuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const availabilitySchema = z.object({
  professionalId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform(val => new Date(val)),
  serviceId: z.string().cuid(),
});

export class AppointmentsController {
  /**
   * Create appointment
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const data = createAppointmentSchema.parse(req.body);
      const appointment = await appointmentsService.create({ businessId, ...data });

      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all appointments
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const { page, limit, ...filters } = filtersSchema.parse(req.query);

      // PROFESSIONAL só enxerga a própria agenda - ignora qualquer
      // professionalId vindo da query e forca o proprio id.
      if (req.user!.role === 'PROFISSIONAL') {
        filters.professionalId = req.user!.userId;
      }

      const result = await appointmentsService.getAll(businessId, filters, page, limit);

      res.json({
        success: true,
        data: result.appointments,
        pagination: {
          page,
          limit,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get appointment by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await appointmentsService.getById(id, req.user!.businessId);
      this.assertProfessionalOwnership(req, appointment.professionalId);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PROFESSIONAL só pode ver/agir sobre a própria agenda - trata como
   * "não encontrado" (mesmo padrão de IDOR entre negócios) em vez de 403,
   * pra não revelar que o agendamento existe em outra agenda.
   */
  private assertProfessionalOwnership(req: Request, professionalId: string): void {
    if (req.user!.role === 'PROFISSIONAL' && professionalId !== req.user!.userId) {
      throw new NotFoundError('Agendamento');
    }
  }

  /**
   * Mesma checagem, mas buscando o agendamento primeiro - usado nas
   * ações que não retornam o professionalId de graça antes de agir.
   * Só faz a query extra quando o papel é PROFESSIONAL.
   */
  private async assertProfessionalOwnershipById(req: Request, id: string): Promise<void> {
    if (req.user!.role !== 'PROFISSIONAL') return;
    const appointment = await appointmentsService.getById(id, req.user!.businessId);
    this.assertProfessionalOwnership(req, appointment.professionalId);
  }

  /**
   * Update appointment
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateAppointmentSchema.parse(req.body);
      await this.assertProfessionalOwnershipById(req, id);
      const appointment = await appointmentsService.update(id, req.user!.businessId, data);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm appointment
   */
  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.assertProfessionalOwnershipById(req, id);
      const appointment = await appointmentsService.confirm(id, req.user!.businessId);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel appointment
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await this.assertProfessionalOwnershipById(req, id);
      const appointment = await appointmentsService.cancel(id, req.user!.businessId, reason);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete appointment
   */
  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.assertProfessionalOwnershipById(req, id);
      const appointment = await appointmentsService.complete(id, req.user!.businessId);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark as no-show
   */
  async noShow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.assertProfessionalOwnershipById(req, id);
      const appointment = await appointmentsService.noShow(id, req.user!.businessId);

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get availability
   */
  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const { professionalId, date, serviceId } = availabilitySchema.parse(req.query);

      const slots = await appointmentsService.getAvailability(
        businessId,
        professionalId,
        date,
        serviceId
      );

      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get today's appointments
   */
  async getToday(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.businessId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await appointmentsService.getAll(
        businessId,
        {
          startDate: today,
          endDate: tomorrow,
          professionalId: req.user!.role === 'PROFISSIONAL' ? req.user!.userId : undefined,
        },
        1,
        100
      );

      res.json({
        success: true,
        data: result.appointments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentsController = new AppointmentsController();
