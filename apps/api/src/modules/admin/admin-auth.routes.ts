import { Router } from 'express';
import { adminAuthController } from './admin-auth.controller';
import { adminAuthMiddleware } from './admin-auth.middleware';

const router: Router = Router();

router.post('/login', (req, res, next) => adminAuthController.login(req, res, next));
router.post('/refresh', (req, res, next) => adminAuthController.refresh(req, res, next));
router.post('/logout', adminAuthMiddleware, (req, res) => adminAuthController.logout(req, res));
router.get('/me', adminAuthMiddleware, (req, res, next) => adminAuthController.me(req, res, next));

export { router as adminAuthRoutes };
