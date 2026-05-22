const router = require('express').Router();
const ctrl   = require('../controllers/categorias.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',    ctrl.listar);
router.post('/',   requireRoles('SUPERADMIN','ADMIN'), ctrl.crear);
router.put('/:id', requireRoles('SUPERADMIN','ADMIN'), ctrl.actualizar);
router.delete('/:id', requireRoles('SUPERADMIN','ADMIN'), ctrl.eliminar);

module.exports = router;
