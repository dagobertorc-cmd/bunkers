const router = require('express').Router();
const ctrl   = require('../controllers/productos.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',              ctrl.listar);
router.get('/:id',           ctrl.obtener);
router.get('/:id/seriales',  ctrl.seriales);
router.post('/',             requireRoles('SUPERADMIN','ADMIN'), ctrl.crear);
router.put('/:id',           requireRoles('SUPERADMIN','ADMIN'), ctrl.actualizar);
router.delete('/:id',        requireRoles('SUPERADMIN','ADMIN'), ctrl.eliminar);

module.exports = router;
