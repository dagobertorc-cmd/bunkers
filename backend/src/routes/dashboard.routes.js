const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/kpis',                requireRoles('SUPERADMIN','ADMIN','SUPERVISOR'), ctrl.kpis);
router.get('/consumo-bunker',      requireRoles('SUPERADMIN','ADMIN','SUPERVISOR'), ctrl.consumoPorBunker);
router.get('/top-productos',       requireRoles('SUPERADMIN','ADMIN','SUPERVISOR'), ctrl.topProductos);
router.get('/movimientos-recientes', ctrl.movimientosRecientes);

module.exports = router;
