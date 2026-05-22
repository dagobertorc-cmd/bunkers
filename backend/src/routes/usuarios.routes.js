const router = require('express').Router();
const ctrl   = require('../controllers/usuarios.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',      requireRoles('SUPERADMIN','ADMIN'), ctrl.listar);
router.post('/',     requireRoles('SUPERADMIN','ADMIN'), ctrl.crear);
router.put('/:id',   requireRoles('SUPERADMIN','ADMIN'), ctrl.actualizar);
router.delete('/:id',requireRoles('SUPERADMIN'),         ctrl.desactivar);

module.exports = router;
