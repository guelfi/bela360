import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env, allowedOrigins, logger } from './config';
import { errorHandler } from './common/middleware';
import { whatsappRoutes } from './modules/whatsapp';
import { authRoutes } from './modules/auth';
import { businessRoutes, publicBusinessRoutes } from './modules/business';
import { servicesRoutes } from './modules/services';
import { clientsRoutes } from './modules/clients';
import { appointmentsRoutes } from './modules/appointments';
import { analyticsRoutes } from './modules/analytics';
import { automationRoutes } from './modules/automation';
import { waitlistRoutes } from './modules/waitlist';
import { financeRoutes } from './modules/finance';
import { marketingRoutes } from './modules/marketing';
import { loyaltyRoutes } from './modules/loyalty';
import { inventoryRoutes } from './modules/inventory';
import { professionalRoutes } from './modules/professional';
import { adminAuthRoutes, adminBusinessesRoutes, adminAuthMiddleware } from './modules/admin';
import { authMiddleware } from './common/middleware/auth.middleware';

// Create Express app
const app: Application = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Cookies (para o JWT em cookie httpOnly)
app.use(cookieParser());

// Mitigacao de CSRF: com o token em cookie httpOnly, requisicoes de
// mutacao vindas de outro site tambem enviariam o cookie automaticamente.
// SameSite=Lax ja bloqueia a maioria dos casos; isso complementa checando
// que o Origin (quando enviado, como sempre acontece em requisicoes de
// browser) bate com o frontend esperado. Requisicoes sem Origin (curl,
// server-to-server, webhook da Evolution API) nao sao afetadas - nao sao
// o vetor que CSRF explora.
app.use((req: Request, res: Response, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const origin = req.headers.origin;

  if (isMutation && origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({
      success: false,
      error: { code: 'INVALID_ORIGIN', message: 'Origem não permitida' },
    });
    return;
  }

  next();
});

// Rate limiting
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
      },
    },
  })
);

// Request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: req => req.url === '/api/health',
    },
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// Routes
// ============================================

// Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  // TODO: Add database and redis health checks
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      services: {
        api: 'running',
        database: 'connected', // TODO: Actually check
        redis: 'connected', // TODO: Actually check
        whatsapp: 'unknown', // TODO: Actually check
      },
    },
  });
});

// API info
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'bela360 API',
      version: process.env.npm_package_version || '0.1.0',
      description: 'Sistema de automação para negócios de beleza',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/business', publicBusinessRoutes);
app.use('/api/business', authMiddleware, businessRoutes);
app.use('/api/services', authMiddleware, servicesRoutes);
app.use('/api/appointments', authMiddleware, appointmentsRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/automation', authMiddleware, automationRoutes);
app.use('/api/waitlist', authMiddleware, waitlistRoutes);
app.use('/api/finance', authMiddleware, financeRoutes);
app.use('/api/marketing', authMiddleware, marketingRoutes);
app.use('/api/loyalty', authMiddleware, loyaltyRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/professional', authMiddleware, professionalRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/businesses', adminAuthMiddleware, adminBusinessesRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
