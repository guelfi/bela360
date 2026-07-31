import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../../common/errors';
import { appointmentsService } from './appointments.service';

const mockPrisma = vi.hoisted(() => ({
  service: {
    findUnique: vi.fn(),
  },
  appointment: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('../../config', () => ({
  prisma: mockPrisma,
  logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

vi.mock('../whatsapp/whatsapp.queue', () => ({
  reminderQueue: { add: vi.fn(), remove: vi.fn() },
  sendQueue: { add: vi.fn() },
}));

vi.mock('../clients/clients.service', () => ({
  clientsService: { updateStats: vi.fn() },
}));

const mockService = { id: 'service-1', businessId: 'biz-1', duration: 60, name: 'Corte' };

const mockAppointment = {
  id: 'apt-1',
  businessId: 'biz-1',
  clientId: 'client-1',
  professionalId: 'prof-1',
  serviceId: 'service-1',
  startTime: new Date('2026-08-01T10:00:00Z'),
  endTime: new Date('2026-08-01T11:00:00Z'),
  status: 'PENDING',
  client: { id: 'client-1', name: 'Maria Silva', phone: '11999999999' },
  professional: { id: 'prof-1', name: 'Ana' },
  service: mockService,
  business: { id: 'biz-1', name: 'Salao Demo' },
};

describe('AppointmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates an appointment when the service exists and there is no conflict', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockPrisma.appointment.findFirst.mockResolvedValue(null); // no conflict
      mockPrisma.appointment.create.mockResolvedValue(mockAppointment);

      const result = await appointmentsService.create({
        businessId: 'biz-1',
        clientId: 'client-1',
        professionalId: 'prof-1',
        serviceId: 'service-1',
        startTime: new Date('2026-08-01T10:00:00Z'),
      });

      expect(result).toEqual(mockAppointment);
      expect(mockPrisma.appointment.create).toHaveBeenCalled();
    });

    it('throws a 404 AppError when the service does not exist', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(
        appointmentsService.create({
          businessId: 'biz-1',
          clientId: 'client-1',
          professionalId: 'prof-1',
          serviceId: 'missing-service',
          startTime: new Date('2026-08-01T10:00:00Z'),
        })
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
    });

    it('throws a 409 AppError when the professional already has an appointment at that time', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment); // conflict found

      await expect(
        appointmentsService.create({
          businessId: 'biz-1',
          clientId: 'client-1',
          professionalId: 'prof-1',
          serviceId: 'service-1',
          startTime: new Date('2026-08-01T10:00:00Z'),
        })
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('returns the appointment when it belongs to the business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);

      const result = await appointmentsService.getById('apt-1', 'biz-1');

      expect(result).toEqual(mockAppointment);
    });

    it('throws a 404 AppError when the appointment does not exist for this business (IDOR guard)', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(appointmentsService.getById('apt-1', 'other-biz')).rejects.toThrow(AppError);
      await expect(appointmentsService.getById('apt-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('confirm', () => {
    it('confirms an appointment owned by the business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.update.mockResolvedValue({ ...mockAppointment, status: 'CONFIRMED' });

      const result = await appointmentsService.confirm('apt-1', 'biz-1');

      expect(result.status).toBe('CONFIRMED');
    });

    it('throws a 404 AppError when trying to confirm an appointment from another business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(appointmentsService.confirm('apt-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('cancels an appointment owned by the business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.update.mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' });

      const result = await appointmentsService.cancel('apt-1', 'biz-1', 'Cliente desmarcou');

      expect(result.status).toBe('CANCELLED');
    });

    it('throws a 404 AppError when trying to cancel an appointment from another business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(appointmentsService.cancel('apt-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('marks an appointment owned by the business as completed', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.update.mockResolvedValue({ ...mockAppointment, status: 'COMPLETED' });

      const result = await appointmentsService.complete('apt-1', 'biz-1');

      expect(result.status).toBe('COMPLETED');
    });

    it('throws a 404 AppError when trying to complete an appointment from another business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(appointmentsService.complete('apt-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
    });
  });

  describe('noShow', () => {
    it('marks an appointment owned by the business as no-show', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.update.mockResolvedValue({ ...mockAppointment, status: 'NO_SHOW' });

      const result = await appointmentsService.noShow('apt-1', 'biz-1');

      expect(result.status).toBe('NO_SHOW');
    });

    it('throws a 404 AppError when trying to mark an appointment from another business', async () => {
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(appointmentsService.noShow('apt-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
    });
  });
});
