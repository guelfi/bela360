import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../../common/errors';
import { servicesService } from './services.service';

const mockPrisma = vi.hoisted(() => ({
  service: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  serviceProfessional: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
}));

vi.mock('../../config', () => ({
  prisma: mockPrisma,
  logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

const mockService = {
  id: 'service-1',
  businessId: 'biz-1',
  name: 'Corte Feminino',
  duration: 60,
  price: '80',
  isActive: true,
};

describe('ServicesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates a service when the name is not already used in the business', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(null);
      mockPrisma.service.create.mockResolvedValue(mockService);

      const result = await servicesService.create({
        businessId: 'biz-1',
        name: 'Corte Feminino',
        duration: 60,
        price: 80,
      });

      expect(result).toEqual(mockService);
    });

    it('throws a 409 AppError when a service with the same name already exists', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(mockService);

      await expect(
        servicesService.create({ businessId: 'biz-1', name: 'Corte Feminino', duration: 60, price: 80 })
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(mockPrisma.service.create).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('returns the service when it belongs to the business', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(mockService);

      const result = await servicesService.getById('service-1', 'biz-1');

      expect(result).toEqual(mockService);
    });

    it('throws a 404 AppError when the service does not exist for this business (IDOR guard)', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(null);

      await expect(servicesService.getById('service-1', 'other-biz')).rejects.toThrow(AppError);
      await expect(servicesService.getById('service-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates a service owned by the business', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(mockService);
      mockPrisma.service.update.mockResolvedValue({ ...mockService, price: '90' });

      const result = await servicesService.update('service-1', 'biz-1', { price: 90 });

      expect(result.price).toBe('90');
    });

    it('throws a 404 AppError when trying to update a service from another business', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(null);

      await expect(
        servicesService.update('service-1', 'other-biz', { price: 999 })
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });

    it('throws a 409 AppError when renaming to a name already used by another service', async () => {
      mockPrisma.service.findFirst
        .mockResolvedValueOnce(mockService) // ownership check
        .mockResolvedValueOnce({ id: 'other-service' }); // name collision check
      mockPrisma.service.findUnique.mockResolvedValue(mockService);

      await expect(
        servicesService.update('service-1', 'biz-1', { name: 'Corte Masculino' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('delete', () => {
    it('soft-deletes a service owned by the business by setting isActive to false', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(mockService);
      mockPrisma.service.update.mockResolvedValue({ ...mockService, isActive: false });

      await servicesService.delete('service-1', 'biz-1');

      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: 'service-1' },
        data: { isActive: false },
      });
    });

    it('throws a 404 AppError when trying to delete a service from another business', async () => {
      mockPrisma.service.findFirst.mockResolvedValue(null);

      await expect(servicesService.delete('service-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });
  });
});
