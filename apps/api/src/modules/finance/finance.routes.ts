import { Router } from 'express';
import { financeController } from './finance.controller';
import { requireRole } from '../../common/middleware/rbac.middleware';

const router: Router = Router();

// Financeiro geral: só OWNER/ADMIN (PROFESSIONAL e RECEPTIONIST não tem
// acesso, exceto as rotas /my/* logo abaixo, que são auto-escopadas).
const financeManager = requireRole('PROPRIETARIO', 'ADMINISTRADOR');

// Financial report
router.get('/report', financeManager, (req, res, next) => financeController.getFinancialReport(req, res, next));

// Commission configs
router.get('/commissions/configs', financeManager, (req, res, next) => financeController.getCommissionConfigs(req, res, next));
router.post('/commissions/configs', financeManager, (req, res, next) => financeController.setCommissionConfig(req, res, next));
router.delete('/commissions/configs/:id', financeManager, (req, res, next) => financeController.deleteCommissionConfig(req, res, next));

// Pending commissions
router.get('/commissions/pending', financeManager, (req, res, next) => financeController.getPendingCommissions(req, res, next));
router.get('/commissions/pending/:professionalId', financeManager, (req, res, next) => financeController.getPendingPaymentsForProfessional(req, res, next));

// Commission payouts
router.get('/commissions/payouts', financeManager, (req, res, next) => financeController.getCommissionPayouts(req, res, next));
router.get('/commissions/payouts/:id', financeManager, (req, res, next) => financeController.getCommissionPayoutDetails(req, res, next));
router.post('/commissions/payouts', financeManager, (req, res, next) => financeController.createCommissionPayout(req, res, next));
router.post('/commissions/payouts/:id/pay', financeManager, (req, res, next) => financeController.markPayoutAsPaid(req, res, next));
router.delete('/commissions/payouts/:id', financeManager, (req, res, next) => financeController.cancelCommissionPayout(req, res, next));

// Professional commission summary
router.get('/commissions/summary/:professionalId', financeManager, (req, res, next) => financeController.getProfessionalCommissionSummary(req, res, next));

// My commissions (for professionals to access their own data)
router.get('/my/commissions', (req, res, next) => financeController.getMyCommissions(req, res, next));
router.get('/my/commission-entries', (req, res, next) => financeController.getMyCommissionEntries(req, res, next));

// Professional earnings
router.get('/earnings/:professionalId', financeManager, (req, res, next) => financeController.getProfessionalEarnings(req, res, next));

// Cash register
router.get('/cash-register', financeManager, (req, res, next) => financeController.getCashRegister(req, res, next));
router.get('/cash-register/history', financeManager, (req, res, next) => financeController.getCashRegisterHistory(req, res, next));
router.post('/cash-register/close', financeManager, (req, res, next) => financeController.closeCashRegister(req, res, next));

// Payments
router.get('/payments', financeManager, (req, res, next) => financeController.getPayments(req, res, next));
router.post('/payments', financeManager, (req, res, next) => financeController.registerPayment(req, res, next));

export { router as financeRoutes };
