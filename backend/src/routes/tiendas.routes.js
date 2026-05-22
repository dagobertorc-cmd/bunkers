const router = require('express').Router();
const ctrl   = require('../controllers/tiendas.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/',      requireRoles('SUPERADMIN','ADMIN'), ctrl.crear);
router.put('/:id',    requireRoles('SUPERADMIN','ADMIN'), ctrl.actualizar);
router.delete('/:id', requireRoles('SUPERADMIN','ADMIN'), ctrl.eliminar);

router.get('/:id/ingenieros',            requireRoles('SUPERADMIN','ADMIN','SUPERVISOR'), ctrl.ingenieros);
router.post('/:id/ingenieros',           requireRoles('SUPERADMIN','ADMIN'), ctrl.asignarIngeniero);
router.delete('/:id/ingenieros/:userId', requireRoles('SUPERADMIN','ADMIN'), ctrl.desasignarIngeniero);

module.exports = router;
