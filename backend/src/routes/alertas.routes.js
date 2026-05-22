const router = require('express').Router();
const ctrl   = require('../controllers/alertas.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/',          ctrl.listar);
router.put('/:id/leer',  ctrl.marcarLeida);

module.exports = router;
