import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../../common/errors';
import { clientsService } from './clients.service';

const mockPrisma = vi.hoisted(() => ({
  client: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  appointment: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  message: {
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../../config', () => ({
  prisma: mockPrisma,
  logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

const mockClient = {
  id: 'client-1',
  businessId: 'biz-1',
  name: 'Maria Silva',
  phone: '11999999999',
  email: null,
  totalAppointments: 0,
  totalSpent: '0',
};

describe('ClientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrGet', () => {
    it('creates a new client when the phone is not registered yet', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);
      mockPrisma.client.create.mockResolvedValue(mockClient);

      const result = await clientsService.createOrGet({
        businessId: 'biz-1',
        name: 'Maria Silva',
        phone: '(11) 99999-9999',
      });

      expect(result).toEqual(mockClient);
      expect(mockPrisma.client.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ phone: '11999999999' }) })
      );
    });

    it('returns the existing client for a known phone instead of creating a duplicate', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await clientsService.createOrGet({
        businessId: 'biz-1',
        name: 'Maria Silva',
        phone: '11999999999',
      });

      expect(result).toEqual(mockClient);
      expect(mockPrisma.client.create).not.toHaveBeenCalled();
    });

    it('fills in the real name when the existing client only had the auto-generated placeholder', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({ ...mockClient, name: 'Novo Cliente' });
      mockPrisma.client.update.mockResolvedValue({ ...mockClient, name: 'Maria Silva' });

      const result = await clientsService.createOrGet({
        businessId: 'biz-1',
        name: 'Maria Silva',
        phone: '11999999999',
      });

      expect(result.name).toBe('Maria Silva');
      expect(mockPrisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: { name: 'Maria Silva' },
      });
    });
  });

  describe('getAll', () => {
    it('returns clients scoped to the business with pagination', async () => {
      mockPrisma.client.findMany.mockResolvedValue([mockClient]);
      mockPrisma.client.count.mockResolvedValue(1);

      const result = await clientsService.getAll('biz-1', {}, 1, 20);

      expect(result).toEqual({ clients: [mockClient], total: 1, pages: 1 });
      expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { businessId: 'biz-1' } })
      );
    });
  });

  describe('getById', () => {
    it('returns the client when it belongs to the business', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await clientsService.getById('client-1', 'biz-1');

      expect(result).toEqual(mockClient);
      expect(mockPrisma.client.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'client-1', businessId: 'biz-1' } })
      );
    });

    it('throws a 404 AppError when the client does not exist for this business (IDOR guard)', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(clientsService.getById('client-1', 'other-biz')).rejects.toThrow(AppError);
      await expect(clientsService.getById('client-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates a client owned by the business', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.client.update.mockResolvedValue({ ...mockClient, name: 'Maria Santos' });

      const result = await clientsService.update('client-1', 'biz-1', { name: 'Maria Santos' });

      expect(result.name).toBe('Maria Santos');
    });

    it('throws a 404 AppError when trying to update a client from another business', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(
        clientsService.update('client-1', 'other-biz', { name: 'Hack' })
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(mockPrisma.client.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes a client owned by the business, cascading related records in a transaction', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(mockClient);
      mockPrisma.$transaction.mockResolvedValue([]);

      await clientsService.delete('client-1', 'biz-1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('throws a 404 AppError when trying to delete a client from another business', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(clientsService.delete('client-1', 'other-biz')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
