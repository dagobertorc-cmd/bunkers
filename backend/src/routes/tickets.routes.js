const router = require('express').Router();
const ctrl   = require('../controllers/tickets.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/',   requireRoles('SUPERADMIN','ADMIN','INGENIERO'), ctrl.crear);
router.put('/:id', requireRoles('SUPERADMIN','ADMIN','INGENIERO'), ctrl.actualizar);

module.exports = router;
