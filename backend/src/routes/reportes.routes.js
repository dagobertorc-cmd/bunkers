const router = require('express').Router();
const ctrl   = require('../controllers/reportes.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.use(requireRoles('SUPERADMIN', 'ADMIN', 'SUPERVISOR'));

router.get('/inventario',    ctrl.inventario);
router.get('/movimientos',   ctrl.movimientos);
router.get('/stock-critico', ctrl.stockCritico);

module.exports = router;
