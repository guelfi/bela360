import { Router } from 'express';
import { adminBusinessesController } from './admin-businesses.controller';

const router: Router = Router();

router.get('/', (req, res, next) => adminBusinessesController.findAll(req, res, next));
router.get('/:id', (req, res, next) => adminBusinessesController.findOne(req, res, next));

export { router as adminBusinessesRoutes };
