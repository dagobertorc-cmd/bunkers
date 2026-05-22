const router  = require('express').Router();
const ctrl    = require('../controllers/movimientos.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');
const upload  = require('../middlewares/upload.middleware');

router.use(verifyToken);
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/',
  requireRoles('SUPERADMIN','ADMIN','INGENIERO'),
  upload.single('foto_evidencia'),
  ctrl.crear
);

module.exports = router;
