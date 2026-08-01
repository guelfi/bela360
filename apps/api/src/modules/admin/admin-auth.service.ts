import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { AppError } from '../../common/errors';
import { platformAdminService } from './platform-admin.service';

interface AdminTokenPayload {
  sub: string;
  email: string;
  type: 'platform_admin';
}

export const adminAuthService = {
  async login(email: string, password: string) {
    const admin = await platformAdminService.findByEmail(email);
    if (!admin || !admin.isActive) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    await platformAdminService.updateLastLogin(admin.id);

    const payload: AdminTokenPayload = { sub: admin.id, email: admin.email, type: 'platform_admin' };
    const accessToken = jwt.sign(payload, env.PLATFORM_ADMIN_JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, env.PLATFORM_ADMIN_JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    };
  },

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, env.PLATFORM_ADMIN_JWT_REFRESH_SECRET) as AdminTokenPayload;
      if (payload.type !== 'platform_admin') {
        throw new AppError('Token inválido', 401);
      }

      const admin = await platformAdminService.findById(payload.sub);
      if (!admin || !admin.isActive) {
        throw new AppError('Administrador não encontrado ou inativo', 401);
      }

      const newPayload: AdminTokenPayload = { sub: admin.id, email: admin.email, type: 'platform_admin' };
      const accessToken = jwt.sign(newPayload, env.PLATFORM_ADMIN_JWT_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign(newPayload, env.PLATFORM_ADMIN_JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expirado', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Token inválido', 401);
      }
      throw error;
    }
  },

  async getProfile(adminId: string) {
    const admin = await platformAdminService.findById(adminId);
    if (!admin) {
      throw new AppError('Administrador não encontrado', 401);
    }
    const { passwordHash: _passwordHash, ...safe } = admin;
    return safe;
  },
};
