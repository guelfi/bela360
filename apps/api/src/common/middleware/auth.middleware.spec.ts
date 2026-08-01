import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth.middleware';
import { env } from '../../config';

function buildToken(payload: object, secret = env.JWT_SECRET, expiresIn: string | number = '1h') {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
}

function buildReq(overrides: Partial<Request> = {}): Request {
  return {
    cookies: {},
    headers: {},
    ...overrides,
  } as unknown as Request;
}

describe('authMiddleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn() as unknown as NextFunction;
  });

  it('populates req.user from a valid cookie token', () => {
    const token = buildToken({ userId: 'user-1', businessId: 'biz-1', role: 'PROPRIETARIO' });
    const req = buildReq({ cookies: { accessToken: token } });

    authMiddleware(req, {} as Response, next);

    expect(req.user).toEqual({ userId: 'user-1', businessId: 'biz-1', role: 'PROPRIETARIO' });
    expect(next).toHaveBeenCalledWith();
  });

  it('falls back to the Authorization header when there is no cookie', () => {
    const token = buildToken({ userId: 'user-2', businessId: 'biz-2', role: 'PROFISSIONAL' });
    const req = buildReq({ headers: { authorization: `Bearer ${token}` } });

    authMiddleware(req, {} as Response, next);

    expect(req.user).toEqual({ userId: 'user-2', businessId: 'biz-2', role: 'PROFISSIONAL' });
    expect(next).toHaveBeenCalledWith();
  });

  it('prefers the cookie over the Authorization header when both are present', () => {
    const cookieToken = buildToken({ userId: 'cookie-user', businessId: 'biz-1', role: 'PROPRIETARIO' });
    const headerToken = buildToken({ userId: 'header-user', businessId: 'biz-1', role: 'PROPRIETARIO' });
    const req = buildReq({
      cookies: { accessToken: cookieToken },
      headers: { authorization: `Bearer ${headerToken}` },
    });

    authMiddleware(req, {} as Response, next);

    expect(req.user?.userId).toBe('cookie-user');
  });

  it('calls next with AuthenticationError when no token is provided', () => {
    const req = buildReq();

    authMiddleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(error.message).toBe('Token não fornecido');
    expect(error.statusCode).toBe(401);
  });

  it('calls next with AuthenticationError when the Authorization header is malformed', () => {
    const req = buildReq({ headers: { authorization: 'NotBearer sometoken' } });

    authMiddleware(req, {} as Response, next);

    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(error.message).toBe('Token mal formatado');
  });

  it('calls next with AuthenticationError when the token signature is invalid', () => {
    const token = buildToken({ userId: 'user-1', businessId: 'biz-1', role: 'PROPRIETARIO' }, 'a-completely-different-secret-key-value');
    const req = buildReq({ cookies: { accessToken: token } });

    authMiddleware(req, {} as Response, next);

    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(error.message).toBe('Token inválido');
  });

  it('calls next with AuthenticationError when the token is expired', () => {
    const token = buildToken({ userId: 'user-1', businessId: 'biz-1', role: 'PROPRIETARIO' }, env.JWT_SECRET, -10);
    const req = buildReq({ cookies: { accessToken: token } });

    authMiddleware(req, {} as Response, next);

    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(error.message).toBe('Token expirado');
  });
});
