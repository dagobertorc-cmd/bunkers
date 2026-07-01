const router = require('express').Router();
const ctrl   = require('../controllers/inventario.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',        ctrl.listar);
router.get('/critico', ctrl.critico);
router.get('/crearh',  ctrl.creaerhInv);
router.post('/',       requireRoles('SUPERADMIN','ADMIN'), ctrl.agregar);
router.put('/:id',     requireRoles('SUPERADMIN','ADMIN'), ctrl.actualizar);

module.exports = router;
