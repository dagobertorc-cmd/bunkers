const router = require('express').Router();

router.use('/auth',        require('./auth.routes'));
router.use('/usuarios',    require('./usuarios.routes'));
router.use('/bunkers',     require('./bunkers.routes'));
router.use('/tiendas',     require('./tiendas.routes'));
router.use('/productos',   require('./productos.routes'));
router.use('/categorias',  require('./categorias.routes'));
router.use('/inventario',  require('./inventario.routes'));
router.use('/movimientos', require('./movimientos.routes'));
router.use('/tickets',     require('./tickets.routes'));
router.use('/alertas',     require('./alertas.routes'));
router.use('/dashboard',   require('./dashboard.routes'));
router.use('/importar',    require('./importar.routes'));
router.use('/formatos',      require('./formatos.routes'));
router.use('/requisiciones', require('./requisiciones.routes'));
router.use('/reportes',      require('./reportes.routes'));

module.exports = router;
