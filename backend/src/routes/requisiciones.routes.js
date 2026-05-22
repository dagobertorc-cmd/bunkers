const router = require('express').Router();
const ctrl   = require('../controllers/requisiciones.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/',           ctrl.listar);
router.get('/:id',        ctrl.obtener);
router.post('/',          ctrl.crear);
router.put('/:id',        requireRoles('SUPERADMIN','ADMIN','SUPERVISOR'), ctrl.actualizar);
router.post('/:id/cancelar', ctrl.cancelar);

module.exports = router;
