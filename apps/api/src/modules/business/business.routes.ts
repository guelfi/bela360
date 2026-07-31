import { Router } from 'express';
import { businessController } from './business.controller';
import { requireRole } from '../../common/middleware/rbac.middleware';

const router: Router = Router();

// Configurações do negócio e gestão de profissionais: só OWNER/ADMIN.
// As rotas GET ficam abertas pra todo mundo autenticado (Agenda/Serviços
// precisam listar profissionais e horários de funcionamento).
const businessManager = requireRole('OWNER', 'ADMIN');

// Business routes
router.get('/', (req, res, next) => businessController.getCurrent(req, res, next));
router.put('/', businessManager, (req, res, next) => businessController.update(req, res, next));
router.post('/activate', businessManager, (req, res, next) => businessController.activate(req, res, next));

// Professional routes (precisam vir antes de '/:id', senao o Express
// trata 'professionals'/'hours' como valor de :id)
router.get('/professionals', (req, res, next) => businessController.getProfessionals(req, res, next));
router.post('/professionals', businessManager, (req, res, next) => businessController.addProfessional(req, res, next));
router.put('/professionals/:id', businessManager, (req, res, next) => businessController.updateProfessional(req, res, next));
router.delete('/professionals/:id', businessManager, (req, res, next) => businessController.removeProfessional(req, res, next));

// Working hours routes
router.get('/hours', (req, res, next) => businessController.getWorkingHours(req, res, next));
router.put('/hours', businessManager, (req, res, next) => businessController.setWorkingHours(req, res, next));

router.get('/:id', (req, res, next) => businessController.getById(req, res, next));

// Public onboarding (no auth required) - moved to separate public route
export const publicBusinessRoutes: Router = Router();
publicBusinessRoutes.post('/onboarding', (req, res, next) => businessController.create(req, res, next));

export { router as businessRoutes };
