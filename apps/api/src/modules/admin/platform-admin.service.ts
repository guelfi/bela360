import { prisma } from '../../config';

export const platformAdminService = {
  async findByEmail(email: string) {
    return prisma.platformAdmin.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.platformAdmin.findUnique({ where: { id } });
  },

  async updateLastLogin(id: string) {
    return prisma.platformAdmin.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },
};
