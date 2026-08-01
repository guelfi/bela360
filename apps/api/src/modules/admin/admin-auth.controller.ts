import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { env } from '../../config';
import { adminAuthService } from './admin-auth.service';

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutos

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax' as const,
    maxAge: maxAgeMs,
    path: '/',
  };
}

function setAdminAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('admin_accessToken', accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE_MS));
  res.cookie('admin_refreshToken', refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE_MS));
}

function clearAdminAuthCookies(res: Response) {
  res.clearCookie('admin_accessToken', { path: '/' });
  res.clearCookie('admin_refreshToken', { path: '/' });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AdminAuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await adminAuthService.login(email, password);
      setAdminAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: { admin: result.admin } });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.admin_refreshToken;
      const result = await adminAuthService.refreshToken(token);
      setAdminAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: { message: 'Token renovado' } });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response) {
    clearAdminAuthCookies(res);
    res.json({ success: true, data: { message: 'Logout realizado com sucesso' } });
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await adminAuthService.getProfile(req.platformAdmin!.id);
      res.json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }
}

export const adminAuthController = new AdminAuthController();
